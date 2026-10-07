#!/usr/bin/env python3
"""Use the public NVIDIA Kimodo service's official Viser message API.

The wire message classes and export implementation are published by NVIDIA in
nv-tlabs/kimodo-viser and nv-tlabs/kimodo. No browser automation, credential,
private endpoint, alternate encoder, or executable downloaded JavaScript is used.
"""
import asyncio
import base64
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import time

import msgspec
import requests
import websockets

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data/kimodo_text_oneleg"
PROMPT = "A humanoid robot stands on both feet, slowly shifts weight onto its left foot, raises the right foot, and balances steadily on the left leg."


class Client:
    def __init__(self, ws):
        self.ws = ws
        self.gui = {}
        self.timeline = {}
        self.events = []
        self.requests = []
        self.downloads = []

    async def send(self, message):
        self.requests.append({"elapsed_s": time.monotonic()-self.start, **message})
        await self.ws.send(msgspec.msgpack.encode(message))

    def consume(self, message):
        typ = message.get("type", "")
        if typ.startswith("Gui") or typ.startswith("Timeline") or "Notification" in typ:
            self.events.append({"elapsed_s": time.monotonic()-self.start, **message})
        if typ.startswith("Gui") and "props" in message:
            self.gui[message["uuid"]] = message.copy()
        elif typ == "GuiUpdateMessage" and message["uuid"] in self.gui:
            node = self.gui[message["uuid"]]
            node.setdefault("props", {}).update(message["updates"])
            if "value" in message["updates"]:
                node["value"] = message["updates"]["value"]
        elif typ == "GuiRemoveMessage":
            self.gui.pop(message["uuid"], None)
        if typ == "TimelineMessage":
            self.timeline = message
        if typ == "RunJavascriptMessage":
            # Read the official export's data literal. Never execute remote JS.
            source = message.get("source", "")
            b64 = re.search(r'const b64 = ("[^"]*");', source)
            name = re.search(r'const filename = ("[^"]*");', source)
            if b64 and name:
                payload = base64.b64decode(json.loads(b64.group(1)), validate=True)
                filename = Path(json.loads(name.group(1))).name
                (OUT / filename).write_bytes(payload)
                self.downloads.append({"filename": filename, "bytes": len(payload),
                                       "sha256": hashlib.sha256(payload).hexdigest()})
                print("downloaded", filename, len(payload), flush=True)

    async def collect(self, seconds=1):
        end = time.monotonic()+seconds
        while time.monotonic() < end:
            try:
                packet = await asyncio.wait_for(self.ws.recv(), timeout=end-time.monotonic())
            except asyncio.TimeoutError:
                break
            decoded = msgspec.msgpack.decode(packet)
            for message in decoded.get("messages", []):
                self.consume(message)

    def control(self, label, typ=None):
        nodes = [x for x in self.gui.values() if x.get("props", {}).get("label") == label
                 and (typ is None or x["type"] == typ)]
        if not nodes:
            raise RuntimeError("Official control not present: " + label)
        return max(nodes, key=lambda x: x["props"].get("order", 0))

    async def update(self, label, value, typ=None):
        node = self.control(label, typ)
        if not node["props"].get("visible", True) or node["props"].get("disabled", False):
            raise RuntimeError("Official control is not exposed/enabled: " + label)
        await self.send({"type": "GuiUpdateMessage", "uuid": node["uuid"], "updates": {"value": value}})
        await self.collect(.3)

    async def button(self, label):
        await self.update(label, True, "GuiButtonMessage")


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    info = requests.get("https://huggingface.co/api/spaces/nvidia/Kimodo", timeout=20).json()
    model_info = requests.get("https://huggingface.co/api/models/nvidia/Kimodo-G1-RP-v1", timeout=20).json()
    metadata = {"started_utc": datetime.now(timezone.utc).isoformat(),
                "official_promotional_site": "https://research.nvidia.com/labs/sil/projects/kimodo/",
                "official_demo": "https://huggingface.co/spaces/nvidia/Kimodo",
                "space_commit": info.get("sha"), "space_runtime": info.get("runtime"),
                "model_name_requested": "nvidia/Kimodo-G1-RP-v1",
                "public_model_revision_at_request": model_info.get("sha"),
                "remote_checkpoint_exact_file_hash": None,
                "remote_revision_caveat": "Space requirements install Git main and do not expose runtime model file hashes; public model revision is a registry observation, not proof of server cache revision.",
                "prompt": PROMPT, "text_guidance": 2., "constraint_guidance": 0.,
                "seed": 14, "denoising_steps": 100, "duration_s": 6., "frames": 180,
                "num_samples": 1, "constraints": [], "real_robot_rotations": True,
                "post_processing": False,
                "local_hf_token_configured": False, "local_llama_config_request_http_status": 401,
                "transport": "public official Viser WebSocket message API, protocolviser-v1.0.16",
                "no_authentication_bypass": True, "no_alternate_text_encoder": True,
                "new_text_clip_is_not_existing_validated_policy_reference": True,
                "client_source_sha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
    (OUT / "request.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2)+"\n")
    async with websockets.connect("wss://nvidia-kimodo.hf.space/", subprotocols=["viser-v1.0.16"],
                                  max_size=100_000_000, open_timeout=30) as ws:
        c = Client(ws)
        c.start = time.monotonic()
        try:
            await c.send({"type": "ViewerCameraMessage", "wxyz": [1., 0., 0., 0.],
                          "position": [0., 1., 3.], "fov": 1., "near": .01, "far": 1000.,
                          "image_height": 800, "image_width": 1000,
                          "look_at": [0., 1., 0.], "up_direction": [0., 1., 0.]})
            await c.collect(3)
            await c.button("Start Demo")
            await c.update("Model", "Unitree G1 Humanoid Robot", "GuiDropdownMessage")
            await c.button("Load model")
            await c.collect(5)
            model_labels = [x["props"].get("_markdown", "") for x in c.gui.values()
                            if x["type"] == "GuiMarkdownMessage"]
            assert any("Kimodo-G1-RP-v1" in x for x in model_labels), model_labels[:2]
            await c.button("Clear All Constraints")
            prompt = c.timeline["prompts"][0]
            assert len(c.timeline["prompts"]) == 1
            await c.send({"type": "TimelinePromptUpdateMessage", "prompt_id": prompt["uuid"], "new_text": PROMPT})
            await c.send({"type": "TimelinePromptResizeMessage", "prompt_id": prompt["uuid"], "new_start_frame": 0, "new_end_frame": 179})
            await c.collect(.5)
            for label, value in (("Seed", 14), ("Denoising Steps", 100), ("Text Weight", 2.), ("Constraint Weight", 0.), ("Real robot rotations", True)):
                await c.update(label, value)
            metadata["actual_gui_before_generation"] = list(c.gui.values())
            metadata["actual_timeline_before_generation"] = c.timeline
            metadata["actual_model_labels"] = model_labels
            print("Submitting officialG1 text-conditioned generation", flush=True)
            await c.button("Generate")
            for _ in range(70):
                await c.collect(2)
                statuses = [json.dumps(x, ensure_ascii=False) for x in c.events[-30:]]
                if any("Generation failed!" in s for s in statuses):
                    raise RuntimeError("Official service returned generation failure")
                if any("Motion generation finished!" in s for s in statuses):
                    break
            else:
                raise TimeoutError("No successful generation confirmation within140seconds")
            metadata["generation_success_confirmed_by_server"] = True
            for fmt in ("NPZ", "CSV"):
                await c.update("Name", "oneleg_text_00", "GuiTextMessage")
                await c.update("Format", fmt, "GuiDropdownMessage")
                await c.button("Download")
                await c.collect(3)
                assert any(x["filename"].endswith("."+fmt.lower()) for x in c.downloads)
            metadata["status"] = "official_text_conditioned_motion_generated_and_exported"
            metadata["downloads"] = c.downloads
            print(json.dumps({"status": metadata["status"], "downloads": c.downloads}), flush=True)
        except Exception as exc:
            metadata["status"] = "attempt_failed"
            metadata["error_class"] = type(exc).__name__
            metadata["error"] = str(exc)
            raise
        finally:
            metadata["elapsed_session_s"] = time.monotonic()-c.start
            metadata["finished_utc"] = datetime.now(timezone.utc).isoformat()
            (OUT / "attempt_metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2)+"\n")
            (OUT / "protocol_requests.json").write_text(json.dumps(c.requests, ensure_ascii=False, indent=2)+"\n")
            (OUT / "official_service_events.json").write_text(json.dumps(c.events, ensure_ascii=False, indent=2)+"\n")


if __name__ == "__main__":
    asyncio.run(main())

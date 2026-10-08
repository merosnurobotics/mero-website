import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import postcss from "postcss";
import { simulationLessons } from "../src/lib/education/simulation-catalog.ts";
import { deepMLLessons } from "../src/lib/education/deepml-catalog.ts";

const skill = process.env.ANSWER_HTML_SKILL_DIR || resolve(homedir(), ".codex/skills/answer-me-with-html");
const sourceRoot = resolve(".local/research/spinningup-license-audit");
const upstream = "038665d62d569055401d91856abb287263096178";
const working = resolve(".local/deepml");
const assets = resolve("private/education-assets/deepml");
await mkdir(working, { recursive: true });
await mkdir(assets, { recursive: true });
const generated = {};
const hashes = {};
function renderStrong(html) {
  let rawDepth = 0;
  return html.replace(/<[^>]+>|[^<]+/g, token => {
    if (token.startsWith("<")) {
      if (/^<\/(?:pre|code|svg)\b/.test(token)) rawDepth--;
      else if (/^<(?:pre|code|svg)\b/.test(token)) rawDepth++;
      return token;
    }
    return rawDepth ? token : token.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  });
}
// Keep the skill's image placement, but serve animations separately and respect reduced motion.
const animatedAssets = await Promise.all(["pendulum", "inverted-pendulum"].map(async name => ({
  embedded: `data:image/gif;base64,${(await readFile(resolve(`private/education-assets/simulation/${name}.gif`))).toString("base64")}`,
  gif: `/education-assets/simulation/${name}.gif`,
  still: `/education-assets/simulation/${name}-at-1.0s.png`,
})));
function adaptAnimations(html) {
  for (const asset of animatedAssets) {
    html = html.replaceAll(`src="${asset.embedded}"`, `src="${asset.gif}"`);
    html = html.replace(/<img\b[^>]*>/g, tag => tag.includes(`src="${asset.gif}"`)
      ? `<picture><source media="(prefers-reduced-motion: reduce)" srcset="${asset.still}">${tag}</picture>` : tag);
  }
  return html;
}
let sharedStyle;
for (const lesson of [...deepMLLessons, ...simulationLessons]) {
  const draft = resolve(`content/education/${simulationLessons.some(item => item.slug === lesson.slug) ? "simulation" : "deepml"}/${lesson.slug}.md`);
  const output = resolve(working, `${lesson.slug}.html`);
  const run = spawnSync(process.execPath, [resolve(skill, "scripts/am.mjs"), "render", draft, "-o", output, "--no-open"], { encoding: "utf8" });
  if (run.error || run.status !== 0) throw new Error(run.error?.message || run.stderr || run.stdout);
  process.stdout.write(run.stdout);
  process.stderr.write(run.stderr);
  const html = await readFile(output, "utf8");
  const draftText = await readFile(draft, "utf8");
  let mobileHtml = html;
  if (draftText.includes("```flow LR")) {
    const mobileDraft = resolve(working, `${lesson.slug}-mobile.md`);
    const mobileOutput = resolve(working, `${lesson.slug}-mobile.html`);
    await writeFile(mobileDraft, draftText.replaceAll("```flow LR", "```flow TB"));
    const mobileRun = spawnSync(process.execPath, [resolve(skill, "scripts/am.mjs"), "render", mobileDraft, "-o", mobileOutput, "--no-open"], { encoding: "utf8" });
    if (mobileRun.status !== 0) throw new Error(mobileRun.stderr || mobileRun.stdout);
    mobileHtml = await readFile(mobileOutput, "utf8");
  }
  const mobilePanels = [...mobileHtml.matchAll(/<section class="am-panel" id="panel-[^"]+">([\s\S]*?)<\/section>/g)];
  const panels = [...html.matchAll(/<section class="am-panel" id="panel-[^"]+">([\s\S]*?)<\/section>/g)];
  if (panels.length !== lesson.chapters.length) throw new Error(`Unexpected chapter count for ${lesson.slug}: ${panels.length}`);
  generated[lesson.slug] = panels.map((panel, index) => {
    const title = panel[1].match(/<h2>([\s\S]*?)<\/h2>/)?.[1];
    const body = panel[1].match(/<div class="am-panel-body">([\s\S]*)<\/div>\s*$/)?.[1];
    if (!title || !body) throw new Error(`Missing content for ${lesson.slug}`);
    // Retain the skill's static layouts; omit controls that require its standalone JS.
    let diagramIndex = 0;
    const mobileFigures = [...mobilePanels[index][1].matchAll(/<figure class="am-diagram[^"]*"[\s\S]*?<\/figure>/g)].map(match => match[0]);
    const responsiveBody = mobileHtml === html ? body : body.replace(/<figure class="am-diagram[^"]*"[\s\S]*?<\/figure>/g, desktop => {
      const mobile = mobileFigures[diagramIndex++];
      if (!mobile) throw new Error("Missing mobile diagram");
      const mobileUnique = mobile.replaceAll(/am(\d+)-/g, "am-mobile$1-");
      return desktop.replace('class="am-diagram', 'class="am-diagram am-flow-desktop') + mobileUnique.replace('class="am-diagram', 'class="am-diagram am-flow-mobile');
    });
    const content = adaptAnimations(renderStrong(responsiveBody.replace(/<button\b[\s\S]*?<\/button>/g, "")));
    if (/<script\b|<iframe\b|\bon\w+=/i.test(content)) throw new Error("Unexpected executable content");
    return { id: lesson.chapters[index].id, title, html: content };
  });
  hashes[lesson.slug] = createHash("sha256").update(await readFile(draft)).digest("hex");
  if (!sharedStyle) sharedStyle = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(match => match[1]).join("\n");
}
const css = postcss.parse(sharedStyle);
css.walkRules(rule => {
  if (rule.parent.type === "atrule" && /keyframes$/.test(rule.parent.name)) return;
  rule.selectors = rule.selectors.map(selector => {
    const trimmed = selector.trim();
    if (/^(html|body|:root)(?=[\s[.:#]|$)/.test(trimmed)) return trimmed.replace(/^(html|body|:root)/, ".deepml-content").replaceAll("data-theme", "data-am-theme").replaceAll("data-mode", "data-am-mode");
    return `.deepml-content ${trimmed}`;
  });
});
await mkdir(resolve("src/lib/education/generated"), { recursive: true });
await writeFile(resolve("src/lib/education/generated/deepml.json"), JSON.stringify(generated, null, 2) + "\n");
await writeFile(resolve("src/app/education/deepml.generated.css"), `/* Generated by scripts/build-deepml.mjs. */\n${css.toString()}`);
const license = await readFile(resolve(sourceRoot, "LICENSE"), "utf8");
await copyFile(resolve(sourceRoot, "LICENSE"), resolve(assets, "SPINNINGUP-LICENSE.txt"));
await writeFile(resolve("src/lib/education/generated/spinningup-license.json"), JSON.stringify({ upstream, license }, null, 2) + "\n");
const sourceFiles = ["docs/spinningup/rl_intro.rst", "docs/spinningup/rl_intro2.rst", "docs/algorithms/ppo.rst", "LICENSE"];
const sourceSha256 = {};
for (const file of sourceFiles) sourceSha256[file] = createHash("sha256").update(await readFile(resolve(sourceRoot, file))).digest("hex");
await writeFile(resolve(assets, "provenance.json"), JSON.stringify({ upstream: `https://github.com/openai/spinningup/tree/${upstream}`, sourceSha256, draftSha256: hashes,
  scope: "RL terminology and selected policy/PPO explanations translated and adapted; DL foundations and club examples added by MERO. No full translation or third-party media redistribution." }, null, 2) + "\n");
console.log("Built eight introductory lessons and preserved the upstream MIT notice.");

const sourceNotices = {};
for (const [name, licenseFile, licenseName, title, url, original] of [
  ["mujoco", "LICENSE", "Apache-2.0", "MuJoCo", "https://mujoco.readthedocs.io/en/stable/overview.html", "Google DeepMind / MuJoCo contributors"],
  ["gymnasium", "LICENSE", "MIT", "Gymnasium Basic Usage", "https://gymnasium.farama.org/introduction/basic_usage/", "OpenAI / Farama Foundation"],
  ["ros2-docs", "LICENSE", "CC BY 4.0", "ROS 2 URDF Tutorial", "https://docs.ros.org/en/humble/Tutorials/Intermediate/URDF/Building-a-Visual-Robot-Model-with-URDF-from-Scratch.html", "ROS 2 documentation contributors"],
  ["modernrobotics", "LICENSE", "MIT", "Modern Robotics code", "https://github.com/NxRLab/ModernRobotics", "NxRLab"],
  ["huggingface", "LICENSE.md", "Apache-2.0", "Hugging Face Deep RL Course", "https://huggingface.co/learn/deep-rl-course/en/unit1/rl-framework", "Hugging Face / course contributors"],
]) {
  const root = resolve(".local/research/intro-sources", name);
  const version = JSON.parse(await readFile(resolve(root, "version.json"), "utf8"));
  const text = await readFile(resolve(root, licenseFile), "utf8");
  sourceNotices[name] = { ...version, title, url, original, licenseName, license: text, licenseUrl: `https://github.com/${version.repo}/blob/${version.sha}/${licenseFile}` };
  await writeFile(resolve(assets, `${name}-LICENSE.txt`), text);
}
const mlRoot = resolve(".local/research/ManimML");
const mlSha = spawnSync("git", ["-C", mlRoot, "rev-parse", "HEAD"], {encoding:"utf8"}).stdout.trim();
sourceNotices.manimml = {title:"ManimML", url:"https://github.com/helblazer811/ManimML", original:"Alec Helbling", licenseName:"MIT", license:await readFile(resolve(mlRoot,"LICENSE.md"),"utf8"), licenseUrl:`https://github.com/helblazer811/ManimML/blob/${mlSha}/LICENSE.md`, sha:mlSha};
await writeFile(resolve("src/lib/education/generated/source-notices.json"), JSON.stringify(sourceNotices,null,2)+"\n");

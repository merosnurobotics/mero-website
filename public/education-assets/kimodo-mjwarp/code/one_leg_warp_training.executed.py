"""Separate MuJoCo-Warp port of the native one-leg task.

Uses the unchanged ideal position actuator XML, actual contact forces, and the
native 70-observation/19-action contract. Native MuJoCo supplies offline reset
and reference construction only; every rollout integration is MuJoCo-Warp.
The floating root is written only during reset. Float32 GPU solver differences
are measured explicitly; this is not a claim of bit-identical CPU dynamics.
"""
from __future__ import annotations

import json
import math
import time
from pathlib import Path

import mujoco
import mujoco_warp as mw
import numpy as np
import torch
import warp as wp
from torch import nn

from .one_leg import ActorCritic, OneLegEnv, load_policy, save_checkpoint, sha256


@wp.kernel
def _sum_contact_loads(nacon: wp.array(dtype=wp.int32),
                       geom: wp.array(dtype=wp.vec2i),
                       world: wp.array(dtype=wp.int32),
                       labels: wp.array(dtype=wp.int32), floor: int,
                       force: wp.array(dtype=wp.spatial_vector),
                       loads: wp.array2d(dtype=float)):
    i = wp.tid()
    if i < nacon[0]:
        a, b = geom[i][0], geom[i][1]
        if a == floor or b == floor:
            g = b
            if b == floor:
                g = a
            wp.atomic_add(loads, world[i], labels[g], wp.abs(force[i][0]))


@wp.kernel
def _record_torque(force: wp.array2d(dtype=float), peak: wp.array(dtype=float)):
    world, joint = wp.tid()
    wp.atomic_max(peak, world, wp.abs(force[world, joint]))


class OneLegWarpEnv:
    dt = .02
    obsdim = 70

    def __init__(self, reference, n=128, seed=0, horizon=18, perturb=.006,
                 transition=True, push_magnitude=1., push_mode='random',
                 push_jitter=.7, device='cuda:0', graph=True):
        if not str(device).startswith('cuda'):
            raise ValueError('This port deliberately runs actual MuJoCo-Warp on CUDA.')
        self.n, self.device, self.reference = int(n), str(device), Path(reference)
        self.horizon, self.perturb, self.transition = horizon, perturb, transition
        self.push_magnitude = float(push_magnitude)
        self.push_mode, self.push_jitter = push_mode, push_jitter
        # This helper reproduces the original reset RNG sequence and offline FK
        # reference. It is never stepped to advance a GPU episode.
        self.template = OneLegEnv(reference, n=n, seed=seed, workers=1,
                                  horizon=horizon, perturb=perturb,
                                  transition=transition, push_magnitude=push_magnitude,
                                  push_mode=push_mode, push_jitter=push_jitter)
        self.model, self.model_path = self.template.model, self.template.model_path
        self.names = self.template.names
        self.mass = float(self.model.body_mass.sum())
        self.age = torch.zeros(n, dtype=torch.long, device=device)
        self.prev = torch.zeros((n, 19), device=device)
        self.episode_reward = torch.zeros(n, device=device)
        self.episode_success = torch.zeros(n, device=device)
        self.lo = torch.as_tensor(self.template.lo.copy(), dtype=torch.float32, device=device)
        self.hi = torch.as_tensor(self.template.hi.copy(), dtype=torch.float32, device=device)
        self.qref = torch.as_tensor(self.template.qref[7:], dtype=torch.float32, device=device)
        self.target = torch.as_tensor(self.template.target, dtype=torch.float32, device=device)
        if transition:
            self.transition_q = torch.as_tensor(self.template.transition_q, dtype=torch.float32, device=device)
            self.transition_target = torch.as_tensor(self.template.transition_target, dtype=torch.float32, device=device)
        self.rgeoms = torch.as_tensor(self.template.rgeoms, device=device)
        self.right_sizes = torch.as_tensor(self.model.geom_size[self.template.rgeoms].copy(), dtype=torch.float32, device=device)
        self.push_ticks = torch.zeros((n, 3), dtype=torch.long, device=device)
        self.push_xy = torch.zeros((n, 3, 2), device=device)
        self.graph = None
        with wp.ScopedDevice(device):
            self.wmodel = mw.put_model(self.model)
            self.data = mw.make_data(self.model, nworld=n, nconmax=128, njmax=512)
            for name in ('qpos', 'qvel', 'qacc', 'qacc_warmstart', 'ctrl',
                         'xfrc_applied', 'qfrc_applied', 'time', 'xmat',
                         'geom_xmat', 'geom_xpos', 'subtree_com', 'site_xpos',
                         'actuator_force'):
                setattr(self, name, wp.to_torch(getattr(self.data, name)))
            self.loads_wp = wp.zeros((n, 3), dtype=float)
            self.support_loads = wp.to_torch(self.loads_wp)
            self.torque_peak_wp = wp.zeros(n, dtype=float)
            self.torque_peak = wp.to_torch(self.torque_peak_wp)
            labels = np.full(self.model.ngeom, 2, dtype=np.int32)
            labels[self.template.lgeoms] = 0
            labels[self.template.rgeoms] = 1
            self.labels = wp.array(labels, dtype=wp.int32)
            capacity = self.data.contact.geom.shape[0]
            self.contact_ids = wp.array(np.arange(capacity, dtype=np.int32))
            self.contact_forces = wp.zeros(capacity, dtype=wp.spatial_vector)
            self.reset(use_existing=True)
            # Compile once. Capture a constant ten-substep physical integration
            # graph and force readout; undo this warmup with an exact cold reset.
            self._physics_step()
            if graph:
                with wp.ScopedCapture() as capture:
                    self._physics_step()
                self.graph = capture.graph
            self.reset(use_existing=True)
        self.contract = {
            'backend': 'MuJoCo-Warp CUDA float32',
            'mujoco_version': mujoco.__version__,
            'warp_version': wp.__version__,
            'model_path': str(self.model_path), 'model_sha256': sha256(self.model_path),
            'reference_path': str(self.reference.resolve()), 'reference_sha256': sha256(self.reference),
            'position_gain_kp': self.model.actuator_gainprm[:, 0].tolist(),
            'actuator_force_range_Nm': self.model.actuator_forcerange.tolist(),
            'physics_timestep_s': .002, 'policy_timestep_s': .02,
            'solver_iterations': 50, 'observation_dimensions': 70, 'action_dimensions': 19,
            'contact_load_source': 'official mujoco_warp.contact_force, actual normal ground load',
            'root_assignments': 'reset only; no root pose writes in step',
            'external_force': 'disclosed horizontal trunk push only; zero vertical force and added torque',
            'control_limits': 'unchanged original actuator_ctrlrange clamp',
            'native_helper': 'offline reference and RNG-identical cold resets only, never rollout integration',
            'precision_difference': 'GPU float32 and solver order can diverge from native float64; independent native heldout required',
            'cuda_graph': bool(graph), 'nconmax_per_world': 128, 'njmax_per_world': 512}

    def _contact_loads(self):
        # Warp's memset is capture-safe; a Torch legacy-stream zero operation
        # inside Warp capture would introduce a forbidden stream dependency.
        self.loads_wp.zero_()
        mw.contact_force(self.wmodel, self.data, self.contact_ids, False, self.contact_forces)
        wp.launch(_sum_contact_loads, dim=self.data.contact.geom.shape[0],
                  inputs=[self.data.nacon, self.data.contact.geom, self.data.contact.worldid,
                          self.labels, self.template.floor, self.contact_forces, self.loads_wp],
                  device=self.device)

    def _physics_step(self):
        for _ in range(10):
            mw.step(self.wmodel, self.data)
            wp.launch(_record_torque, dim=(self.n, 19),
                      inputs=[self.data.actuator_force, self.torque_peak_wp], device=self.device)
        self._contact_loads()

    def reset(self, ids=None, use_existing=False):
        ids_np = np.arange(self.n) if ids is None else np.asarray(ids, dtype=np.int64)
        if not use_existing:
            self.template.reset(ids_np)
        ids_t = torch.as_tensor(ids_np, device=self.device)
        # These are the only rollout-state qpos writes in this class.
        self.qpos[ids_t] = torch.as_tensor(np.stack([self.template.data[i].qpos for i in ids_np]), device=self.device, dtype=torch.float32)
        self.qvel[ids_t] = torch.as_tensor(np.stack([self.template.data[i].qvel for i in ids_np]), device=self.device, dtype=torch.float32)
        self.ctrl[ids_t] = torch.as_tensor(np.stack([self.template.data[i].ctrl for i in ids_np]), device=self.device, dtype=torch.float32)
        self.qacc[ids_t] = 0; self.qacc_warmstart[ids_t] = 0
        self.xfrc_applied[ids_t] = 0; self.qfrc_applied[ids_t] = 0; self.time[ids_t] = 0
        self.age[ids_t] = 0; self.prev[ids_t] = 0
        self.episode_reward[ids_t] = 0; self.episode_success[ids_t] = 0
        self.torque_peak[ids_t] = 0
        for i in ids_np:
            events = self.template.pushes[i]
            self.push_ticks[i] = torch.as_tensor([round(x['time_s']/self.dt) for x in events], device=self.device)
            self.push_xy[i] = torch.as_tensor([x['direction_world_xy'] for x in events], device=self.device)
        with wp.ScopedDevice(self.device):
            mw.forward(self.wmodel, self.data)
            self._contact_loads()
        return self.observe()

    def reference_now(self):
        if self.transition:
            idx = self.age.clamp(max=125)
            return self.transition_q[idx], self.transition_target[idx]
        return self.qref.expand(self.n, -1), self.target.expand(self.n, -1)

    def metrics(self):
        mat = self.xmat[:, 1]
        gravity = -mat[:, 2, :]
        rotations = self.geom_xmat[:, self.rgeoms, 2, :]
        heights = self.geom_xpos[:, self.rgeoms, 2] - (rotations.abs()*self.right_sizes).sum(-1)
        clearance = heights.min(-1).values
        tilt = torch.acos(mat[:, 2, 2].clamp(-1., 1.))
        com = self.subtree_com[:, 1, :2] - self.site_xpos[:, self.template.left, :2]
        left = self.support_loads[:, 0] > .3*self.mass*9.81
        right = self.support_loads[:, 1] > .02
        other = self.support_loads[:, 2] > .02
        success = (clearance > .01) & left & ~right & ~other & (tilt < math.radians(20)) & (self.qpos[:, 2] > .135)
        return gravity, clearance, tilt, com, success, left, right, other

    def observe(self):
        grav, h, tilt, com, *_ = self.metrics()
        q, _ = self.reference_now()
        mat_t = self.xmat[:, 1].transpose(1, 2)
        gyro = torch.bmm(mat_t, self.qvel[:, 3:6, None]).squeeze(-1)
        velocity = torch.bmm(mat_t, self.qvel[:, :3, None]).squeeze(-1)
        return torch.cat((self.qpos[:, 7:]-q, self.qvel[:, 6:]*.1, grav, gyro,
                          velocity*5, com*20, h[:, None]*20,
                          self.qpos[:, 2:3]*5, self.prev), dim=1)

    def step(self, actions, auto_reset=True):
        actions = torch.as_tensor(actions, dtype=torch.float32, device=self.device)
        _, target = self.reference_now()
        self.xfrc_applied.zero_()
        active = (self.age[:, None] >= self.push_ticks) & (self.age[:, None] < self.push_ticks+5)
        self.xfrc_applied[:, 1, :2] = (active[..., None]*self.push_xy).sum(1)*self.push_magnitude
        self.ctrl.copy_((target+actions).clamp(self.lo, self.hi))
        self.torque_peak.zero_()
        with wp.ScopedDevice(self.device):
            if self.graph is None:
                self._physics_step()
            else:
                wp.capture_launch(self.graph)
        self.age += 1
        grav, h, tilt, com, success, left, right, other = self.metrics()
        q, _ = self.reference_now()
        qerr = (self.qpos[:, 7:]-q).square().mean(-1)
        speed = self.qvel[:, :3].square().sum(-1); gyro = self.qvel[:, 3:6].square().sum(-1)
        reward = (1.2*torch.exp(-qerr*20)+1.5*torch.exp(-tilt.square()*20)
                  +torch.exp(-com.square().sum(-1)*1000)+(h/.025).clamp(0, 1)
                  +2*success-.2*gyro-.5*speed-.003*actions.square().mean(-1)
                  -.008*(actions-self.prev).square().mean(-1)-1.5*right-3*other)
        fell = (self.qpos[:, 2] < .115) | (tilt > math.radians(40)) | other
        reward -= 10*fell
        done = fell | (self.age >= round(self.horizon/self.dt))
        self.episode_reward += reward; self.episode_success += success*self.dt
        self.prev.copy_(actions)
        info = []
        if bool(done.any()):
            ids = torch.nonzero(done).flatten().cpu().numpy()
            for i in ids:
                info.append({'reward': float(self.episode_reward[i]),
                             'single_support_s': float(self.episode_success[i]),
                             'duration': float(self.age[i]*self.dt), 'fall': bool(fell[i])})
            if auto_reset:
                self.reset(ids)
        return self.observe(), reward, done, info

    def close(self):
        self.template.close()


def evaluate(checkpoint, output, reference=None, n=64, seed=74001, perturb=.006,
             horizon=18, push_magnitude=1., push_mode='random', push_jitter=.7):
    actor, reference, saved = load_policy(checkpoint, reference)
    actor = actor.to('cuda:0')
    env = OneLegWarpEnv(reference, n=n, seed=seed, perturb=perturb,
                        horizon=horizon, push_magnitude=push_magnitude,
                        push_mode=push_mode, push_jitter=push_jitter)
    obs = env.observe(); alive = torch.ones(n, dtype=torch.bool, device=env.device)
    sustain = torch.zeros(n, device=env.device); maximum = sustain.clone(); total = sustain.clone()
    fall = torch.zeros(n, dtype=torch.bool, device=env.device)
    minh = torch.ones(n, device=env.device); maxtilt = torch.zeros(n, device=env.device)
    run = torch.zeros((n, 3), device=env.device)
    recovery = torch.full((n, 3), float('nan'), device=env.device)
    peak_torque = 0.; force_z = 0.; torque_external = 0.; trace = []
    begin = time.perf_counter()
    for tick in range(round(horizon/env.dt)):
        with torch.no_grad(): actions = actor(obs)
        obs, reward, done, _ = env.step(actions, auto_reset=False)
        _, h, tilt, _, success, *_ = env.metrics()
        sustain = torch.where(alive & success, sustain+env.dt, torch.zeros_like(sustain))
        maximum = torch.maximum(maximum, sustain)
        total += (alive & success)*env.dt
        if tick*env.dt > 3: minh = torch.where(alive, torch.minimum(minh, h), minh)
        maxtilt = torch.where(alive, torch.maximum(maxtilt, tilt), maxtilt)
        now = (tick+1)*env.dt
        end = env.push_ticks*env.dt+.1
        eligible = (end <= now+1e-8) & (now <= end+3) & torch.isnan(recovery) & alive[:, None]
        run = torch.where(eligible, torch.where(success[:, None], run+env.dt, torch.zeros_like(run)), run)
        recovery = torch.where(eligible & (run >= 1.-1e-6), now-end-1., recovery)
        fall |= alive & done & (tick < round(horizon/env.dt)-1)
        alive &= ~done
        peak_torque = max(peak_torque, float(env.torque_peak.max()))
        force_z = max(force_z, float(env.xfrc_applied[:, :, 2].abs().max()))
        torque_external = max(torque_external, float(env.xfrc_applied[:, :, 3:].abs().max()))
        if tick % 25 == 0:
            trace.append({'time_s': now, 'qpos': env.qpos[0].cpu().tolist(),
                          'right_clearance_m': float(h[0]), 'single_support': bool(success[0]),
                          'loads_left_right_other_N': env.support_loads[0].cpu().tolist(),
                          'trunk_force_N': env.xfrc_applied[0, 1, :3].cpu().tolist()})
    rows = []
    for i in range(n):
        rows.append({'index': i, 'sustained_single_support_s': float(maximum[i]),
                     'total_single_support_s': float(total[i]), 'fall': bool(fall[i]),
                     'minimum_right_clearance_after_3s_m': float(minh[i]),
                     'maximum_tilt_deg': math.degrees(float(maxtilt[i])),
                     'post_push_recovery_delay_s': [None if not torch.isfinite(x) else max(float(x), 0.) for x in recovery[i]],
                     'success': bool((maximum[i] >= 10) & ~fall[i] & (torch.isfinite(recovery[i]).all() if push_magnitude else True)),
                     'pushes': env.template.pushes[i]})
    result = {'backend': 'actual MuJoCo-Warp GPU', 'checkpoint': str(Path(checkpoint).resolve()),
              'checkpoint_sha256': sha256(checkpoint), 'reference': str(reference),
              'reference_sha256': sha256(reference), 'seed': seed, 'n': n,
              'perturb': perturb, 'horizon_s': horizon, 'push_magnitude_N': push_magnitude,
              'push_mode': push_mode, 'push_jitter_s': push_jitter, 'elapsed_s': time.perf_counter()-begin,
              'passed': sum(x['success'] for x in rows), 'rows': rows, 'trace_seed0': trace,
              'peak_actuator_torque_all_2ms_substeps_Nm': peak_torque,
              'peak_external_vertical_force_N': force_z, 'peak_external_torque_Nm': torque_external,
              'contract': env.contract, 'native_validation_required': True, 'source_sha256': sha256(__file__)}
    output = Path(output); output.mkdir(parents=True, exist_ok=True)
    (output/'evaluation.json').write_text(json.dumps(result, indent=2)+'\n')
    env.close()
    return result


def train(checkpoint, output, reference=None, iterations=40, n=128, seed=74101,
          push_magnitude=1., learning_rate=3e-5):
    actor, reference, saved = load_policy(checkpoint, reference)
    actor = actor.to('cuda:0'); actor.train()
    for p in actor.balance.parameters(): p.requires_grad = False
    torch.manual_seed(seed)
    env = OneLegWarpEnv(reference, n=n, seed=seed, push_magnitude=push_magnitude)
    optimizer = torch.optim.Adam(actor.parameters(), lr=learning_rate)
    output = Path(output); output.mkdir(parents=True, exist_ok=True)
    config = {'device': 'cuda:0', 'backend': 'actual MuJoCo-Warp', 'seed': seed,
              'n_env': n, 'steps': 32, 'additional_iterations': iterations,
              'resume_checkpoint': str(Path(checkpoint).resolve()), 'resume_checkpoint_sha256': sha256(checkpoint),
              'frozen_initialized_balance_weights': True, 'learning_rate': learning_rate,
              'push_magnitude_N': push_magnitude, 'push_mode': 'random', 'push_jitter_s': .7,
              'contract': env.contract, 'native_cross_validation_required': True,
              'native_iterations_before_port': saved['iterations'],
              'native_transitions_before_port': saved['transitions']}
    (output/'manifest.json').write_text(json.dumps(config, indent=2)+'\n')
    (output/'one_leg_warp_training_source.py').write_text(Path(__file__).read_text())
    initial = {k: v.detach().cpu().clone() for k, v in actor.state_dict().items()}
    obs = env.observe(); begin = time.perf_counter()
    with (output/'training.jsonl').open('w') as log:
        for iteration in range(iterations):
            storage = []; episodes = []
            for _ in range(32):
                with torch.no_grad():
                    dist = actor.distribution(obs); a = dist.sample()
                    lp = dist.log_prob(a).sum(-1); v = actor.value(obs)
                nextobs, r, done, ep = env.step(a)
                storage.append((obs, a, lp, v, r*.1, done))
                episodes += ep; obs = nextobs
            with torch.no_grad(): last = actor.value(obs)
            carry = torch.zeros(n, device=env.device); advantage = []
            for t in range(31, -1, -1):
                _, _, _, v, r, done = storage[t]
                nv = last if t == 31 else storage[t+1][3]
                carry = r+.995*nv*(~done)-v+.995*.95*(~done)*carry
                advantage.append(carry)
            adv = torch.stack(advantage[::-1]); returns = adv+torch.stack([x[3] for x in storage])
            o = torch.cat([x[0] for x in storage]); a = torch.cat([x[1] for x in storage])
            lp0 = torch.cat([x[2] for x in storage]); av = adv.flatten(); ret = returns.flatten()
            av = (av-av.mean())/(av.std()+1e-8); losses = []
            for _ in range(4):
                for ids in torch.randperm(n*32, device=env.device).split(512):
                    dist = actor.distribution(o[ids]); lp = dist.log_prob(a[ids]).sum(-1)
                    ratio = torch.exp(lp-lp0[ids])
                    policy_loss = -torch.minimum(ratio*av[ids], ratio.clamp(.8, 1.2)*av[ids]).mean()
                    value_loss = .5*(actor.value(o[ids])-ret[ids]).square().mean()
                    loss = policy_loss+.2*value_loss-.0001*dist.entropy().sum(-1).mean()
                    optimizer.zero_grad(); loss.backward(); nn.utils.clip_grad_norm_(actor.parameters(), 1.)
                    optimizer.step(); losses.append(float(loss))
            record = {'additional_gpu_update': iteration+1, 'additional_gpu_transitions': (iteration+1)*n*32,
                      'elapsed_s': time.perf_counter()-begin, 'loss': float(np.mean(losses)),
                      'mean_step_reward_scaled': float(torch.stack([x[4] for x in storage]).mean()),
                      'episodes': episodes, 'mean_std': float(actor.logstd.exp().mean())}
            log.write(json.dumps(record)+'\n'); log.flush()
            if (iteration+1) % 10 == 0: print(json.dumps({k: v for k, v in record.items() if k != 'episodes'}), flush=True)
            if (iteration+1) % 10 == 0:
                save_checkpoint(output/f'policy_gpu_{iteration+1:04d}.pt', actor, reference,
                                saved['iterations']+iteration+1, saved['transitions']+(iteration+1)*n*32, config)
    final = output/'policy_final.pt'
    save_checkpoint(final, actor, reference, saved['iterations']+iterations,
                    saved['transitions']+iterations*n*32, config)
    changes = {prefix: float(torch.sqrt(sum((actor.state_dict()[k].detach().cpu()-v).square().sum()
                                          for k, v in initial.items() if k.startswith(prefix))))
               for prefix in ('balance', 'residual', 'critic', 'logstd')}
    (output/'learning_provenance.json').write_text(json.dumps({'parameter_L2_changes': changes,
                'actual_gpu_rollout_transitions': iterations*n*32, 'actual_gpu_ppo_updates': iterations,
                'checkpoint_sha256': sha256(final), 'reference_sha256': sha256(reference)}, indent=2)+'\n')
    env.close()
    return final

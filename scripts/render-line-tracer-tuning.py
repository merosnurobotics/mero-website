"""Precompute 2D line-tracer PID trials (8 IR sensors, differential drive) and compressed GIFs.

Top-down kinematic simulation for teaching only: it is not robot firmware.
Usage: python3 scripts/render-line-tracer-tuning.py [--probe]
"""
from pathlib import Path
import hashlib, json, math, subprocess, sys, tempfile
from collections import deque
import numpy as np
from scipy.spatial import cKDTree
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'private/education-assets/control/line-tracer'
FONT = ROOT / 'private/education-assets/deepml/fonts/Lato-Regular.ttf'
VALUES = {'kp': [float(v) for v in __import__('os').environ.get('KP','2,6,16').split(',')], 'ki': [float(v) for v in __import__('os').environ.get('KI','0,4,20').split(',')], 'kd': [float(v) for v in __import__('os').environ.get('KD','0,0.15,0.5').split(',')]}
CTRL_DT, PHYS_DT, FRAME_DT = 0.01, 0.002, 0.08          # 100 Hz control, 12.5 fps GIF
LINE_W, PAUSE_T, PAUSE_L = 0.030, 0.020, 0.20            # m
SENSOR_PITCH, SENSOR_AHEAD, SPOT = 0.012, 0.09, 0.004    # m
SENSOR_Y = np.array([(3.5 - i) * SENSOR_PITCH for i in range(8)])  # left is positive
WHEEL_BASE, VMAX, DEADZONE, TAU, TAU_BRAKE, DELAY_STEPS = 0.15, 0.9, 20, 0.15, 0.03, 2
RIGHT_GAIN, BASE_PWM, LOST_ERROR_MM, OFF_TRACK_M = 0.88, 170, 48, 0.12
PAUSE_HOLD_S = 7.0
SENSOR_NOISE, WHEEL_NOISE = 0.05, 0.01                  # Gaussian sigma: IR reading (0..1), wheel speed (m/s)
rng_seed = 7


# ---------- track ----------
def walk(segments, step=0.002):
    pts, x, y, h = [(0.0, 0.0)], 0.0, 0.0, 0.0
    for seg in segments:
        if seg[0] == 'S':
            n = max(1, round(seg[1] / step))
            for _ in range(n):
                x += math.cos(h) * seg[1] / n; y += math.sin(h) * seg[1] / n; pts.append((x, y))
        else:
            sign = 1 if seg[0] == 'L' else -1
            r, ang = seg[1], math.radians(seg[2])
            n = max(1, round(r * ang / step))
            for _ in range(n):
                h0 = h; h += sign * ang / n
                x += sign * r * (math.sin(h) - math.sin(h0)); y += sign * r * (-math.cos(h) + math.cos(h0)); pts.append((x, y))
    return np.array(pts), (x, y, h)


def build_track():
    head = [('S', 1.2), ('L', 0.3, 90), ('S', 0.8), ('L', 0.3, 90), ('S', 0.2), ('R', 0.25, 50), ('L', 0.25, 100), ('R', 0.25, 50)]
    tail = lambda s2, v2: [('S', s2), ('L', 0.18, 90), ('S', v2), ('L', 0.3, 90)]
    _, (ex, ey, _) = walk(head + tail(0, 0))
    pts, (fx, fy, _) = walk(head + tail(ex, ey))
    assert abs(fx) < 1e-6 and abs(fy) < 1e-6, (fx, fy)
    pts = pts[:-1]
    seglen = np.linalg.norm(np.diff(np.vstack([pts, pts[:1]]), axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(seglen)[:-1]])
    tangent = np.gradient(pts, axis=0); tangent /= np.linalg.norm(tangent, axis=1, keepdims=True)
    lengths = [1.2, 0.3 * math.pi / 2, 0.8, 0.3 * math.pi / 2, 0.2, 0.25 * math.radians(50), 0.25 * math.radians(100), 0.25 * math.radians(50), ex, 0.18 * math.pi / 2, ey]
    starts = np.concatenate([[0], np.cumsum(lengths)])
    pause_s = [0.6, starts[2] + 0.4]
    pauses = []
    for ps in pause_s:
        i = int(np.argmin(abs(s - ps))); pauses.append((pts[i], tangent[i]))
    straight_v2 = (starts[10] + 0.1, starts[11] - 0.1)   # last vertical straight, no pause line
    return {'starts': starts, 'pts': pts, 's': s, 'length': float(s[-1] + seglen[-1]), 'pauses': pauses, 'pause_s': pause_s, 'straight': straight_v2, 'segments': {'S2': ex, 'V2': ey}}


TRACK = build_track()
TREE = cKDTree(TRACK['pts'])


def whiteness(points):
    """Fraction of a 4 mm IR spot that sees white tape at each point (white on black floor)."""
    d, _ = TREE.query(points)
    white = np.clip((LINE_W / 2 - d) / (2 * SPOT) + 0.5, 0, 1)
    for centre, t in TRACK['pauses']:
        rel = points - centre
        along, across = rel @ t, rel @ np.array([-t[1], t[0]])
        inside = np.clip((PAUSE_T / 2 - abs(along)) / (2 * SPOT) + 0.5, 0, 1) * np.clip((PAUSE_L / 2 - abs(across)) / (2 * SPOT) + 0.5, 0, 1)
        white = np.maximum(white, inside)
    return white, d


# ---------- robot ----------
class Robot:
    def __init__(self):
        self.x, self.y, self.h = 0.25, 0.0, 0.0
        self.vl = self.vr = 0.0

    def sensor_points(self):
        c, s = math.cos(self.h), math.sin(self.h)
        fx, fy = self.x + c * SENSOR_AHEAD, self.y + s * SENSOR_AHEAD
        return np.stack([fx - s * SENSOR_Y, fy + c * SENSOR_Y], axis=1)

    def disturb(self, rng):
        self.vl += rng.normal(0, WHEEL_NOISE); self.vr += rng.normal(0, WHEEL_NOISE)

    def step(self, pwm_l, pwm_r, brake):
        def target(pwm, gain):
            mag = max(0.0, abs(pwm) - DEADZONE) / (255 - DEADZONE)
            return math.copysign(mag * VMAX * gain, pwm)
        tau = TAU_BRAKE if brake else TAU
        self.vl += (target(pwm_l, 1.0) - self.vl) * PHYS_DT / tau
        self.vr += (target(pwm_r, RIGHT_GAIN) - self.vr) * PHYS_DT / tau
        v, w = (self.vl + self.vr) / 2, (self.vr - self.vl) / WHEEL_BASE
        self.x += v * math.cos(self.h) * PHYS_DT; self.y += v * math.sin(self.h) * PHYS_DT; self.h += w * PHYS_DT


def read_sensors(robot, rng):
    white, _ = whiteness(robot.sensor_points())
    raw = np.clip(0.06 + 0.88 * white + rng.normal(0, SENSOR_NOISE, 8), 0, 1)
    return raw, np.clip((raw - 0.2) / 0.6, 0, 1)   # raw 0..1 and calibrated weight


def line_error(weights, last_error):
    if weights.sum() < 0.5:
        return (math.copysign(LOST_ERROR_MM, last_error) if last_error else 0.0), True
    return float((weights * SENSOR_Y * 1000).sum() / weights.sum()), False


def progress_index(x, y, hint):
    window = (np.arange(-60, 400) + hint) % len(TRACK['pts'])
    d = np.linalg.norm(TRACK['pts'][window] - [x, y], axis=1)
    return int(window[np.argmin(d)])


def simulate(kp, ki, kd, mode='tune', max_time=20.0, base_pwm=BASE_PWM):
    """mode: 'tune' (drive over pause lines), 'naive' or 'state' (pause & resume logic)."""
    rng = np.random.default_rng(rng_seed)
    robot = Robot()
    integral = prev_error = 0.0
    first = True
    state, state_t, pause_count, cleared = 'FOLLOW', 0.0, 0, 0
    detect_streak, idx, laps, last_idx = 0, 0, 0, 0
    trace, frames_t, failed, reason, lap_s = [], -1.0, None, None, None
    stats = {'abs_e': [], 'straight_e': [], 'lost': 0, 'n': 0, 'pauses': []}
    t, next_frame = 0.0, 0.0
    steps_per_ctrl = round(CTRL_DT / PHYS_DT)
    pwm_l = pwm_r = 0.0
    queue = deque([(0.0, 0.0, False)] * DELAY_STEPS)   # sensor-to-motor latency
    raw = weights = np.zeros(8); e = 0.0; lost = False; u = 0.0
    while t < max_time + 1e-9:
        raw, weights = read_sensors(robot, rng)
        e, lost = line_error(weights, prev_error)
        white_count = int((weights > 0.5).sum())
        brake = False
        if mode != 'tune':
            if state == 'FOLLOW':
                detect_streak = detect_streak + 1 if white_count >= 6 else 0
                if detect_streak >= 2:
                    state, state_t, pause_count = 'PAUSE', t, pause_count + 1
                    stats['pauses'].append(round(t, 2))
            elif state == 'PAUSE' and t - state_t >= PAUSE_HOLD_S:
                if mode == 'naive':
                    state, detect_streak = 'FOLLOW', 0
                else:
                    state, state_t, cleared = 'RESUME', t, 0
            elif state == 'RESUME':
                cleared = cleared + 1 if white_count <= 3 else 0
                if cleared >= 5:
                    state, detect_streak = 'FOLLOW', 0
        if state == 'PAUSE':
            pwm_l = pwm_r = 0.0; brake = True
            integral, first = 0.0, True
        elif state == 'RESUME':
            pwm_l, pwm_r, u = base_pwm, base_pwm, 0.0   # cross the marker straight; no line error here
        else:
            derivative = 0.0 if first else (e - prev_error) / CTRL_DT
            first = False
            integral = float(np.clip(integral + e * CTRL_DT, -60 / ki, 60 / ki)) if ki else 0.0
            u = float(np.clip(kp * e + ki * integral + kd * derivative, -255, 255))
            pwm_l, pwm_r = float(np.clip(base_pwm - u, -255, 255)), float(np.clip(base_pwm + u, -255, 255))
        prev_error = e
        stats['n'] += 1; stats['lost'] += int(lost); stats['abs_e'].append(abs(e))
        idx = progress_index(robot.x, robot.y, idx)
        if idx < last_idx - len(TRACK['pts']) // 2: laps += 1
        last_idx = idx
        progress = laps * TRACK['length'] + TRACK['s'][idx]
        if TRACK['straight'][0] <= TRACK['s'][idx] <= TRACK['straight'][1] and laps == 0: stats['straight_e'].append(e)
        bar = robot.sensor_points().mean(axis=0)
        _, d_bar = whiteness(bar[None])
        if t >= next_frame - 1e-9 or failed is not None:
            trace.append({'t': round(t, 3), 'x': robot.x, 'y': robot.y, 'h': robot.h, 'raw': raw.round(3).tolist(), 'e': round(e, 2), 'lost': lost,
                          'pwm': [round(pwm_l), round(pwm_r)], 'state': state if mode != 'tune' else None,
                          'pause_left': round(PAUSE_HOLD_S - (t - state_t), 2) if state == 'PAUSE' else None, 'progress': progress, 'stopped': failed is not None, 'done': lap_s is not None})
            next_frame += FRAME_DT * (4 if state == 'PAUSE' else 1)
        if failed is not None or (lap_s is not None and mode == 'tune' and t - lap_s >= 0.6):
            break
        if d_bar[0] > OFF_TRACK_M:
            failed, reason = t, 'off_track'; continue
        if mode == 'tune' and lap_s is None and progress >= TRACK['length'] + 0.25:
            lap_s = t
        if mode == 'naive' and pause_count >= 3 and state == 'PAUSE' and t - state_t > 2: break
        if mode == 'state' and pause_count >= 3 and state == 'FOLLOW' and t - state_t > 1.2: break
        queue.append((pwm_l, pwm_r, brake))
        applied = queue.popleft()
        if not applied[2]: robot.disturb(rng)
        for _ in range(steps_per_ctrl):
            robot.step(*applied)
        t = round(t + CTRL_DT, 6)
    straight = np.array(stats['straight_e']) if stats['straight_e'] else np.array([np.nan])
    metrics = {'completed': lap_s is not None, 'lap_s': lap_s, 'stop_s': failed, 'stop_reason': reason,
               'mean_abs_error_mm': float(np.mean(stats['abs_e'])), 'max_abs_error_mm': float(np.max(stats['abs_e'])),
               'straight_offset_mm': None if np.isnan(straight).all() else float(np.mean(straight)),
               'straight_wobble_mm': None if np.isnan(straight).all() else float(np.std(straight)),
               'line_lost_pct': 100 * stats['lost'] / stats['n'], 'pauses_s': stats['pauses']}
    return trace, metrics


# ---------- rendering ----------
W, H = 760, 470
MAP = (10, 44, 470, 436)       # x0, y0, x1, y1
BG, FLOOR, PANEL, TEXT, MUTED, ACCENT, WARN, OK = '#0f1724', '#05070b', '#172234', '#e8eef5', '#9fb0c3', '#f2ac64', '#ff7b72', '#7ee0a8'


def map_transform():
    pts = TRACK['pts']; lo, hi = pts.min(axis=0) - 0.14, pts.max(axis=0) + 0.14
    scale = min((MAP[2] - MAP[0]) / (hi[0] - lo[0]), (MAP[3] - MAP[1]) / (hi[1] - lo[1]))
    ox = MAP[0] + ((MAP[2] - MAP[0]) - (hi[0] - lo[0]) * scale) / 2
    oy = MAP[1] + ((MAP[3] - MAP[1]) - (hi[1] - lo[1]) * scale) / 2
    return lambda p: (ox + (p[0] - lo[0]) * scale, oy + (hi[1] - p[1]) * scale), scale


def pause_corners(centre, t):
    n = np.array([-t[1], t[0]])
    return [centre + a * t * PAUSE_T / 2 + b * n * PAUSE_L / 2 for a, b in ((1, 1), (1, -1), (-1, -1), (-1, 1))]


def draw_map_background(fonts):
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    to_px, scale = map_transform()
    d.rounded_rectangle(MAP, 8, fill=FLOOR)
    pts = [to_px(p) for p in np.vstack([TRACK['pts'], TRACK['pts'][:1]])]
    d.line(pts, fill='#f4f4f0', width=max(2, round(LINE_W * scale)), joint='curve')
    for centre, t in TRACK['pauses']:
        d.polygon([to_px(c) for c in pause_corners(centre, t)], fill='#f4f4f0')
    sx, sy = to_px((0.0, 0.0))
    d.line([(sx, sy - 12), (sx, sy + 12)], fill=ACCENT, width=2)
    d.text((sx + 4, sy + 14), 'Start', font=fonts['small'], fill=ACCENT)
    return img


def draw_robot_view(img, robot_state, fonts):
    x0, y0, x1, y1 = 482, 66, 750, 222
    view = Image.new('RGB', (x1 - x0, y1 - y0), FLOOR)   # drawn separately, then pasted: keeps the tape inside the box
    d = ImageDraw.Draw(view)
    cx, cy, s = (x1 - x0) / 2, (y1 - y0) - 52, 1000.0 * 0.95        # px per m (about 1 px per mm)
    hx, hy, h = robot_state['x'], robot_state['y'], robot_state['h']
    c, sn = math.cos(h), math.sin(h)

    def to_px(p):
        rx, ry = p[0] - hx, p[1] - hy
        fwd, left = rx * c + ry * sn, -rx * sn + ry * c
        return cx - left * s, cy - fwd * s

    near = np.linalg.norm(TRACK['pts'] - [hx, hy], axis=1) < 0.3
    idxs = np.flatnonzero(near)
    if len(idxs):
        for g in np.split(idxs, np.flatnonzero(np.diff(idxs) > 1) + 1):
            pts = [to_px(TRACK['pts'][i]) for i in g[::5]] + [to_px(TRACK['pts'][g[-1]])]   # 10 mm spacing avoids jagged joints
            d.line(pts, fill='#f4f4f0', width=round(LINE_W * s), joint='curve')
    for centre, t in TRACK['pauses']:
        if np.linalg.norm(centre - [hx, hy]) < 0.4:
            d.polygon([to_px(q) for q in pause_corners(centre, t)], fill='#f4f4f0')
    # Robot body in its own frame (always pointing up).
    d.rectangle((cx - 62, cy - 100, cx + 62, cy + 44), outline='#5f86c9', width=2)
    for side in (-1, 1):
        d.rounded_rectangle((cx + side * 75 - 7, cy - 22, cx + side * 75 + 7, cy + 22), 3, fill='#3b4a63')
    d.ellipse((cx - 8, cy + 30, cx + 8, cy + 46), outline='#5f86c9', width=2)   # ball caster
    for i, val in enumerate(robot_state['raw']):
        px, py = cx - SENSOR_Y[i] * s, cy - SENSOR_AHEAD * s
        v = int(40 + 215 * val)
        d.ellipse((px - 5, py - 5, px + 5, py + 5), fill=(v, int(v * 0.55), 40), outline=ACCENT)
    mask = Image.new('L', view.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, view.size[0] - 1, view.size[1] - 1), 8, fill=255)
    img.paste(view, (x0, y0), mask)
    ImageDraw.Draw(img).text((x0, y0 - 22), 'Robot view (zoomed)', font=fonts['small'], fill=MUTED)


def draw_frame(background, run_trace, index, title, fonts):
    img = background.copy()
    d = ImageDraw.Draw(img)
    row = run_trace[index]
    to_px, _ = map_transform()
    trail = [to_px((r['x'], r['y'])) for r in run_trace[:index + 1]]
    if len(trail) > 1: d.line(trail, fill='#3fa7ff', width=3)
    px, py = to_px((row['x'], row['y']))
    hx, hy = math.cos(row['h']), -math.sin(row['h'])
    d.ellipse((px - 7, py - 7, px + 7, py + 7), fill=ACCENT)
    d.line([(px, py), (px + hx * 15, py + hy * 15)], fill=ACCENT, width=3)
    d.text((16, 9), title, font=fonts['title'], fill=TEXT)
    draw_robot_view(img, row, fonts)
    # Sensor bars.
    bx0, by0, bw = 492, 252, 30
    d.text((482, 228), 'IR sensors (white = 1)', font=fonts['small'], fill=MUTED)
    for i, val in enumerate(row['raw']):
        x = bx0 + i * bw
        d.rectangle((x, by0, x + 20, by0 + 40), outline='#3b4a63')
        d.rectangle((x, by0 + 40 - 40 * val, x + 20, by0 + 40), fill=ACCENT)
    # Error plot of the last 5 s.
    gx0, gy0, gx1, gy1 = 482, 326, 750, 420
    d.text((482, 302), f'Line error  {row["e"]:+.1f} mm' + ('  (lost)' if row['lost'] else ''), font=fonts['small'], fill=WARN if row['lost'] else TEXT)
    d.rectangle((gx0, gy0, gx1, gy1), fill=PANEL)
    mid = (gy0 + gy1) / 2
    d.line([(gx0, mid), (gx1, mid)], fill='#3b4a63')
    window = [r for r in run_trace[:index + 1] if r['t'] >= row['t'] - 5]
    pts = [(gx1 - (row['t'] - r['t']) / 5 * (gx1 - gx0), mid - max(-50, min(50, r['e'])) / 50 * (gy1 - gy0) / 2) for r in window]
    if len(pts) > 1: d.line(pts, fill='#3fa7ff', width=2)
    d.text((gx1 - 4, gy0 + 2), '+50', anchor='ra', font=fonts['tiny'], fill=MUTED)
    d.text((gx1 - 4, gy1 - 2), '-50', anchor='rd', font=fonts['tiny'], fill=MUTED)
    d.text((gx0 + 4, gy1 - 2), 'last 5 s', anchor='ld', font=fonts['tiny'], fill=MUTED)
    # Status line.
    d.text((482, 428), f'PWM  L {row["pwm"][0]:>4}   R {row["pwm"][1]:>4}', font=fonts['small'], fill=TEXT)
    if row['stopped']:
        status, colour = f'Off track at {row["t"]:.2f} s', WARN
    elif row['done']:
        status, colour = f'Lap complete  t = {row["t"]:.2f} s', OK
    elif row['state'] == 'PAUSE':
        status, colour = f'PAUSE  {max(0, row["pause_left"]):.1f} s left  (shown 4x faster)', ACCENT
    elif row['state'] == 'RESUME':
        status, colour = f'RESUME  cross the marker  t = {row["t"]:.2f} s', OK
    else:
        status, colour = f't = {row["t"]:.2f} s' + ('   FOLLOW' if row['state'] else ''), TEXT
    d.text((16, 444), status, font=fonts['body'], fill=colour)
    return img


def encode(frames_dir, target):
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-framerate', str(round(1 / FRAME_DT, 2)), '-i', str(frames_dir / '%04d.png'),
                    '-filter_complex', '[0:v]split[a][b];[a]palettegen=max_colors=48:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle',
                    '-loop', '0', str(target)], check=True)


def render(run_trace, title, name, fonts, background):
    with tempfile.TemporaryDirectory(prefix='line-tracer-') as tmp:
        tmp = Path(tmp)
        for i in range(len(run_trace)):
            frame = draw_frame(background, run_trace, i, title, fonts)
            frame.save(tmp / f'{i:04d}.png')
        frame.save(ASSETS / f'{name}.png', optimize=True)   # last frame: full trail as reduced-motion alternative
        encode(tmp, ASSETS / f'{name}.gif')


def fmt(v):
    return f'{v:g}'


def draw_diagrams(fonts):
    """Static English diagrams: sensor-array weighted average and track layout."""
    # Sensor array diagram.
    img = Image.new('RGB', (1040, 420), '#ffffff'); d = ImageDraw.Draw(img)
    f, fb, fs = fonts['dia'], fonts['dia_b'], fonts['dia_s']
    d.text((40, 24), '8 IR sensors across a 30 mm white line (sensor pitch 12 mm)', font=fb, fill='#1b2533')
    d.rectangle((200, 80, 1000, 200), fill='#111111')
    line_centre_mm = 10.0               # line is 10 mm to the left of the robot centre
    scale = 8.6; cx = 600
    lx = cx - line_centre_mm * scale
    d.rectangle((max(200, lx - 15 * scale), 80, min(1000, lx + 15 * scale), 200), fill='#f4f4f0')
    readings = []
    for i, y in enumerate(SENSOR_Y * 1000):
        px = cx - y * scale
        dist = abs(y - line_centre_mm) / 1000
        w = float(np.clip((LINE_W / 2 - dist) / (2 * SPOT) + 0.5, 0, 1)); readings.append(w)
        d.ellipse((px - 14, 126, px + 14, 154), fill='#f2ac64' if w > 0.5 else '#46566d', outline='#1b2533', width=2)
        d.text((px, 218), f'{y:+.0f}', anchor='ma', font=fs, fill='#1b2533')
        d.text((px, 250), f'{w:.2f}', anchor='ma', font=f, fill='#c25f13' if w > 0 else '#7b8796')
    d.line([(cx, 70), (cx, 210)], fill='#214fc4', width=2)
    d.text((cx + 6, 60), 'robot centre', font=fs, fill='#214fc4')
    d.text((40, 218), 'position y (mm)', font=fs, fill='#1b2533')
    d.text((40, 250), 'reading w', font=fs, fill='#1b2533')
    num = sum(w * y for w, y in zip(readings, SENSOR_Y * 1000)); den = sum(readings)
    d.text((40, 300), 'error = sum(w * y) / sum(w)', font=fb, fill='#1b2533')
    d.text((40, 340), f'      = ({num:.1f}) / ({den:.2f}) = {num / den:+.1f} mm   ->  line is left of centre, turn left', font=f, fill='#1b2533')
    d.text((40, 380), 'Left wheel = base - u,  right wheel = base + u,  u = Kp*e + Ki*sum(e)dt + Kd*de/dt', font=f, fill='#214fc4')
    img.save(ASSETS / 'sensor-array.png', optimize=True)

    # Track layout diagram.
    img = Image.new('RGB', (900, 470), '#ffffff'); d = ImageDraw.Draw(img)
    to_px, scale = map_transform()
    pts = [to_px(p) for p in np.vstack([TRACK['pts'], TRACK['pts'][:1]])]
    d.rounded_rectangle(MAP, 8, fill='#111111')
    d.line(pts, fill='#f4f4f0', width=round(LINE_W * scale), joint='curve')
    centroid = TRACK['pts'].mean(axis=0)

    def label_at(arc_s, text, colour, inward=0.13):
        p = TRACK['pts'][int(np.argmin(abs(TRACK['s'] - arc_s)))]
        q = p + (centroid - p) / np.linalg.norm(centroid - p) * inward
        d.text(to_px(q), text, font=fs, fill=colour, anchor='mm')
    for k, (centre, t) in enumerate(TRACK['pauses']):
        d.polygon([to_px(c) for c in pause_corners(centre, t)], fill='#f2ac64')
        label_at(TRACK['pause_s'][k], f'Pause & Resume {"AB"[k]}', '#f2ac64', 0.3 if k == 0 else 0.36)
    sx, sy = to_px((0.0, 0.0)); d.line([(sx, sy - 12), (sx, sy + 12)], fill='#7ee0a8', width=2)
    d.text((sx, sy - 16), 'Start', font=fs, fill='#7ee0a8', anchor='md')
    L = TRACK['starts']
    for arc_s, text in [((L[1] + L[2]) / 2, 'R 300 mm'), ((L[5] + L[8]) / 2, 'S-bend R 250 mm'), ((L[9] + L[10]) / 2, 'Tight R 180 mm')]:
        label_at(arc_s, text, '#9fd0ff', 0.2)
    d.text((500, 60), 'Course used in the simulation', font=fb, fill='#1b2533')
    rows = [f'Lap length  {TRACK["length"]:.2f} m', 'Line width  30 mm (white on black)', 'Marker  20 mm x 200 mm, across the line',
            'Robot  2 DC motors + rear ball caster', 'Wheel base  150 mm, no encoders', 'Sensor bar  90 mm ahead of the axle', 'Right motor  12% weaker than left']
    for i, r in enumerate(rows):
        d.text((500, 108 + i * 36), r, font=fs, fill='#1b2533')
    img.save(ASSETS / 'track-layout.png', optimize=True)


if __name__ == '__main__':
    probe = '--probe' in sys.argv
    ASSETS.mkdir(parents=True, exist_ok=True)
    assert FONT.exists(), FONT
    fonts = {'title': ImageFont.truetype(str(FONT), 21), 'body': ImageFont.truetype(str(FONT), 18), 'small': ImageFont.truetype(str(FONT), 16), 'tiny': ImageFont.truetype(str(FONT), 14),
             'dia': ImageFont.truetype(str(FONT), 22), 'dia_b': ImageFont.truetype(str(FONT), 26), 'dia_s': ImageFont.truetype(str(FONT), 19)}
    print('track length', round(TRACK['length'], 3), TRACK['segments'])
    background = draw_map_background(fonts)
    runs = []
    for kp in VALUES['kp']:
        for ki in VALUES['ki']:
            for kd in VALUES['kd']:
                name = f'p{fmt(kp)}-i{fmt(ki)}-d{fmt(kd)}'.replace('.', '_')
                trace, metrics = simulate(kp, ki, kd)
                print(name, json.dumps({k: (round(v, 2) if isinstance(v, float) else v) for k, v in metrics.items()}), flush=True)
                if not probe:
                    render(trace, f'Line tracer PID   P {fmt(kp)}   I {fmt(ki)}   D {fmt(kd)}', name, fonts, background)
                runs.append({'id': name, 'kp': kp, 'ki': ki, 'kd': kd, 'gif': f'/education-assets/control/line-tracer/{name}.gif', 'still': f'/education-assets/control/line-tracer/{name}.png', 'metrics': metrics})
    pause_gains, pause_base = (6, 4, 0.5), 100
    bonus = {}
    for mode in ('naive', 'state'):
        trace, metrics = simulate(*pause_gains, mode=mode, max_time=70, base_pwm=pause_base)
        print(mode, json.dumps(metrics), flush=True)
        if not probe:
            render(trace, f'Pause & Resume: {"naive stop" if mode == "naive" else "state machine"}   P 6  I 4  D 0.5', f'pause-{mode}', fonts, background)
        bonus[mode] = {'gif': f'/education-assets/control/line-tracer/pause-{mode}.gif', 'still': f'/education-assets/control/line-tracer/pause-{mode}.png', 'metrics': metrics}
    if not probe:
        draw_diagrams(fonts)
        manifest = {'engine': '2D kinematic simulation (NumPy + Pillow)', 'values': VALUES, 'control_hz': 1 / CTRL_DT, 'physics_dt_s': PHYS_DT, 'frame_dt_s': FRAME_DT,
                    'track': {'length_m': TRACK['length'], 'line_width_mm': 30, 'marker_mm': [20, 200]}, 'robot': {'wheel_base_m': WHEEL_BASE, 'sensor_pitch_mm': 12, 'sensor_ahead_m': SENSOR_AHEAD, 'vmax_mps': VMAX, 'base_pwm': BASE_PWM, 'deadzone_pwm': DEADZONE, 'motor_tau_s': TAU, 'brake_tau_s': TAU_BRAKE, 'right_motor_gain': RIGHT_GAIN},
                    'integral_term_limit_pwm': 60, 'lost_line_error_mm': LOST_ERROR_MM, 'off_track_m': OFF_TRACK_M, 'pause_hold_s': PAUSE_HOLD_S, 'pause_gains': pause_gains, 'pause_base_pwm': pause_base, 'sensor_noise_sigma': SENSOR_NOISE, 'wheel_noise_sigma_mps': WHEEL_NOISE, 'actuation_delay_s': DELAY_STEPS * CTRL_DT, 'runs': runs, 'bonus': bonus,
                    'script_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
        (ROOT / 'src/lib/education/generated/line-tracer.json').write_text(json.dumps(manifest, indent=2) + '\n')
        manifest['files'] = {p.name: {'bytes': p.stat().st_size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(ASSETS.iterdir()) if p.is_file() and p.name != 'manifest.json'}
        (ASSETS / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')

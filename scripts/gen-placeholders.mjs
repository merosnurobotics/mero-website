// One-off generator for placeholder images referenced in src/data/site.ts.
// Run: node scripts/gen-placeholders.mjs
// Replace the generated files in /public with real photos anytime.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");

// [path, label, colorA, colorB]
const items = [
  // Equipment
  ["equipment/3d-printers.svg", "3D Printers", "#6d5efc", "#22d3ee"],
  ["equipment/laser-cutter.svg", "Laser Cutter", "#f43f5e", "#f59e0b"],
  ["equipment/oscilloscopes.svg", "Oscilloscopes", "#22d3ee", "#6d5efc"],
  ["equipment/soldering-stations.svg", "Soldering", "#f59e0b", "#f43f5e"],
  ["equipment/embedded-boards.svg", "Embedded Boards", "#10b981", "#22d3ee"],
  ["equipment/drone-platforms.svg", "Drones", "#6d5efc", "#a78bfa"],
  ["equipment/robotic-arms.svg", "Robotic Arms", "#22d3ee", "#10b981"],
  ["equipment/power-tool-set.svg", "Power Tools", "#f59e0b", "#6d5efc"],
  // Projects
  ["projects/autonomous-delivery-robot.svg", "Delivery Robot", "#6d5efc", "#22d3ee"],
  ["projects/smart-cultivation-system.svg", "Cultivation", "#10b981", "#22d3ee"],
  ["projects/gesture-controlled-robotic-arm.svg", "Gesture Arm", "#a78bfa", "#f43f5e"],
  ["projects/fpv-racing-drone.svg", "FPV Drone", "#6d5efc", "#a78bfa"],
  // Events
  ["events/national-university-robot-competition.svg", "Robot Competition", "#6d5efc", "#22d3ee"],
  ["events/national-university-robot-competition-2.svg", "Finals Day", "#22d3ee", "#6d5efc"],
  ["events/maker-faire-seoul.svg", "Maker Faire", "#f59e0b", "#f43f5e"],
  ["events/maker-faire-seoul-2.svg", "Our Booth", "#f43f5e", "#f59e0b"],
  ["events/embedded-sw-competition.svg", "Embedded SW", "#10b981", "#22d3ee"],
  ["events/campus-hackathon.svg", "Hackathon", "#a78bfa", "#6d5efc"],
  ["events/campus-hackathon-2.svg", "Demo Night", "#6d5efc", "#a78bfa"],
];

// Square avatar placeholders for People. [path, fullName, colorA, colorB]
const avatars = [
  // Advisors
  ["people/jaehyun-moon.svg", "Jaehyun Moon", "#22d3ee", "#6d5efc"],
  ["people/hyeri-baek.svg", "Hyeri Baek", "#6d5efc", "#22d3ee"],
  // Current members
  ["people/jiwon-park.svg", "Jiwon Park", "#6d5efc", "#22d3ee"],
  ["people/minseok-lee.svg", "Minseok Lee", "#22d3ee", "#6d5efc"],
  ["people/soyeon-kim.svg", "Soyeon Kim", "#f43f5e", "#f59e0b"],
  ["people/hyunwoo-choi.svg", "Hyunwoo Choi", "#10b981", "#22d3ee"],
  ["people/dahye-jung.svg", "Dahye Jung", "#a78bfa", "#f43f5e"],
  ["people/junho-kang.svg", "Junho Kang", "#f59e0b", "#6d5efc"],
  ["people/yerin-han.svg", "Yerin Han", "#22d3ee", "#10b981"],
  ["people/taeyang-seo.svg", "Taeyang Seo", "#6d5efc", "#a78bfa"],
  // Alumni
  ["people/woojin-yoon.svg", "Woojin Yoon", "#a78bfa", "#6d5efc"],
  ["people/eunji-shin.svg", "Eunji Shin", "#f59e0b", "#f43f5e"],
  ["people/sangmin-oh.svg", "Sangmin Oh", "#10b981", "#22d3ee"],
  ["people/nari-cho.svg", "Nari Cho", "#f43f5e", "#f59e0b"],
];

function svg(label, a, b) {
  const id = Math.random().toString(36).slice(2, 8);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/>
      <stop offset="1" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="#0b0b12"/>
  <rect width="800" height="500" fill="url(#g${id})" opacity="0.22"/>
  <g fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1">
    ${Array.from({ length: 16 }, (_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="500"/>`).join("")}
    ${Array.from({ length: 10 }, (_, i) => `<line x1="0" y1="${i * 50}" x2="800" y2="${i * 50}"/>`).join("")}
  </g>
  <circle cx="400" cy="210" r="70" fill="none" stroke="url(#g${id})" stroke-width="6"/>
  <text x="400" y="220" font-family="monospace" font-size="52" font-weight="700" fill="#fff" text-anchor="middle" opacity="0.9">M</text>
  <text x="400" y="340" font-family="sans-serif" font-size="34" font-weight="700" fill="#eaeaf0" text-anchor="middle">${label}</text>
  <text x="400" y="380" font-family="monospace" font-size="16" fill="rgba(255,255,255,0.5)" text-anchor="middle">placeholder — replace in /public</text>
</svg>
`;
}

// Derive up-to-two-letter initials from a full name.
function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function avatar(name, a, b) {
  const id = Math.random().toString(36).slice(2, 8);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="a${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/>
      <stop offset="1" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="#0b0b12"/>
  <rect width="400" height="400" fill="url(#a${id})" opacity="0.3"/>
  <text x="200" y="200" font-family="sans-serif" font-size="150" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="central" opacity="0.92">${initials(name)}</text>
</svg>
`;
}

for (const [path, label, a, b] of items) {
  const full = join(pub, path);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, svg(label, a, b), "utf8");
  console.log("wrote", path);
}

for (const [path, name, a, b] of avatars) {
  const full = join(pub, path);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, avatar(name, a, b), "utf8");
  console.log("wrote", path);
}

console.log(
  `\nDone. Generated ${items.length} image + ${avatars.length} avatar placeholders.`,
);

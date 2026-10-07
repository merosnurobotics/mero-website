// Import the supplied, authored lesson. No remote HTML or user input is rendered.
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import postcss from "postcss";

const source = resolve(process.argv[2] || "/home/user/microbanRL/education");
const assets = "public/education-assets/kimodo-mjwarp";
await mkdir(assets, { recursive: true });
// The original curated offline package includes the media, evidence and licenses.
execFileSync("python3", ["-c", `import zipfile,sys,pathlib
with zipfile.ZipFile(sys.argv[1]) as z:
 for name in z.namelist():
  parts=pathlib.PurePosixPath(name).parts
  if parts[0]!='education' or '..' in parts: raise ValueError(name)
  target=pathlib.Path(sys.argv[2]).joinpath(*parts[1:])
  if name.endswith('/'): target.mkdir(parents=True,exist_ok=True)
  else:
   target.parent.mkdir(parents=True,exist_ok=True)
   target.write_bytes(z.read(name))`, resolve(source, "microban-imitation-rl-lesson.zip"), assets]);
await copyFile(resolve(source, "microban-imitation-rl-lesson.zip"), `${assets}/microban-imitation-rl-lesson.zip`);
const original = await readFile(resolve(source, "index.html"), "utf8");
let html = original.match(/<main id="main">([\s\S]*?)<\/main>/)[1];
html = html.replace(/(src|poster|href)="(?!https?:|#)([^"]+)"/g, '$1="/education-assets/kimodo-mjwarp/$2"');
html = html.replace('<section class="hero wrap">', '<section id="lesson-start" class="hero wrap">');
html = html.replace("Nvidia Kimodo + Mjwarp 로 imitation RL 만들기", "NVIDIA Kimodo + MuJoCo Warp로 모방 강화학습 만들기");
html += `<div class="lesson-resources"><a href="/education-assets/kimodo-mjwarp/microban-imitation-rl-lesson.zip" download>전체 자료 다운로드 (ZIP)</a><a href="/education-assets/kimodo-mjwarp/evidence/THIRD_PARTY_NOTICES.md">원본과 라이선스</a><button id="print" type="button">인쇄</button></div>`;
await writeFile("src/lib/education/kimodo-lesson.ts", `// Authored lesson snapshot imported by scripts/import-education.mjs.\nexport const kimodoLessonHtml = ${JSON.stringify(html)};\n`);

const css = postcss.parse(await readFile(resolve(source, "style.css"), "utf8"));
css.walkAtRules("font-face", rule => rule.remove());
css.walkRules(rule => {
  if (rule.selectors.some(s => s.includes(":root"))) { rule.remove(); return; }
  const selectors = rule.selectors.filter(s => !["html", "body"].includes(s) && !s.startsWith(".site-header") && !s.startsWith(".brand") && !s.startsWith("nav") && !s.startsWith(".skip") && !s.startsWith(".theme-button") && !s.startsWith("footer"));
  if (!selectors.length) { rule.remove(); return; }
  rule.selectors = selectors.map(s => `.education-lesson ${s}`);
});
css.walkDecls(decl => {
  decl.value = decl.value.replaceAll("LessonSans", "var(--font-pretendard), var(--font-pretendard-fallback)");
});
await writeFile("src/app/education/lesson.css", `/* Imported lesson styles, scoped to preserve the MERO shell and theme. */\n${css.toString()}\n`);
console.log("Imported 7 lesson chapters, scoped styles and curated offline assets.");

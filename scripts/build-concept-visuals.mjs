import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve, basename } from "node:path";
import { homedir } from "node:os";
import { createHash } from "node:crypto";
import postcss from "postcss";
import sharp from "sharp";

// Authors supply extended Markdown. answer-me-with-html owns the diagram layout.
const skill = process.env.ANSWER_HTML_SKILL_DIR || resolve(homedir(), ".codex/skills/answer-me-with-html");
const working = resolve(".local/concept-visuals");
const draftRoot = resolve("content/education/concept-visuals");
const generatedRoot = resolve("src/lib/education/generated");
const partial = process.argv.includes("--allow-partial");
const domains = ["development-setup", "control", "ros", "deepml", "localization", "simulation", "reinforcement-learning", "robot-vision"];
const lessons = new Map();
const panelsByLesson = {};
const provenance = {};
let sharedStyle;
let panelCount = 0;
await mkdir(working, { recursive: true });

function render(draft, output) {
  const run = spawnSync(process.execPath, [resolve(skill, "scripts/am.mjs"), "render", draft, "-o", output, "--no-open"], {encoding: "utf8"});
  if (run.error || run.status !== 0) throw new Error(run.error?.message || run.stderr || run.stdout);
  const log = `${run.stdout}\n${run.stderr}`;
  // Hints and warnings remain visible even when successful render output is quiet.
  if (/STE [1-9]|code [1-9]|! Cleanup hint:|! Update hint:/.test(log)) process.stdout.write(log);
}
function panels(html) {
  return [...html.matchAll(/<section class="am-panel" id="panel-[^"]+">([\s\S]*?)<\/section>/g)].map(match => {
    const title = match[1].match(/<h2>([\s\S]*?)<\/h2>/)?.[1];
    const body = match[1].match(/<div class="am-panel-body">([\s\S]*)<\/div>\s*$/)?.[1];
    if (!title || !body) throw new Error("Missing generated panel title/body");
    return { title, body };
  });
}
function namespaceIds(html, prefix) {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  for (const id of ids) html = html.replaceAll(`id="${id}"`, `id="${prefix}-${id}"`).replaceAll(`url(#${id})`, `url(#${prefix}-${id})`).replaceAll(`href="#${id}"`, `href="#${prefix}-${id}"`);
  return html;
}

for (const domain of domains) {
  const module = await import(`../src/lib/education/concepts/${domain}.ts`);
  const concepts = Object.values(module).find(value => Array.isArray(value) && value[0]?.sections);
  for (const lesson of concepts) {
    const path = `/education/${domain}/${lesson.slug}`;
    lessons.set(path, lesson);
    const draft = resolve(draftRoot, domain, `${lesson.slug}.md`);
    let markdown;
    try { markdown = await readFile(draft, "utf8"); } catch (error) { if (partial && error.code === "ENOENT") continue; throw error; }
    const headings = [...markdown.matchAll(/^## ([-\w]+)\s*\|\s*(.+)$/gm)];
    if (headings.length !== 3) throw new Error(`${path}: expected three section-linked visual panels`);
    const sectionIds = new Set(lesson.sections.map(section => section.id));
    if (headings.some(match => !sectionIds.has(match[1])) || new Set(headings.map(match => match[1])).size !== 3) throw new Error(`${path}: invalid section links`);
    if ([...markdown.matchAll(/^```(?:flow|tree|sequence|timeline)\b/gm)].length < 2) throw new Error(`${path}: needs two explanatory diagrams`);
    const output = resolve(working, `${domain}-${lesson.slug}.html`);
    render(draft, output);
    const html = await readFile(output, "utf8");
    const desktopPanels = panels(html);
    let mobilePanels = desktopPanels;
    const mobileMarkdown = markdown.replaceAll("```flow LR", "```flow TB")
      .replace(/^```tree\s*$/gm, "```tree list")
      .replace(/^```timeline(?: h)?\s*$/gm, "```timeline v");
    if (mobileMarkdown !== markdown) {
      const mobileDraft = resolve(working, `${domain}-${lesson.slug}-mobile.md`);
      const mobileOutput = resolve(working, `${domain}-${lesson.slug}-mobile.html`);
      await writeFile(mobileDraft, mobileMarkdown);
      render(mobileDraft, mobileOutput);
      mobilePanels = panels(await readFile(mobileOutput, "utf8"));
    }
    if (desktopPanels.length !== headings.length || mobilePanels.length !== headings.length) throw new Error(`${path}: rendered panel mismatch`);
    panelsByLesson[path] = desktopPanels.map((panel, index) => {
      const prefix = `cv-${domain}-${lesson.slug}-${index}`;
      let body = panel.body;
      if (mobilePanels[index].body !== body) body = `<div class="cv-desktop">${namespaceIds(body, "desktop")}</div><div class="cv-mobile">${namespaceIds(mobilePanels[index].body, "mobile")}</div>`;
      body = namespaceIds(body.replace(/<button\b[\s\S]*?<\/button>/g, ""), prefix);
      if (/<script\b|<iframe\b|\bon\w+\s*=|(?:src|href)\s*=\s*["']javascript:/i.test(body)) throw new Error(`${path}: executable content in visual`);
      panelCount++;
      return {sectionId: headings[index][1], title: headings[index][2], html: body};
    });
    provenance[path] = {draft: `content/education/concept-visuals/${domain}/${lesson.slug}.md`, sha256: createHash("sha256").update(markdown).digest("hex")};
    if (!sharedStyle) sharedStyle = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(match => match[1]).join("\n");
  }
}

const images = [];
const manifestRoot = resolve("content/education/reference-images");
let manifests = [];
try { manifests = (await readdir(manifestRoot)).filter(file => file.endsWith(".json")).sort(); } catch (error) { if (!partial || error.code !== "ENOENT") throw error; }
for (const manifest of manifests) {
  for (const asset of JSON.parse(await readFile(resolve(manifestRoot, manifest), "utf8"))) {
    if (!/^[\w.-]+\.(?:png|jpe?g|webp|svg)$/i.test(asset.fileName) || basename(asset.fileName) !== asset.fileName) throw new Error(`Invalid reference asset: ${asset.fileName}`);
    if (images.some(image => image.id === asset.id || image.fileName === asset.fileName)) throw new Error(`Duplicate reference: ${asset.id}`);
    for (const field of ["creator", "license", "modifications"]) if (!asset[field]?.trim()) throw new Error(`${asset.id}: missing ${field}`);
    for (const field of ["sourceUrl", "licenseUrl", "licenseEvidenceUrl"]) if (new URL(asset[field]).protocol !== "https:") throw new Error(`${asset.id}: invalid ${field}`);
    if (!asset.placements?.length) throw new Error(`${asset.id}: missing placement`);
    for (const placement of asset.placements) {
      if (!lessons.get(placement.lessonPath)?.sections.some(section => section.id === placement.sectionId)) throw new Error(`${asset.id}: unknown placement ${placement.lessonPath}#${placement.sectionId}`);
      if (!placement.alt?.trim() || !placement.caption?.trim()) throw new Error(`${asset.id}: missing image explanation`);
    }
    const bytes = await readFile(resolve("private/education-assets/references", asset.fileName));
    const metadata = await sharp(bytes).metadata();
    if (!metadata.width || !metadata.height) throw new Error(`${asset.id}: missing image dimensions`);
    images.push({...asset, width: metadata.width, height: metadata.height, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex")});
  }
}
if (!partial && (!images.length || Object.keys(panelsByLesson).length !== lessons.size)) throw new Error("Incomplete visual collection");
await mkdir(generatedRoot, {recursive: true});
await writeFile(resolve(generatedRoot, "concept-visuals.json"), JSON.stringify(panelsByLesson, null, 2) + "\n");
await writeFile(resolve(generatedRoot, "concept-reference-images.json"), JSON.stringify(images, null, 2) + "\n");
await writeFile(resolve(generatedRoot, "concept-visual-provenance.json"), JSON.stringify(provenance, null, 2) + "\n");
if (sharedStyle) {
  const css = postcss.parse(sharedStyle);
  css.walkRules(rule => {
    if (rule.parent.type === "atrule" && /keyframes$/.test(rule.parent.name)) return;
    rule.selectors = rule.selectors.map(selector => {
      const trimmed = selector.trim();
      if (/^(html|body|:root)(?=[\s[.:#]|$)/.test(trimmed)) return trimmed.replace(/^(html|body|:root)/, ".concept-visual-content").replaceAll("data-theme", "data-am-theme").replaceAll("data-mode", "data-am-mode");
      return `.concept-visual-content ${trimmed}`;
    });
  });
  await writeFile(resolve("src/app/education/concept-visuals.generated.css"), `/* Generated by scripts/build-concept-visuals.mjs using answer-me-with-html. */\n${css.toString()}`);
}
console.log(`Built ${panelCount} visual panels for ${Object.keys(panelsByLesson).length} lessons; ${images.length} licensed reference assets, ${images.reduce((n, image) => n + image.placements.length, 0)} placements.`);

import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import index from "../src/lib/education/generated/concept-index.json";
import panelData from "../src/lib/education/generated/concept-visuals.json";
import imageData from "../src/lib/education/generated/concept-reference-images.json";

type Panel = { sectionId: string; title: string; html: string };
type Asset = { id: string; fileName: string; creator: string; license: string; licenseUrl: string; sourceUrl: string; licenseEvidenceUrl: string; modifications: string; width: number; height: number; sha256: string; noticeFile?: string; placements: {lessonPath: string; sectionId: string; alt: string; caption: string}[] };
const panels = panelData as Record<string, Panel[]>;
const images = imageData as Asset[];
const lessons = Object.values(index.metadata).flat();

test("every new lesson has section-linked visual explanations and valid accessible diagrams", () => {
  assert.deepEqual(new Set(Object.keys(panels)), new Set(lessons.map(lesson => lesson.path)));
  for (const lesson of lessons) {
    const visuals = panels[lesson.path];
    assert.equal(visuals.length, 3, lesson.path);
    assert.equal(new Set(visuals.map(panel => panel.sectionId)).size, 3);
    const ids = new Set<string>();
    for (const panel of visuals) {
      assert.ok(lesson.chapters.some(chapter => chapter.id === panel.sectionId), `${lesson.path}#${panel.sectionId}`);
      assert.ok(panel.title.length > 5);
      assert.doesNotMatch(panel.html, /<script\b|<iframe\b|\bon\w+\s*=|javascript:/i);
      assert.doesNotMatch(panel.html, /data:image\//, "Reference assets should be served separately");
      for (const match of panel.html.matchAll(/\bid="([^"]+)"/g)) {
        assert.ok(!ids.has(match[1]), `${lesson.path}: duplicate SVG id ${match[1]}`);
        ids.add(match[1]);
      }
      for (const match of panel.html.matchAll(/<svg\b[^>]*>/g)) {
        assert.match(match[0], /role="img"/);
        assert.match(match[0], /aria-label="[^"]+"/);
      }
    }
    assert.ok(visuals.filter(panel => /am-(?:diagram|tree|timeline)/.test(panel.html)).length >= 2, `${lesson.path}: explain relationships visually`);
  }
});

test("reference figures retain asset-specific attribution, modification notes and verified local files", async () => {
  assert.ok(images.length >= 24, "Meaningful image coverage across eight topics");
  assert.equal(new Set(images.map(image => image.id)).size, images.length);
  for (const asset of images) {
    assert.match(asset.fileName, /^[\w.-]+\.(?:png|jpe?g|webp|svg)$/i);
    for (const url of [asset.sourceUrl, asset.licenseUrl, asset.licenseEvidenceUrl]) assert.equal(new URL(url).protocol, "https:");
    assert.ok(asset.creator && asset.license && asset.modifications);
    assert.ok(asset.width > 0 && asset.height > 0);
    const bytes = await readFile(`private/education-assets/references/${asset.fileName}`);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
    if (asset.noticeFile) await readFile(`private/education-assets/references/${asset.noticeFile}`);
    for (const placement of asset.placements) {
      const lesson = lessons.find(lesson => lesson.path === placement.lessonPath);
      assert.ok(lesson?.chapters.some(chapter => chapter.id === placement.sectionId), asset.id);
      assert.ok(placement.alt.length >= 10 && placement.caption.length >= 20, `${asset.id}: explain what to observe`);
    }
  }
});

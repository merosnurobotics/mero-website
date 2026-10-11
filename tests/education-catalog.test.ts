import assert from "node:assert/strict";
import { test } from "node:test";
import { educationTopics } from "../src/lib/education/catalog";
import { educationReadingOrder } from "../src/lib/education/curriculum";
import conceptIndex from "../src/lib/education/generated/concept-index.json";
import type { ConceptLesson } from "../src/lib/education/concepts/types";

const lessons = educationTopics.flatMap(topic => topic.lessons);
const paths = new Set(lessons.map(lesson => lesson.path));
test("all eight education areas contain at least ten distinct readable lessons", () => {
  assert.equal(educationTopics.length, 8);
  assert.equal(paths.size, lessons.length, "A lesson must belong to one topic only");
  for (const topic of educationTopics) {
    assert.ok(topic.lessons.length >= 10, topic.title);
    const order = (conceptIndex.orders as Record<string, string[]>)[topic.path];
    assert.deepEqual(topic.lessons.map(lesson => lesson.path), order, `${topic.title}: complete order`);
    assert.equal(new Set(order).size, order.length);
    let previous = -1;
    for (const lesson of topic.lessons) {
      const difficulty = ["입문", "기초", "응용"].indexOf(lesson.level!);
      assert.ok(difficulty >= previous, `${lesson.path}: difficulty moves backwards`);
      previous = difficulty;
    }
  }
  assert.deepEqual(new Set(educationReadingOrder.map(lesson => lesson.path)), paths);
});
test("object recognition and VLA share the robot vision topic and their existing URLs", () => {
  const vision = educationTopics.find(topic => topic.path === "/education/robot-vision")!;
  assert.equal(vision.title, "로봇 비전");
  assert.ok(vision.lessons.some(lesson => lesson.path === "/education/object-recognition/synthetic-data"));
  assert.ok(vision.lessons.some(lesson => lesson.path === "/education/vla/foundations"));
  assert.ok(!educationTopics.some(topic => ["/education/vla", "/education/object-recognition"].includes(topic.path)));
});
for (const topic of educationTopics) test(`${topic.title}: sources, complete explanations, and valid prerequisites`, async () => {
  const module = await import(`../src/lib/education/concepts/${topic.path.split("/").at(-1)}.ts`);
  const concepts = Object.values(module).find(value => Array.isArray(value) && value[0]?.sections) as ConceptLesson[];
  assert.ok(concepts?.length);
  for (const lesson of concepts) {
    const path = `${topic.path}/${lesson.slug}`;
    assert.ok(paths.has(path), path);
    assert.ok(lesson.sections.length >= 4, path);
    assert.ok(lesson.sections.every(section => section.paragraphs.length >= 2), path);
    assert.ok(lesson.sections.flatMap(section => section.paragraphs).join("").length >= 1800, `${path}: explanation too brief`);
    const explanation = [lesson.sections.flatMap(section => section.paragraphs).join(""), lesson.example.situation, ...lesson.example.walkthrough, lesson.example.takeaway, ...lesson.misconceptions.map(item => item.correction), ...lesson.questions.map(item => item.answer)].join("");
    assert.ok(explanation.length >= 2400, `${path}: incomplete teaching content`);
    assert.ok(lesson.sources.length >= 2 && lesson.questions.length >= 2 && lesson.misconceptions.length >= 2, path);
    for (const source of lesson.sources) {
      assert.equal(new URL(source.url).protocol, "https:");
      assert.ok(source.note.trim().length > 10, `${path}: source scope`);
    }
    const ids = [...lesson.sections.map(section => section.id), "worked-example", "misconceptions", "self-check", "sources"];
    assert.equal(new Set(ids).size, ids.length, `${path}: duplicate anchors`);
    for (const prerequisite of lesson.prerequisites) {
      const [base, hash] = prerequisite.split("#");
      const priorLesson = lessons.find(item => item.path === base);
      assert.ok(priorLesson, `${path}: missing prerequisite ${prerequisite}`);
      if (hash) assert.ok(priorLesson.chapters.some(chapter => chapter.id === hash), prerequisite);
      const priorIndex = topic.lessons.findIndex(item => item.path === base);
      if (priorIndex >= 0) assert.ok(priorIndex < topic.lessons.findIndex(item => item.path === path), `${path}: prerequisite must come first`);
    }
  }
});

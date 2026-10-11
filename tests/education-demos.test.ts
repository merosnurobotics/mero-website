import assert from "node:assert/strict";
import { test } from "node:test";
import { educationTopics } from "../src/lib/education/catalog";
import { robotDemos, lessonDemoConnections, demosForLesson } from "../src/lib/education/robot-demos";

test("robot demos have attributed original sources and valid lesson connections", () => {
  const lessonPaths = new Set(educationTopics.flatMap(topic => topic.lessons.map(lesson => lesson.path)));
  const ids = new Set(robotDemos.map(demo => demo.id));
  assert.equal(ids.size, robotDemos.length);
  for (const demo of robotDemos) {
    assert.equal(Number(Boolean(demo.youtubeId)) + Number(Boolean(demo.videoUrl)), 1, demo.id);
    if (demo.youtubeId) assert.match(demo.youtubeId, /^[\w-]{11}$/);
    for (const url of [demo.sourceUrl, demo.watchUrl, demo.videoUrl].filter(Boolean)) assert.equal(new URL(url!).protocol, "https:");
    assert.ok(demo.publisher && demo.kind && demo.description.length > 40, demo.id);
    assert.ok(lessonDemoConnections.some(connection => connection.demoId === demo.id), `Unused demo: ${demo.id}`);
  }
  const connections = new Set<string>();
  for (const connection of lessonDemoConnections) {
    assert.ok(lessonPaths.has(connection.path), connection.path);
    assert.ok(ids.has(connection.demoId), connection.demoId);
    assert.ok(connection.focus.every(point => point.length > 25));
    assert.ok(!connections.has(`${connection.path}/${connection.demoId}`), "Duplicate video on a lesson");
    connections.add(`${connection.path}/${connection.demoId}`);
  }
  for (const topic of educationTopics) assert.ok(topic.lessons.some(lesson => demosForLesson(lesson.path).length), topic.title);
  assert.deepEqual(demosForLesson("/unknown"), []);
  assert.ok(demosForLesson("/education/reinforcement-learning/reward-design").some(item => item.demo.id === "umv-training"));
});

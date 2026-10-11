import { writeFile } from "node:fs/promises";
import type { ConceptLesson } from "../src/lib/education/concepts/types";
import { lessonDemoConnections } from "../src/lib/education/robot-demos";

const domains = [
  ["development-setup", "developmentSetupConcepts", "developmentSetupOrder"],
  ["control", "controlConcepts", "controlOrder"],
  ["ros", "rosConcepts", "rosOrder"],
  ["deepml", "deepMLConcepts", "deepMLOrder"],
  ["localization", "localizationConcepts", "localizationOrder"],
  ["simulation", "simulationConcepts", "simulationOrder"],
  ["reinforcement-learning", "reinforcementLearningConcepts", "reinforcementLearningOrder"],
  ["robot-vision", "robotVisionConcepts", "robotVisionOrder"],
];
async function main() {
const metadata: Record<string, unknown[]> = {};
const orders: Record<string, string[]> = {};
for (const [domain, contentName, orderName] of domains) {
  const module = await import(`../src/lib/education/concepts/${domain}.ts`);
  const lessons: ConceptLesson[] = module[contentName];
  if (!lessons?.length || !module[orderName]?.length) throw new Error(`Missing content or order: ${domain}`);
  const topicPath = `/education/${domain}`;
  metadata[topicPath] = lessons.map(lesson => ({
    path: `${topicPath}/${lesson.slug}`,
    shortTitle: lesson.shortTitle,
    title: lesson.title,
    label: `${lesson.level} · 개념 해설`,
    description: lesson.description,
    level: lesson.level,
    minutes: lesson.minutes,
    goals: lesson.goals,
    prerequisites: lesson.prerequisites,
    chapters: [
      ...lesson.sections.map(section => ({ id: section.id, label: section.title })),
      { id: "worked-example", label: "로봇 사례로 이해하기" },
      { id: "misconceptions", label: "자주 하는 오해" },
      { id: "self-check", label: "이해 확인" },
      { id: "sources", label: "원문과 참고 자료" },
    ],
  }));
  orders[topicPath] = module[orderName];
}
const demoPaths = [...new Set(lessonDemoConnections.map(connection => connection.path))];
await writeFile("src/lib/education/generated/concept-index.json", JSON.stringify({ metadata, orders, demoPaths }, null, 2) + "\n");
console.log(`Built ${Object.values(metadata).reduce((n, items) => n + items.length, 0)} concept lessons across ${domains.length} topics.`);

}
main().catch(error => { console.error(error); process.exitCode = 1; });

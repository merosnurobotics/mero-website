import "server-only";
import type { ConceptLesson } from "./types";

// Bodies are loaded only on the server. The sidebar consumes generated metadata.
const loaders: Record<string, () => Promise<ConceptLesson[]>> = {
  "development-setup": () => import("./development-setup").then(m => m.developmentSetupConcepts),
  control: () => import("./control").then(m => m.controlConcepts),
  ros: () => import("./ros").then(m => m.rosConcepts),
  deepml: () => import("./deepml").then(m => m.deepMLConcepts),
  localization: () => import("./localization").then(m => m.localizationConcepts),
  simulation: () => import("./simulation").then(m => m.simulationConcepts),
  "reinforcement-learning": () => import("./reinforcement-learning").then(m => m.reinforcementLearningConcepts),
  "robot-vision": () => import("./robot-vision").then(m => m.robotVisionConcepts),
};
export async function findConceptLesson(topic: string, slug: string) {
  return (await loaders[topic]?.())?.find(lesson => lesson.slug === slug);
}

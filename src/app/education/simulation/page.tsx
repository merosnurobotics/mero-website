import type { Metadata } from "next";
import { EducationTopicContent } from "@/components/education/topic-content";
import { simulationTopic } from "@/lib/education/simulation-catalog";
export const metadata: Metadata = { title: "로보틱스 · MuJoCo" };
export default function SimulationPage() { return <EducationTopicContent topic={simulationTopic}/>; }

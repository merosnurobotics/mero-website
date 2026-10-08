import type { Metadata } from "next";
import { EducationTopicContent } from "@/components/education/topic-content";
import { simulationTopic } from "@/lib/education/simulation-catalog";
export const metadata: Metadata = { title: "로보틱스 · 시뮬레이션" };
export default function SimulationPage() { return <EducationTopicContent topic={simulationTopic}/>; }

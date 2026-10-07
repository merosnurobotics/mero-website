import type { Metadata } from "next";
import { EducationTopicContent } from "@/components/education/topic-content";
import { educationTopics } from "@/lib/education/catalog";
export const metadata: Metadata = { title: "강화학습 교육" };
export default function ReinforcementLearningPage() { return <EducationTopicContent topic={educationTopics[0]}/>; }

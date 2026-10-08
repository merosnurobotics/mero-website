import type { Metadata } from "next";
import { EducationTopicContent } from "@/components/education/topic-content";
import { educationTopics, reinforcementLearningPath } from "@/lib/education/catalog";
export const metadata: Metadata = { title: "강화학습 교육" };
export default function ReinforcementLearningPage() { return <EducationTopicContent topic={educationTopics.find(topic => topic.path === reinforcementLearningPath)!}/>; }

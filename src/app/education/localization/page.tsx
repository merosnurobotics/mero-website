import type { Metadata } from "next";
import { EducationTopicContent } from "@/components/education/topic-content";
import { educationTopics } from "@/lib/education/catalog";
export const metadata: Metadata = { title: "Localization 교육" };
export default function TopicPage() { return <EducationTopicContent topic={educationTopics.find(topic => topic.path === "/education/localization")!}/>; }

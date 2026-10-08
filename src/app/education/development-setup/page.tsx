import type { Metadata } from "next";
import { EducationTopicContent } from "@/components/education/topic-content";
import { educationTopics } from "@/lib/education/catalog";
export const metadata: Metadata = { title: "개발 환경 준비 교육" };
export default function TopicPage() { return <EducationTopicContent topic={educationTopics.find(topic => topic.path === "/education/development-setup")!}/>; }

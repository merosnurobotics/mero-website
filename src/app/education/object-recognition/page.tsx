import type { Metadata } from "next";
import { EducationTopicContent } from "@/components/education/topic-content";
import { educationTopics, objectRecognitionPath } from "@/lib/education/catalog";
export const metadata: Metadata = { title: "객체인식 교육" };
export default function ObjectRecognitionPage() { return <EducationTopicContent topic={educationTopics.find(topic => topic.path === objectRecognitionPath)!}/>; }

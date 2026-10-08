import type { Metadata } from "next";
import { EducationTopicContent } from "@/components/education/topic-content";
import { deepMLTopic } from "@/lib/education/deepml-catalog";

export const metadata: Metadata = { title: "DeepML · 딥러닝의 기초" };
export default function DeepMLPage() { return <EducationTopicContent topic={deepMLTopic}/>; }

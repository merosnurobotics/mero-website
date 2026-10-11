import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findConceptLesson } from "@/lib/education/concepts";
import { ConceptLessonContent } from "./concept-lesson";
export async function conceptMetadata(topic: string, slug: string): Promise<Metadata> {
  const lesson = await findConceptLesson(topic, slug);
  if (!lesson) notFound();
  return { title: lesson.title, description: lesson.description };
}
export async function ConceptPage({ topic, slug }: { topic: string; slug: string }) {
  const lesson = await findConceptLesson(topic, slug);
  if (!lesson) notFound();
  return <ConceptLessonContent lesson={lesson} topicSlug={topic}/>;
}

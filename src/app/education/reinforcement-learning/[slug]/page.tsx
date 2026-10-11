import { notFound } from "next/navigation";
import LegacyPage, { generateMetadata as legacyMetadata } from "../../deepml/[slug]/page";
import { findConceptLesson } from "@/lib/education/concepts";
import { ConceptLessonContent } from "@/components/education/concept-lesson";
import { educationTopics } from "@/lib/education/catalog";
type Props = { params: Promise<{ slug: string }> };
const topic = "reinforcement-learning";
const legacySlugs = ["reinforcement-learning", "policy-and-robot"];
export function generateStaticParams() { return educationTopics.find(item => item.path === `/education/${topic}`)!.lessons.filter(item => !item.path.endsWith("/kimodo-mjwarp")).map(item => ({ slug: item.path.split("/").at(-1)! })); }
export async function generateMetadata(props: Props) {
  const { slug } = await props.params;
  const lesson = await findConceptLesson(topic, slug);
  if (lesson) return { title: lesson.title, description: lesson.description };
  if (!legacySlugs.includes(slug)) notFound();
  return legacyMetadata(props);
}
export default async function Page(props: Props) {
  const { slug } = await props.params;
  const lesson = await findConceptLesson(topic, slug);
  if (lesson) return <ConceptLessonContent lesson={lesson} topicSlug={topic}/>;
  if (!legacySlugs.includes(slug)) notFound();
  return <LegacyPage {...props}/>;
}

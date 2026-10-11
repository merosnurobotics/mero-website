import { ConceptPage, conceptMetadata } from "@/components/education/concept-route";
import { educationTopics } from "@/lib/education/catalog";
type Props = { params: Promise<{ slug: string }> };
const topic = "control";
export function generateStaticParams() {
  return educationTopics.find(item => item.path === `/education/${topic}`)!.lessons.filter(lesson => lesson.goals && lesson.path.startsWith(`/education/${topic}/`)).map(lesson => ({ slug: lesson.path.split("/").at(-1)! }));
}
export async function generateMetadata({ params }: Props) { return conceptMetadata(topic, (await params).slug); }
export default async function Page({ params }: Props) { return <ConceptPage topic={topic} slug={(await params).slug}/>; }

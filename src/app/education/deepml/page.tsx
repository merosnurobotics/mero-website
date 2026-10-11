import { EducationTopicContent } from "@/components/education/topic-content";
import { educationTopics } from "@/lib/education/catalog";
const topic = educationTopics.find(item => item.path === "/education/deepml")!;
export const metadata = { title: topic.title };
export default function DeepMLPage() { return <EducationTopicContent topic={topic}/>; }

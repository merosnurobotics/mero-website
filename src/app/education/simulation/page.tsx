import { EducationTopicContent } from "@/components/education/topic-content";
import { educationTopics } from "@/lib/education/catalog";
const topic = educationTopics.find(item => item.path === "/education/simulation")!;
export const metadata = { title: topic.title };
export default function SimulationPage() { return <EducationTopicContent topic={topic}/>; }

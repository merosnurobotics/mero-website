import { EducationTopicContent } from "@/components/education/topic-content";
import { educationTopics, robotVisionPath } from "@/lib/education/catalog";
export const metadata = { title: "로봇 비전 · 객체인식에서 VLA까지" };
export default function Page() { return <EducationTopicContent topic={educationTopics.find(topic => topic.path === robotVisionPath)!}/>; }

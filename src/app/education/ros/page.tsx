import type { Metadata } from "next";
import { EducationTopicContent } from "@/components/education/topic-content";
import { educationTopics } from "@/lib/education/catalog";
export const metadata: Metadata = {title:"ROS 교육"};
export default function Page() {return <EducationTopicContent topic={educationTopics.find(t=>t.path==="/education/ros")!}/>;}

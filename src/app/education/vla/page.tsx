import type {Metadata} from "next";
import {EducationTopicContent} from "@/components/education/topic-content";
import {vlaTopic} from "@/lib/education/vla-catalog";
export const metadata:Metadata={title:"VLA · 로봇 조작"};
export default function Page(){return <EducationTopicContent topic={vlaTopic}/>;}

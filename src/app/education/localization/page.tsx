import type { Metadata } from "next";
import { EducationTopicContent } from "@/components/education/topic-content";
import { educationTopics } from "@/lib/education/catalog";
export const metadata: Metadata = { title: "Localization 교육" };
export default function TopicPage() { return <><EducationTopicContent topic={educationTopics.find(topic => topic.path === "/education/localization")!}/><p className="education-note">02 · 위치를 ROS 2 토픽으로 내보내기는 <a href="/education/ros/localization-topics">ROS 시리즈</a>에서 이어집니다. 객체 위치 추정은 03 회차로 유지합니다.</p></>; }

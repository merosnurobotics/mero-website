import { educationMembersOnly } from "@/lib/education/settings";
import { headers } from "next/headers";
import { requireEducationMember } from "@/lib/education/access";
import { EducationSidebar } from "@/components/education/sidebar";
import "./lesson.css";
import "./education.css";

export function generateMetadata() { return { robots: { index: !educationMembersOnly(), follow: !educationMembersOnly() } }; }

export default async function EducationLayout({ children }: { children: React.ReactNode }) {
  await requireEducationMember((await headers()).get("x-mero-education-path") || "/education");
  return <div className="container education-layout"><EducationSidebar/><div className="education-content">{children}</div></div>;
}

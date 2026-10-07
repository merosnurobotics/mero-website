import { EducationSidebar } from "@/components/education/sidebar";
import "./lesson.css";
import "./education.css";

export default function EducationLayout({ children }: { children: React.ReactNode }) {
  return <div className="container education-layout"><EducationSidebar/><div className="education-content">{children}</div></div>;
}

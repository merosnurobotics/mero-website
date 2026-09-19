import { projects } from "@/data/site";
import ProjectDetail from "./ProjectDetail";

// Prerender one page per project.
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectDetailPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  return <ProjectDetail slug={slug} />;
}

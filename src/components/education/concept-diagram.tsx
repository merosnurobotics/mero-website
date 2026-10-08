import "server-only";
import diagrams from "@/lib/education/generated/diagrams.json";

export function ConceptDiagram({ name, caption }: { name: keyof typeof diagrams; caption: string }) {
  return <div className="education-concept-figure" data-am-theme="shadcn" data-am-mode="light"><div dangerouslySetInnerHTML={{ __html: diagrams[name] }}/><p className="education-diagram-caption">{caption}</p></div>;
}

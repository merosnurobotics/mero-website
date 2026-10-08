import generated from "@/lib/education/generated/foundations.json";
export function FoundationChapter({ id }: { id: keyof typeof generated }) {
  const content = generated[id];
  return <section className="perception-chapter education-foundation" id={id}>
    <p className="eyebrow">공통 기초</p><h2>{content.title}</h2>
    <div className="deepml-content" data-am-theme="shadcn" data-am-mode="light" dangerouslySetInnerHTML={{__html:content.html}}/>
  </section>;
}

import Image from "next/image";
import type { ReactNode } from "react";
import executionResults from "@/lib/education/execution-results.json";

export function ExecutionResult({ id, alt, children }: {
  id: keyof typeof executionResults;
  alt: string;
  children?: ReactNode;
}) {
  const result = executionResults[id];
  return <figure className="education-execution-result">
    <div className="education-execution-image">
      <Image unoptimized src={`/education-assets/execution/${result.image}`} width={result.width} height={result.height} alt={alt} sizes="(max-width: 767px) 100vw, 1000px" style={{ width: "100%", height: "auto" }}/>
    </div>
    {children && <figcaption>{children}</figcaption>}
  </figure>;
}

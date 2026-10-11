import "server-only";
import visualData from "@/lib/education/generated/concept-visuals.json";
import imageData from "@/lib/education/generated/concept-reference-images.json";

type Visual = { sectionId: string; title: string; html: string };
type ReferenceImage = {
  id: string; fileName: string; width: number; height: number;
  creator: string; sourceUrl: string; license: string; licenseUrl: string;
  licenseEvidenceUrl: string; modifications: string; noticeFile?: string;
  placements: { lessonPath: string; sectionId: string; alt: string; caption: string }[];
};
const visuals = visualData as Record<string, Visual[]>;
const images = imageData as ReferenceImage[];

export function ConceptVisual({ path, sectionId }: { path: string; sectionId: string }) {
  const panel = visuals[path]?.find(item => item.sectionId === sectionId);
  if (!panel) return null;
  return <aside className="concept-visual" aria-label={panel.title}>
    <p className="concept-visual-label">그림으로 이해하기</p>
    <h3>{panel.title}</h3>
    <div className="concept-visual-content" data-am-theme="shadcn" data-am-mode="light" dangerouslySetInnerHTML={{ __html: panel.html }}/>
  </aside>;
}

export function ConceptReferenceImages({ path, sectionId }: { path: string; sectionId: string }) {
  const matches = images.flatMap(asset => asset.placements.filter(item => item.lessonPath === path && item.sectionId === sectionId).map(placement => ({ asset, placement })));
  if (!matches.length) return null;
  return <div className="concept-reference-images">
    {matches.map(({ asset, placement }) => <figure className="concept-reference" key={asset.id}>
      <div className="concept-reference-media"><a href={`/education-assets/references/${asset.fileName}`} target="_blank" rel="noopener noreferrer" aria-label={`${placement.alt} — 이미지 확대 보기`}>
        {/* The authenticated asset route serves the licensed original proportions directly. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/education-assets/references/${asset.fileName}`} width={asset.width} height={asset.height} alt={placement.alt} loading="lazy" decoding="async"/>
      </a></div>
      <figcaption>
        <p className="concept-reference-caption">{placement.caption}</p>
        <p className="concept-reference-credit">{asset.creator} · <a href={`/education-assets/references/${asset.fileName}`} target="_blank" rel="noopener noreferrer">이미지 확대</a> · <a href={asset.sourceUrl}>원문</a> · <a href={asset.licenseUrl}>{asset.license}</a></p>
        <p className="concept-reference-credit">{asset.modifications} · <a href={asset.licenseEvidenceUrl}>사용 조건</a>{asset.noticeFile && <> · <a href={`/education-assets/references/${asset.noticeFile}`}>저작권 고지</a></>}</p>
      </figcaption>
    </figure>)}
  </div>;
}

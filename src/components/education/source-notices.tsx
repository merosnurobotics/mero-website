import notices from "@/lib/education/generated/source-notices.json";
export function SourceNotices({ sources }: { sources: (keyof typeof notices)[] }) {
  return <details className="education-recipe"><summary>출처·저작권·편집 범위</summary>
    {sources.length === 1 && sources[0] === "manimml" ? <p>신경망 구조와 계산 흐름은 MERO가 직접 구성하고 렌더링했습니다. 라이브러리의 저작권·라이선스는 아래와 같습니다.</p> : <p>원문의 입문 설명을 선별 번역·요약하고 로봇 사례를 더했습니다. 한국어 번역·편집과 별도 실행 예제: MERO. 외부 그림은 별도로 출처를 표시하며 원문 전체를 옮긴 자료는 아닙니다.</p>}
    {sources.map(key => { const source = notices[key]; return <div key={key}>
      <p><a href={source.url}>{source.title}</a> · {source.original} · <a href={source.licenseUrl}>{source.licenseName}</a> · 원문 버전 <code>{source.sha.slice(0,7)}</code></p>
      <pre className="deepml-license">{source.license}</pre>
    </div>; })}
  </details>;
}

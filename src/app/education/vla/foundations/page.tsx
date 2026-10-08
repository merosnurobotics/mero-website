import {Breadcrumbs} from "@/components/shared";
import {LessonContext,LessonNavigation} from "@/components/education/lesson-context";
import {requireEducationMember} from "@/lib/education/access";
import {vlaLessons,vlaPath} from "@/lib/education/vla-catalog";
import generated from "@/lib/education/generated/deepml.json";
const lesson=vlaLessons[0];
export const metadata={title:lesson.title,description:lesson.description};
export default async function Page(){
 await requireEducationMember(lesson.path);
 return <><Breadcrumbs items={[{label:"교육",href:"/education"},{label:"VLA",href:vlaPath},{label:lesson.shortTitle}]}/><article className="perception-lesson deepml-lesson"><header className="perception-hero"><p className="eyebrow">VLA · 개념 입문</p><h1>{lesson.title}</h1><p>{lesson.description}</p></header><LessonContext path={lesson.path}/>{generated.foundations.map((chapter,index)=><section className="perception-chapter" id={chapter.id} key={chapter.id}><h2>{index+1}. {chapter.title}</h2><div className="deepml-content" data-am-theme="shadcn" data-am-mode="light" dangerouslySetInnerHTML={{__html:chapter.html}}/></section>)}<footer className="education-sources"><h2>참고 범위</h2><p>공식 자료의 개념을 참고해 MERO가 설명과 도식을 작성했습니다. RB-Y1 장비 실행이나 모델 미세조정 결과를 제시한 자료가 아닙니다.</p></footer></article><LessonNavigation path={lesson.path}/></>;
}

import type { Metadata } from "next";
import { Breadcrumbs, PageIntro } from "@/components/shared";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
export async function generateMetadata(): Promise<Metadata> { return { title: tr(await getLocale(), "개인정보 안내", "Privacy"), robots: { index: false } }; }
export default async function PrivacyPage() {
  if ((await getLocale()) === "en") return <div className="container page-content prose-page"><Breadcrumbs items={[{ label: "Privacy" }]}/><PageIntro title="How we use member information." description="How information is handled for MERO sign-up, approval and use of the robot guides."/>
    <h2>Information you provide when signing up</h2><p>You enter your name, email and password; affiliation/department is optional. Your name and email are used to verify club membership and run the club. Passwords are stored as scrypt hashes with an individual salt and are never shown on the admin screen.</p>
    <h2>Approval and access rights</h2><p>After you sign up, a club admin approves your membership. Admins can see your name, email, affiliation/department, sign-up date and membership status. Only approved members can use robot network addresses, SSH settings and operating manuals.</p>
    <h2>Login and retention</h2><p>To keep you logged in, we use a session cookie that JavaScript in the browser cannot read. Sessions last up to 7 days. Member information is stored in the site database. You can update your information in My account; to delete your account and information, please contact the MERO officers.</p>
    <h2>External videos and links</h2><p>YouTube videos load only after you press the play button. When you use external videos or article links, that service&apos;s privacy policy applies.</p>
    <h2>Contact</h2><p>Please direct questions about member information, approval and deletion to the MERO club officers in Building 301, Seoul National University.</p></div>;
  return <div className="container page-content prose-page"><Breadcrumbs items={[{ label: "개인정보 안내" }]}/><PageIntro title="회원 정보는 이렇게 사용합니다." description="MERO 회원 가입, 승인과 로봇 안내 이용을 위한 정보 처리 안내입니다."/>
  <h2>회원 가입 시 입력하는 정보</h2><p>이름, 이메일, 비밀번호를 입력하며 소속·학과는 선택 사항입니다. 이름과 이메일은 동아리 회원 확인과 운영에 사용합니다. 비밀번호는 개별 salt를 사용한 scrypt 해시로 저장하며 관리 화면에 표시되지 않습니다.</p>
  <h2>승인과 접근 권한</h2><p>가입 후 동아리 관리자가 회원을 승인합니다. 관리자는 이름, 이메일, 소속·학과, 가입 시점과 회원 상태를 확인할 수 있습니다. 승인된 회원만 로봇의 네트워크 주소, SSH 설정과 운용 설명서를 이용할 수 있습니다.</p>
  <h2>로그인과 보관</h2><p>로그인 유지를 위해 브라우저에서 JavaScript로 읽을 수 없는 세션 쿠키를 사용합니다. 세션은 최대 7일 동안 유지됩니다. 회원 정보는 사이트 데이터베이스에 저장됩니다. 정보 수정은 내 계정에서 할 수 있으며 탈퇴와 정보 삭제는 MERO 운영진에게 요청해 주세요.</p>
  <h2>외부 영상과 링크</h2><p>YouTube 영상은 재생 버튼을 누른 후 로드됩니다. 외부 영상이나 기사 링크를 이용하면 해당 서비스의 정보 처리 정책이 적용됩니다.</p>
  <h2>문의</h2><p>회원 정보, 승인과 삭제 관련 문의는 서울대학교 301동 MERO 동아리 운영진에게 전달해 주세요.</p></div>;
}

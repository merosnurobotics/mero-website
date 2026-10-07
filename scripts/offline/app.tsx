import { Component, useEffect, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "@radix-ui/themes/styles.css";
import Home from "../../src/app/page";
import About from "../../src/app/about/page";
import Activities from "../../src/app/activities/page";
import Activity from "../../src/app/activities/[slug]/page";
import Projects from "../../src/app/projects/page";
import Project from "../../src/app/projects/[slug]/page";
import Robots from "../../src/app/robots/page";
import Robot from "../../src/app/robots/[slug]/page";
import Login from "../../src/app/login/page";
import Signup from "../../src/app/signup/page";
import Account from "../../src/app/account/page";
import Admin from "../../src/app/admin/page";
import Privacy from "../../src/app/privacy/page";
import NotFound from "../../src/app/not-found";
import { Header } from "../../src/components/header";
import { Footer } from "../../src/components/shared";
import { ThemeProvider } from "../../src/components/theme-provider";
import { ArrowRight, ArrowUpRight, ArrowCounterClockwise, CaretDown, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { projects } from "../../src/lib/content";
import { currentMember, getRobot, getRobots, chooseRole, resetDemo, storeVersion, subscribeStore } from "./store";
import { navigate, useRoute } from "./navigation";
import { connectionConfigured, setupScript, sshConfig } from "../../src/lib/ssh";

const views = [
  ["/", "홈"], ["/about", "동아리 소개"], ["/activities", "활동"], ["/projects", "전체 프로젝트"],
  ...projects.map(project => [`/projects/${project.id}`, project.title]),
  ["/activities/ai-robot-challenge", "AI 로봇챌린지"], ["/activities/ri-opening", "RI 개소식"],
  ["/robots", "로봇 안내"], ...getRobots().map(robot => [`/robots/${robot.id}`, `${robot.name} 안내`]),
  ["/signup", "회원가입"], ["/login", "로그인"], ["/account", "내 계정"], ["/admin", "동아리 관리"], ["/privacy", "개인정보 안내"],
];
function ready<T extends object>(value: T): Promise<T> & T { return Object.assign(Promise.resolve(value), value); }
function download(text: string, filename: string) { const url = URL.createObjectURL(new Blob([text], {type:"text/plain;charset=utf-8"})); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 2000); }

function PreviewBar({ route }: { route: string }) {
  const member = currentMember(); const role = !member ? "visitor" : member.role === "admin" ? "admin" : member.status === "pending" ? "pending" : "member";
  function changeView(path: string) {
    if (path === "/admin") chooseRole("admin");
    if (path === "/account" && !currentMember()) chooseRole("member");
    if (["/login","/signup"].includes(path)) chooseRole("visitor");
    navigate(path);
  }
  return <div className="preview-toolbar"><div className="container preview-toolbar-inner"><div className="preview-purpose"><span>공유용 초안</span><p>가입·관리 기능은 데모입니다.</p></div><div className="preview-tools"><label className="preview-view-select"><span className="sr-only">미리보기 페이지</span><select aria-label="미리보기 페이지" value={views.some(item => item[0] === route) ? route : "/"} onChange={event => changeView(event.target.value)}>{views.map(([path,label]) => <option key={path} value={path}>{label}</option>)}</select><CaretDown size={13}/></label><div className="preview-role-buttons" aria-label="화면 체험 권한">{([{id:"visitor",label:"방문자"},{id:"member",label:"회원"},{id:"admin",label:"관리자"}] as const).map(item => <button key={item.id} type="button" aria-pressed={role === item.id} className={role === item.id ? "selected" : ""} onClick={() => { chooseRole(item.id); if(item.id === "admin") navigate("/admin"); else if (["/login","/signup","/admin","/account"].includes(route)) navigate(item.id === "visitor" ? "/" : "/account"); }}>{item.label}</button>)}</div><button className="preview-reset icon-button" aria-label="데모 초기화" title="데모 초기화" onClick={() => { resetDemo();navigate("/"); }}><ArrowCounterClockwise size={16}/></button></div></div></div>;
}

function DemoAuthHelp({ next }: { next?: string }) {
  return <div className="container demo-auth-help"><div><UsersThree size={20}/><div><h2>가입과 로그인 흐름을 체험해 보세요.</h2><p>입력은 이 파일의 메모리에만 저장되며 새로 열면 초기화됩니다. 샘플 계정 비밀번호는 <code>mero-demo-2026</code>입니다.</p><p className="demo-account-examples">회원: member@mero.demo · 관리자: admin@mero.demo</p></div></div><div className="demo-auth-actions"><button className="button button-outline button-small" onClick={() => {chooseRole("member");navigate(next || "/account");}}>회원으로 둘러보기<ArrowRight size={15}/></button><button className="button button-small" onClick={() => {chooseRole("admin");navigate(next || "/admin");}}>관리자로 둘러보기<ArrowUpRight size={15}/></button></div></div>;
}
function AccessPreview({ admin }: { admin: boolean }) { return <div className="container not-found"><UsersThree size={43}/><h1>{admin ? "관리자 화면을 둘러보세요." : "내 계정 화면을 둘러보세요."}</h1><p>공유용 초안에서 회원 승인과 로봇 관리를 체험할 수 있습니다.</p><button className="button" onClick={() => {chooseRole(admin ? "admin" : "member");navigate(admin ? "/admin" : "/account");}}>{admin ? "관리자 화면 보기" : "회원 화면 보기"}<ArrowRight size={18}/></button></div>; }
function RouteContent({ path, query }: { path: string; query: Record<string,string> }) {
  const member = currentMember();
  if (path === "/") return <Home/>;
  if (path === "/about") return <About/>;
  if (["/activities","/history"].includes(path)) return <Activities/>;
  if (path === "/projects") return <Projects/>;
  if (path.startsWith("/projects/") && projects.some(project => project.id === path.split("/")[2])) return <Project params={ready({slug:path.split("/")[2]})}/>;
  if (path.startsWith("/activities/") && ["ai-robot-challenge","ri-opening"].includes(path.split("/")[2])) return <Activity params={ready({slug:path.split("/")[2]})}/>;
  if (path === "/robots") return <Robots/>;
  if (path.startsWith("/robots/") && getRobot(path.split("/")[2])) return <Robot params={ready({slug:path.split("/")[2]})}/>;
  if (path === "/login") return member ? <Account/> : <><DemoAuthHelp next={query.next}/><Login searchParams={ready(query)}/></>;
  if (path === "/signup") return member ? <Account/> : <><DemoAuthHelp/><Signup/></>;
  if (path === "/account") return member ? <Account/> : <AccessPreview admin={false}/>;
  if (path === "/admin") return member ? <Admin searchParams={ready(query)}/> : <AccessPreview admin/>;
  if (path === "/privacy") return <><div className="container preview-privacy-note">아래 내용은 정식 사이트의 운영 안내 초안입니다. 이 공유 파일에서는 입력을 외부 서버로 전송하지 않습니다.</div><Privacy/></>;
  return <NotFound/>;
}

class PreviewBoundary extends Component<{children:ReactNode;route:string}, {error:string}> {
  state = { error: "" };
  static getDerivedStateFromError(error: unknown) { return { error: error instanceof Error ? error.message : "미리보기 화면을 열지 못했습니다." }; }
  componentDidUpdate(previous: { route: string }) { if (previous.route !== this.props.route && this.state.error) this.setState({error:""}); }
  render() { return this.state.error ? <div className="container not-found"><h1>화면을 다시 열어주세요.</h1><p>{this.state.error}</p><button className="button" onClick={() => {this.setState({error:""});navigate("/");}}>홈으로 돌아가기</button></div> : this.props.children; }
}
function App() {
  useSyncExternalStore(subscribeStore,storeVersion,storeVersion);
  const route = useRoute(); const parsed = new URL(route, "https://mero.invalid"); const path = parsed.pathname; const query = Object.fromEntries(parsed.searchParams.entries()); const member = currentMember();
  useEffect(() => { document.title = `${views.find(item => item[0] === path)?.[1] || "미리보기"} | MERO 공유용 초안`; document.getElementById("main-content")?.setAttribute("data-route",path); }, [path]);
  useEffect(() => {
    function click(event: MouseEvent) {
      const element = event.target instanceof Element ? event.target.closest("a") : null;
      const href = element?.getAttribute("href") || "";
      if (href.startsWith("/api/robots/")) {
        event.preventDefault(); const parts=href.split("/"); const robot=getRobot(parts[3]);
        if (!robot || !connectionConfigured(robot)) return;
        if (parts[4] === "setup.sh") download(setupScript(robot), `${robot.id}-setup-ssh.sh`);
        if (parts[4] === "ssh-config") download(sshConfig(robot), `${robot.id}-ssh-config.txt`);
      } else if (href.startsWith("#") && !href.startsWith("#/") && href.length > 1) {
        const target = document.getElementById(href.slice(1)); if (target) { event.preventDefault(); target.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"}); }
      }
    }
    document.addEventListener("click",click);return () => document.removeEventListener("click",click);
  }, []);
  return <ThemeProvider><a className="skip-link" href="#main-content">본문으로 바로가기</a><PreviewBar route={path}/><Header member={member}/><main id="main-content"><PreviewBoundary route={`${route}-${member?.id || "visitor"}`}><div key={`${route}-${member?.id || "visitor"}`}><RouteContent path={path} query={query}/></div></PreviewBoundary></main><Footer/></ThemeProvider>;
}
createRoot(document.getElementById("app-root")!).render(<App/>);

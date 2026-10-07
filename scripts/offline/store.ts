import { seedRobots } from "../../src/lib/content";
import type { Member, Robot, PublicRobot } from "../../src/lib/types";

const timestamp = "2026-10-01T00:00:00.000Z";
const samples: Member[] = [
  { id: "demo-admin", name: "데모 운영진", email: "admin@mero.demo", department: "서울대학교 기계공학부", role: "admin", status: "active", created_at: timestamp },
  { id: "demo-member", name: "데모 활동회원", email: "member@mero.demo", department: "서울대학교", role: "member", status: "active", created_at: timestamp },
  { id: "demo-pending", name: "데모 신규회원", email: "pending@mero.demo", department: "", role: "member", status: "pending", created_at: timestamp },
];
let members = structuredClone(samples);
let robots: Robot[] = structuredClone(seedRobots).map(robot => ({ ...robot, updated_at: timestamp }));
let sessionId: string | null = null;
const passwords = new Map(samples.map(member => [member.id, "mero-demo-2026"]));
let version = 0;
const listeners = new Set<() => void>();
export function subscribeStore(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function storeVersion() { return version; }
function changed() { version++; for (const listener of listeners) listener(); }
export function currentMember() { const member = members.find(item => item.id === sessionId); return member && member.status !== "suspended" ? { ...member } : null; }
export function getMembers() { return members.map(member => ({ ...member })); }
export function getRobots() { return structuredClone(robots); }
export function getRobot(id: string) { const robot = robots.find(item => item.id === id); return robot ? structuredClone(robot) : undefined; }
export function publicRobot(robot: Robot): PublicRobot { const { id, name, platform, project_id, status, description, creators, start_date, end_date, updated_at } = robot; return { id,name,platform,project_id,status,description,creators,start_date,end_date,updated_at }; }
export function canAccessRobot(member: Member | null) { return member?.status === "active"; }
export function canAdmin(member: Member | null) { return member?.status === "active" && member.role === "admin"; }
export function safeReturnPath(value?: string) { return value?.startsWith("/") && !value.startsWith("//") && !/[\\\r\n]/.test(value) ? value : "/account"; }
export function chooseRole(role: "visitor" | "member" | "admin" | "pending") {
  sessionId = role === "visitor" ? null : `demo-${role}`;
  const sample = samples.find(member => member.id === sessionId);
  if (sample) { const member = members.find(item => item.id === sample.id)!; Object.assign(member, { role: sample.role, status: sample.status }); }
  changed();
}
export function resetDemo() { members = structuredClone(samples); robots = structuredClone(seedRobots).map(robot => ({ ...robot, updated_at: timestamp })); sessionId = null; passwords.clear(); for (const member of samples) passwords.set(member.id,"mero-demo-2026"); changed(); }
function requireMember(admin = false) { const member = currentMember(); if (!member) throw new Error("로그인 또는 상단의 화면 체험을 선택해 주세요."); if (admin && !canAdmin(member)) throw new Error("관리자 화면 체험에서 이용할 수 있습니다."); return member; }
function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
export async function api<T>(path: string, method = "GET", data?: unknown): Promise<T> {
  const input = (data || {}) as Record<string,unknown>;
  let result: unknown;
  if (path === "/api/auth/signup" && method === "POST") {
    const name = text(input.name); const email = text(input.email).toLowerCase(); const password = text(input.password);
    if (name.length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("이름과 이메일을 확인해 주세요.");
    if (password.length < 10 || input.consent !== true) throw new Error("비밀번호는 10자 이상이며 정보 수집 동의가 필요합니다.");
    if (members.some(member => member.email === email)) throw new Error("이 데모에서 이미 사용 중인 이메일입니다.");
    const member: Member = { id: `demo-${crypto.randomUUID()}`, name, email, department: text(input.department), role: "member", status: "pending", created_at: new Date().toISOString() };
    members.unshift(member); passwords.set(member.id,password); sessionId = member.id; result = {member}; changed();
  } else if (path === "/api/auth/login" && method === "POST") {
    const member = members.find(item => item.email === text(input.email).toLowerCase());
    if (!member || passwords.get(member.id) !== input.password) throw new Error("이메일 또는 비밀번호를 확인해 주세요. 샘플 비밀번호는 mero-demo-2026입니다.");
    if (member.status === "suspended") throw new Error("이 데모에서 이용 중지된 회원입니다.");
    sessionId = member.id; result = {member:{...member}}; changed();
  } else if (path === "/api/auth/logout") { sessionId = null; result = {ok:true}; changed();
  } else if (path === "/api/me" && method === "GET") result = { member: currentMember() };
  else if (path === "/api/me" && method === "PATCH") {
    const actor = requireMember(); const member = members.find(item => item.id === actor.id)!;
    if (text(input.name).length < 2) throw new Error("이름은 2자 이상 입력해 주세요.");
    member.name = text(input.name); member.department = text(input.department); result = {member:{...member}}; changed();
  } else if (path === "/api/auth/password") {
    const actor = requireMember(); if (passwords.get(actor.id) !== input.current) throw new Error("현재 비밀번호가 일치하지 않습니다.");
    if (text(input.password).length < 10) throw new Error("새 비밀번호는 10자 이상 입력해 주세요.");
    passwords.set(actor.id,text(input.password)); result = {ok:true};
  } else if (path === "/api/admin/members" && method === "GET") { requireMember(true); result = {members:getMembers()};
  } else if (path.startsWith("/api/admin/members/") && method === "PATCH") {
    const actor = requireMember(true); const id = path.split("/").at(-1); const member = members.find(item => item.id === id);
    if (!member) throw new Error("회원을 찾을 수 없습니다.");
    if (actor.id === id && (input.role !== "admin" || input.status !== "active")) throw new Error("현재 관리자 권한은 해제할 수 없습니다.");
    if (input.role === "admin" && input.status !== "active") throw new Error("관리자는 활동 회원이어야 합니다.");
    if (!["member","admin"].includes(String(input.role)) || !["pending","active","suspended"].includes(String(input.status))) throw new Error("회원 상태를 확인해 주세요.");
    member.role = input.role as Member["role"]; member.status = input.status as Member["status"]; result = {member:{...member}}; changed();
  } else if (path === "/api/admin/robots" && method === "GET") { requireMember(true); result = {robots:getRobots()};
  } else if ((path === "/api/admin/robots" && method === "POST") || (path.startsWith("/api/admin/robots/") && method === "PATCH")) {
    requireMember(true); const robot = structuredClone(input) as Robot;
    if (!/^[a-z][a-z0-9-]{2,39}$/.test(robot.id) || robot.name.trim().length < 2 || robot.platform.trim().length < 2 || robot.description.trim().length < 2) throw new Error("로봇 ID와 기본 정보를 확인해 주세요.");
    const existing = robots.findIndex(item => item.id === robot.id);
    if (method === "POST" && existing !== -1) throw new Error("이미 사용 중인 로봇 ID입니다.");
    if (method === "PATCH" && path.split("/").at(-1) !== robot.id) throw new Error("QR 주소 유지를 위해 ID는 변경할 수 없습니다.");
    if (robot.hostname && !/^(?:[a-zA-Z0-9][a-zA-Z0-9.-]*|[a-fA-F0-9:]+)$/.test(robot.hostname)) throw new Error("호스트 이름 또는 IP를 확인해 주세요.");
    if (robot.ssh_user && !/^[a-z_][a-z0-9_-]*$/.test(robot.ssh_user)) throw new Error("SSH 사용자 이름을 확인해 주세요.");
    robot.updated_at = new Date().toISOString();
    if (existing === -1) robots.push(robot); else robots[existing] = robot;
    result = {robot:structuredClone(robot)}; changed();
  } else throw new Error("이 공유용 초안에서 지원하지 않는 요청입니다.");
  return result as T;
}

import { z } from "zod";
import { projects } from "./content";
import type { Locale } from "./i18n";

export const passwordSchema = z.string().min(10, "비밀번호는 10자 이상 입력해 주세요.").max(128, "비밀번호는 128자 이하로 입력해 주세요.");
export const signupSchema = z.object({
  name: z.string().trim().min(2, "이름은 2자 이상 입력해 주세요.").max(40),
  email: z.email("올바른 이메일 주소를 입력해 주세요.").max(254).transform(value => value.toLowerCase()),
  department: z.string().trim().max(80).default(""), password: passwordSchema,
  consent: z.literal(true, { error: "회원 관리에 필요한 정보 수집에 동의해 주세요." }),
});
export const loginSchema = z.object({ email: z.email("이메일 주소를 확인해 주세요.").max(254).transform(value => value.toLowerCase()), password: z.string().min(1).max(128) });
export const memberUpdateSchema = z.object({ role: z.enum(["member", "admin"]), status: z.enum(["pending", "active", "suspended"]) });
const dateSchema = z.string().max(24).refine(value => value === "" || /^20\d{2}-[12]$/.test(value) || /^20\d{2}-\d{2}-\d{2}$/.test(value), "학기(2026-2) 또는 날짜(2026-09-01) 형식으로 입력해 주세요.");
export const robotSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]{2,39}$/, "로봇 ID는 소문자·숫자·하이픈으로 3~40자 입력해 주세요."),
  name: z.string().trim().min(2).max(80), platform: z.string().trim().min(2).max(100),
  project_id: z.string().refine(value => projects.some(project => project.id === value), "연결할 프로젝트를 선택해 주세요."),
  status: z.enum(["building", "ready", "maintenance", "archived"]),
  description: z.string().trim().min(2).max(3000), creators: z.array(z.string().trim().min(1).max(60)).max(30),
  start_date: dateSchema, end_date: dateSchema,
  hostname: z.string().max(253).refine(value => value === "" || /^(?:[a-zA-Z0-9][a-zA-Z0-9.-]*|[a-fA-F0-9:]+)$/.test(value), "IP 주소 또는 호스트 이름만 입력해 주세요."),
  ssh_user: z.string().max(40).refine(value => value === "" || /^[a-z_][a-z0-9_-]*$/.test(value), "SSH 사용자 이름을 확인해 주세요."),
  ssh_port: z.number().int().min(1).max(65535), workdir: z.string().trim().max(500),
  launch_command: z.string().trim().max(2000), stop_command: z.string().trim().max(2000),
  network_note: z.string().trim().max(2000),
  guide: z.array(z.object({ title: z.string().trim().min(1).max(100), body: z.string().trim().min(1).max(4000), command: z.string().max(2000).optional() })).max(16),
});

// API and validation errors are written in Korean at the source; English responses look the message up here.
const englishMessages: Record<string, string> = {
  "비밀번호는 10자 이상 입력해 주세요.": "Please use at least 10 characters for your password.",
  "비밀번호는 128자 이하로 입력해 주세요.": "Please use 128 characters or fewer for your password.",
  "이름은 2자 이상 입력해 주세요.": "Please enter a name of at least 2 characters.",
  "올바른 이메일 주소를 입력해 주세요.": "Please enter a valid email address.",
  "회원 관리에 필요한 정보 수집에 동의해 주세요.": "Please agree to the collection of information needed for membership management.",
  "이메일 주소를 확인해 주세요.": "Please check your email address.",
  "학기(2026-2) 또는 날짜(2026-09-01) 형식으로 입력해 주세요.": "Please enter a semester (2026-2) or a date (2026-09-01).",
  "로봇 ID는 소문자·숫자·하이픈으로 3~40자 입력해 주세요.": "The robot ID must be 3–40 lowercase letters, digits or hyphens.",
  "연결할 프로젝트를 선택해 주세요.": "Please choose a project to link.",
  "IP 주소 또는 호스트 이름만 입력해 주세요.": "Please enter only an IP address or hostname.",
  "SSH 사용자 이름을 확인해 주세요.": "Please check the SSH username.",
  "로그인이 필요합니다.": "Please log in.",
  "관리자만 이용할 수 있습니다.": "Only admins can do this.",
  "관리자 승인 후 로봇 운용 안내를 이용할 수 있습니다.": "Robot operating guides are available once an admin approves your membership.",
  "요청 출처를 확인할 수 없습니다. 사이트에서 다시 시도해 주세요.": "We couldn't verify where this request came from. Please try again from the site.",
  "JSON 요청이 필요합니다.": "A JSON request is required.",
  "입력 내용이 너무 깁니다.": "The input is too long.",
  "입력 내용을 확인해 주세요.": "Please check your input.",
  "회원 서비스 연결을 준비 중입니다. 잠시 후 다시 이용해 주세요.": "Member services are being connected. Please try again shortly.",
  "잠시 후 다시 가입해 주세요.": "Please try signing up again in a moment.",
  "이미 가입된 이메일입니다. 로그인해 주세요.": "This email is already registered. Please log in.",
  "로그인 시도가 많습니다. 15분 뒤 다시 시도해 주세요.": "Too many login attempts. Please try again in 15 minutes.",
  "이메일 또는 비밀번호를 확인해 주세요.": "Please check your email or password.",
  "이용이 중지된 계정입니다. 운영진에게 문의해 주세요.": "This account has been suspended. Please contact the club officers.",
  "잠시 후 다시 시도해 주세요.": "Please try again in a moment.",
  "현재 비밀번호가 일치하지 않습니다.": "Your current password is incorrect.",
  "비밀번호가 변경되었습니다. 다시 로그인해 주세요.": "Your password was changed. Please log in again.",
  "회원을 찾을 수 없습니다.": "Member not found.",
  "관리자 계정은 활동 회원 상태여야 합니다.": "Admin accounts must have active member status.",
  "현재 관리자 계정의 권한은 이 화면에서 해제할 수 없습니다.": "You can't remove admin rights from your own account here.",
  "최소 한 명의 활동 관리자가 필요합니다.": "At least one active admin is required.",
  "이미 사용 중인 로봇 ID입니다.": "This robot ID is already in use.",
  "로봇을 찾을 수 없습니다.": "Robot not found.",
  "QR 주소 유지를 위해 로봇 ID는 변경할 수 없습니다.": "The robot ID cannot be changed so the QR address keeps working.",
  "사이트 주소를 확인해 주세요.": "Please check the site address.",
  "HTTP 또는 HTTPS 사이트 주소를 입력해 주세요.": "Please enter an HTTP or HTTPS site address.",
  "담당 팀이 SSH 접속 정보를 등록하는 중입니다.": "The responsible team is still registering the SSH connection details.",
  "요청한 페이지를 찾을 수 없습니다.": "The requested page could not be found.",
  "처리 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.": "Something went wrong. Please try again in a moment.",
};
export function localizeMessage(message: string, locale: Locale) { return locale === "en" ? englishMessages[message] ?? message : message; }

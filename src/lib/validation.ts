import { z } from "zod";
import { projects } from "./content";

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

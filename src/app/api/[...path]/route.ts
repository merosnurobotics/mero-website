import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { ZodError, z } from "zod";
import QRCode from "qrcode";
import { audit, databaseAvailable, getDb, getMember, getMembers, getRobot, getRobots, publicRobot, saveRobot } from "@/lib/db";
import { canAccessRobot, canAdmin, createSession, destroySession, hashPassword, sessionMember, SESSION_COOKIE, SESSION_SECONDS, takeRateLimit, verifyPassword } from "@/lib/security";
import { loginSchema, memberUpdateSchema, passwordSchema, robotSchema, signupSchema } from "@/lib/validation";
import { connectionConfigured, setupScript, sshConfig } from "@/lib/ssh";
import type { Member, Robot } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
}
async function requireMember(request: NextRequest, admin = false) {
  const member = await sessionMember(request.cookies.get(SESSION_COOKIE)?.value);
  if (!member) throw new ApiError(401, "로그인이 필요합니다.");
  if (admin && !canAdmin(member)) throw new ApiError(403, "관리자만 이용할 수 있습니다.");
  return member;
}
async function requireApproved(request: NextRequest) {
  const member = await requireMember(request);
  if (!canAccessRobot(member)) throw new ApiError(403, "관리자 승인 후 로봇 운용 안내를 이용할 수 있습니다.");
  return member;
}
function setSession(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: SESSION_SECONDS,
    secure: process.env.COOKIE_SECURE === "true" || (process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false"),
  });
  return response;
}
function checkOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  const allowed = new Set([url.origin]);
  // Next's internal URL can use 0.0.0.0 even when the browser uses localhost.
  // The browser controls Origin; its Host header identifies this same server.
  const host = request.headers.get("host");
  if (host) {
    try {
      const external = new URL(`${url.protocol}//${host}`);
      if (!external.username && !external.password && external.pathname === "/" && !external.search && !external.hash) allowed.add(external.origin);
    } catch { /* Malformed hosts cannot authorize a mutation. */ }
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) allowed.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).origin);
  if (!origin || !allowed.has(origin)) throw new ApiError(403, "요청 출처를 확인할 수 없습니다. 사이트에서 다시 시도해 주세요.");
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new ApiError(415, "JSON 요청이 필요합니다.");
}
async function body(request: NextRequest) {
  if (Number(request.headers.get("content-length") || 0) > 65_536) throw new ApiError(413, "입력 내용이 너무 깁니다.");
  const text = await request.text();
  if (Buffer.byteLength(text) > 65_536) throw new ApiError(413, "입력 내용이 너무 깁니다.");
  try { return JSON.parse(text); } catch { throw new ApiError(400, "입력 내용을 확인해 주세요."); }
}
function file(content: string, name: string, type = "text/plain; charset=utf-8") {
  return new Response(content, { headers: { "Content-Type": type, "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "private, no-store" } });
}

async function dispatch(request: NextRequest, context: Context) {
  const { path } = await context.params;
  const route = path.join("/");
  const method = request.method;
  if (method !== "GET") checkOrigin(request);
  // These read-only routes serve public data and QR images without a DB.
  const publicRead = method === "GET" && (route === "health" || route === "me" || route === "robots" ||
    (path[0] === "robots" && (path.length === 2 || (path.length === 3 && path[2] === "qr"))));
  if (!databaseAvailable() && !publicRead) throw new ApiError(503, "회원 서비스 연결을 준비 중입니다. 잠시 후 다시 이용해 주세요.");
  if (method === "GET" && route === "health") {
    if (!databaseAvailable()) return json({ status: "unavailable", database: "unconfigured" }, 503);
    const database = getDb();
    await database.prepare("SELECT 1 AS connected").get();
    return json({ status: "ready", database: database.postgres ? "postgresql" : "sqlite" });
  }
  const db = publicRead ? undefined : getDb();

  if (method === "POST" && route === "auth/signup") {
    const input = signupSchema.parse(await body(request));
    if (!await takeRateLimit(`signup:${input.email}`, 5, 3600)) throw new ApiError(429, "잠시 후 다시 가입해 주세요.");
    if (await db!.prepare("SELECT id FROM members WHERE lower(email) = lower(?)").get(input.email)) throw new ApiError(409, "이미 가입된 이메일입니다. 로그인해 주세요.");
    const id = randomUUID();
    const hash = await hashPassword(input.password);
    try {
      await db!.prepare("INSERT INTO members (id, name, email, department, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, 'member', 'pending', ?)")
        .run(id, input.name, input.email, input.department, hash, new Date().toISOString());
    } catch (error) {
      if (await db!.prepare("SELECT id FROM members WHERE lower(email) = lower(?)").get(input.email)) throw new ApiError(409, "이미 가입된 이메일입니다. 로그인해 주세요.");
      throw error;
    }
    return setSession(json({ member: await getMember(id) }, 201), await createSession(id));
  }
  if (method === "POST" && route === "auth/login") {
    const input = loginSchema.parse(await body(request));
    if (!await takeRateLimit(`login:${input.email}`, 12, 900)) throw new ApiError(429, "로그인 시도가 많습니다. 15분 뒤 다시 시도해 주세요.");
    const stored = await db!.prepare("SELECT id, password_hash FROM members WHERE lower(email) = lower(?)").get(input.email) as { id: string; password_hash: string } | undefined;
    const dummy = "scrypt:00000000000000000000000000000000:" + "0".repeat(128);
    const valid = await verifyPassword(input.password, stored?.password_hash ?? dummy);
    if (!stored || !valid) throw new ApiError(401, "이메일 또는 비밀번호를 확인해 주세요.");
    const result = await db!.transaction(async () => {
      await db!.lockMembers();
      const current = await db!.prepare("SELECT password_hash FROM members WHERE id = ?").get(stored.id);
      if (!current || current.password_hash !== stored.password_hash) throw new ApiError(401, "이메일 또는 비밀번호를 확인해 주세요.");
      const member = (await getMember(stored.id))!;
      if (member.status === "suspended") throw new ApiError(403, "이용이 중지된 계정입니다. 운영진에게 문의해 주세요.");
      await db!.prepare("DELETE FROM rate_limits WHERE key = ?").run(`login:${input.email}`);
      const previous = request.cookies.get(SESSION_COOKIE)?.value;
      if (previous) await destroySession(previous);
      return { member, token: await createSession(member.id) };
    });
    return setSession(json({ member: result.member }), result.token);
  }
  if (method === "POST" && route === "auth/logout") {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (token) await destroySession(token);
    const response = json({ ok: true });
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
    return response;
  }
  if (method === "GET" && route === "me") return json({ member: await sessionMember(request.cookies.get(SESSION_COOKIE)?.value) });
  if (method === "PATCH" && route === "me") {
    const member = await requireMember(request);
    const input = z.object({ name: z.string().trim().min(2).max(40), department: z.string().trim().max(80) }).parse(await body(request));
    await db!.prepare("UPDATE members SET name = ?, department = ? WHERE id = ?").run(input.name, input.department, member.id);
    return json({ member: await getMember(member.id) });
  }
  if (method === "POST" && route === "auth/password") {
    const member = await requireMember(request);
    if (!await takeRateLimit(`password:${member.id}`, 8, 900)) throw new ApiError(429, "잠시 후 다시 시도해 주세요.");
    const input = z.object({ current: z.string().min(1).max(128), password: passwordSchema }).parse(await body(request));
    const stored = await db!.prepare("SELECT password_hash FROM members WHERE id = ?").get(member.id) as { password_hash: string };
    if (!await verifyPassword(input.current, stored.password_hash)) throw new ApiError(400, "현재 비밀번호가 일치하지 않습니다.");
    const nextHash = await hashPassword(input.password);
    const token = await db!.transaction(async () => {
      await db!.lockMembers();
      await requireMember(request);
      const current = await db!.prepare("SELECT password_hash FROM members WHERE id = ?").get(member.id) as { password_hash: string };
      if (current.password_hash !== stored.password_hash) throw new ApiError(409, "비밀번호가 변경되었습니다. 다시 로그인해 주세요.");
      await db!.prepare("UPDATE members SET password_hash = ? WHERE id = ?").run(nextHash, member.id);
      await db!.prepare("DELETE FROM sessions WHERE member_id = ?").run(member.id);
      await audit(member.id, "password_changed", member.id);
      return createSession(member.id);
    });
    return setSession(json({ ok: true }), token);
  }

  if (method === "GET" && route === "admin/members") {
    await requireMember(request, true); return json({ members: await getMembers() });
  }
  if (method === "PATCH" && path.length === 3 && path[0] === "admin" && path[1] === "members") {
    const actor = await requireMember(request, true);
    const target = await getMember(path[2]);
    if (!target) throw new ApiError(404, "회원을 찾을 수 없습니다.");
    const input = memberUpdateSchema.parse(await body(request));
    if (input.role === "admin" && input.status !== "active") throw new ApiError(400, "관리자 계정은 활동 회원 상태여야 합니다.");
    if (actor.id === target.id && (input.role !== "admin" || input.status !== "active")) throw new ApiError(400, "현재 관리자 계정의 권한은 이 화면에서 해제할 수 없습니다.");
    await db!.transaction(async () => {
      await db!.lockMembers();
      await requireMember(request, true);
      const currentTarget = await getMember(target.id);
      if (!currentTarget) throw new ApiError(404, "회원을 찾을 수 없습니다.");
      const activeAdmins = await db!.prepare("SELECT COUNT(*) AS count FROM members WHERE role = 'admin' AND status = 'active'").get() as { count: number };
      if (currentTarget.role === "admin" && currentTarget.status === "active" && (input.role !== "admin" || input.status !== "active") && Number(activeAdmins.count) <= 1) throw new ApiError(400, "최소 한 명의 활동 관리자가 필요합니다.");
      await db!.prepare("UPDATE members SET role = ?, status = ? WHERE id = ?").run(input.role, input.status, target.id);
      if (input.status === "suspended") await db!.prepare("DELETE FROM sessions WHERE member_id = ?").run(target.id);
      await audit(actor.id, `member_${input.role}_${input.status}`, target.id);
    });
    return json({ member: await getMember(target.id) });
  }
  if (method === "GET" && route === "admin/robots") {
    await requireMember(request, true); return json({ robots: await getRobots() });
  }
  if (method === "POST" && route === "admin/robots") {
    const actor = await requireMember(request, true);
    const input = robotSchema.parse(await body(request));
    if (await getRobot(input.id)) throw new ApiError(409, "이미 사용 중인 로봇 ID입니다.");
    const robot: Robot = { ...input, updated_at: new Date().toISOString() };
    await saveRobot(robot, true); await audit(actor.id, "robot_created", robot.id);
    return json({ robot }, 201);
  }
  if (method === "PATCH" && path.length === 3 && path[0] === "admin" && path[1] === "robots") {
    const actor = await requireMember(request, true);
    const existing = await getRobot(path[2]);
    if (!existing) throw new ApiError(404, "로봇을 찾을 수 없습니다.");
    const input = robotSchema.parse(await body(request));
    if (input.id !== existing.id) throw new ApiError(400, "QR 주소 유지를 위해 로봇 ID는 변경할 수 없습니다.");
    const robot = { ...input, updated_at: new Date().toISOString() };
    await saveRobot(robot); await audit(actor.id, "robot_updated", robot.id);
    return json({ robot });
  }
  if (method === "GET" && route === "robots") return json({ robots: (await getRobots()).map(publicRobot) });
  if (method === "GET" && path[0] === "robots" && (path.length === 2 || path.length === 3)) {
    const robot = await getRobot(path[1]);
    if (!robot) throw new ApiError(404, "로봇을 찾을 수 없습니다.");
    if (path.length === 2) return json({ robot: publicRobot(robot) });
    if (path[2] === "qr") {
      const value = request.nextUrl.searchParams.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
      let url: URL;
      try { url = new URL(value); } catch { throw new ApiError(400, "사이트 주소를 확인해 주세요."); }
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new ApiError(400, "HTTP 또는 HTTPS 사이트 주소를 입력해 주세요.");
      const target = `${url.origin}/robots/${robot.id}`;
      const png = await QRCode.toBuffer(target, { width: 720, margin: 3, errorCorrectionLevel: "M", color: { dark: "#183889", light: "#ffffff" } });
      return new Response(new Uint8Array(png), { headers: {
        "Content-Type": "image/png", "Cache-Control": "no-store",
        ...(request.nextUrl.searchParams.get("download") === "1" ? { "Content-Disposition": `attachment; filename="mero-${robot.id}-qr.png"` } : {}),
      } });
    }
    await requireApproved(request);
    if (path[2] === "connection") return json({ robot });
    if (["ssh-config", "setup.sh"].includes(path[2]) && !connectionConfigured(robot)) throw new ApiError(409, "담당 팀이 SSH 접속 정보를 등록하는 중입니다.");
    if (path[2] === "ssh-config") return file(sshConfig(robot), `${robot.id}-ssh-config.txt`);
    if (path[2] === "setup.sh") return file(setupScript(robot), `${robot.id}-setup-ssh.sh`, "text/x-shellscript; charset=utf-8");
  }
  throw new ApiError(404, "요청한 페이지를 찾을 수 없습니다.");
}

async function handle(request: NextRequest, context: Context) {
  try { return await dispatch(request, context); }
  catch (error) {
    if (error instanceof ApiError) return json({ error: error.message }, error.status);
    if (error instanceof ZodError) return json({ error: error.issues[0]?.message || "입력 내용을 확인해 주세요." }, 400);
    console.error("MERO API failure", error instanceof Error ? error.name : "unknown");
    return json({ error: "처리 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요." }, 500);
  }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;

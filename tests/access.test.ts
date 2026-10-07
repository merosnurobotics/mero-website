import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { NextRequest } from "next/server";
import { GET, POST, PATCH } from "../src/app/api/[...path]/route";
import { audit, getDb, getRobot } from "../src/lib/db";
import { createSession, hashPassword, SESSION_COOKIE, sessionMember, takeRateLimit, tokenHash } from "../src/lib/security";

const directory = mkdtempSync(join(tmpdir(), "mero-access-"));
const origin = "http://localhost:3000";
let adminToken: string;
let memberToken: string;
let memberId: string;
const password = "Test-Only-Password-2026";
before(async () => {
  if (process.env.MERO_TEST_DATABASE_URL) {
    const url = new URL(process.env.MERO_TEST_DATABASE_URL);
    if (url.hostname !== "127.0.0.1" || !url.pathname.startsWith("/mero_test")) throw new Error("Postgres tests must use a disposable local mero_test database.");
    process.env.DATABASE_URL = process.env.MERO_TEST_DATABASE_URL;
  } else { delete process.env.DATABASE_URL; delete process.env.POSTGRES_URL; }
  process.env.DATABASE_PATH = join(directory, "test.sqlite");
  const db = getDb();
  await db.prepare("INSERT INTO members VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("test-admin", "테스트 운영진", "admin@example.test", "기계공학부", await hashPassword(password), "admin", "active", new Date().toISOString());
  adminToken = await createSession("test-admin");
});
after(async () => { await getDb().close(); rmSync(directory, { recursive: true, force: true }); });

async function request(method: "GET" | "POST" | "PATCH", path: string, data?: unknown, token?: string, requestOrigin = origin) {
  const headers: Record<string,string> = {};
  if (token) headers.cookie = `${SESSION_COOKIE}=${token}`;
  if (method !== "GET") { headers.origin = requestOrigin; headers["content-type"] = "application/json"; }
  const req = new NextRequest(`${origin}/api/${path}`, { method, headers, ...(data !== undefined ? { body: JSON.stringify(data) } : {}) });
  return ({ GET, POST, PATCH }[method])(req, { params: Promise.resolve({ path: path.split("/") }) });
}

test("database health initializes the configured backend without disclosing credentials", async () => {
  const response = await request("GET", "health");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ready", database: process.env.MERO_TEST_DATABASE_URL ? "postgresql" : "sqlite" });
});

test("signup ignores forged administrator fields and starts pending", async () => {
  const response = await request("POST", "auth/signup", { name: "새 회원", email: "new@example.test", department: "기계공학부", password, consent: true, role: "admin", status: "active" });
  assert.equal(response.status, 201);
  const { member } = await response.json(); memberId = member.id;
  memberToken = response.headers.get("set-cookie")!.match(/mero_session=([^;]+)/)![1];
  assert.equal(member.role, "member"); assert.equal(member.status, "pending");
  assert.equal("password_hash" in member, false);
  assert.match(response.headers.get("set-cookie")!, /HttpOnly/i);
  const stored = await getDb().prepare("SELECT password_hash FROM members WHERE id=?").get(memberId)!;
  assert.notEqual(stored.password_hash, password);
  assert.equal((await getDb().prepare("SELECT token_hash FROM sessions WHERE member_id=?").get(memberId))!.token_hash, tokenHash(memberToken));
});

test("anonymous and pending members cannot read private robot details", async () => {
  for (const route of ["connection", "setup.sh", "ssh-config"]) {
    assert.equal((await request("GET", `robots/qdd-01/${route}`)).status, 401);
    assert.equal((await request("GET", `robots/qdd-01/${route}`, undefined, memberToken)).status, 403);
  }
  assert.equal((await request("GET", "admin/members", undefined, memberToken)).status, 403);
  assert.equal((await request("GET", "admin/robots")).status, 401);
});

test("CSRF attempts fail before a mutation", async () => {
  const response = await request("PATCH", `admin/members/${memberId}`, { role: "member", status: "active" }, adminToken, "https://untrusted.example");
  assert.equal(response.status, 403); assert.equal((await sessionMember(memberToken))?.status, "pending");
});

test("browser origin follows the server Host and port while foreign origins stay blocked", async () => {
  for (const [requestOrigin, status] of [["http://localhost:3100", 200], ["https://untrusted.example", 403], ["http://localhost:3101", 403]] as const) {
    const req = new NextRequest("http://0.0.0.0:3100/api/auth/logout", {
      method: "POST", headers: { host: "localhost:3100", origin: requestOrigin, "content-type": "application/json" }, body: "{}",
    });
    const response = await POST(req, { params: Promise.resolve({ path: ["auth", "logout"] }) });
    assert.equal(response.status, status);
  }
});

test("administrator approval takes effect in existing sessions", async () => {
  assert.equal((await request("PATCH", `admin/members/${memberId}`, { role: "member", status: "active" }, memberToken)).status, 403);
  assert.equal((await request("PATCH", `admin/members/${memberId}`, { role: "member", status: "active" }, adminToken)).status, 200);
  assert.equal((await request("GET", "robots/qdd-01/connection", undefined, memberToken)).status, 200);
  assert.equal((await request("GET", "robots/qdd-01/setup.sh", undefined, memberToken)).status, 409);
});

test("robot updates persist, retain QR IDs, and never leak connection data publicly", async () => {
  const robot = { ...(await getRobot("qdd-01"))!, hostname: "robot.internal.test", ssh_user: "mero", ssh_port: 2222, workdir: "/home/mero/robot", launch_command: "python control.py", network_note: "테스트 전용 네트워크", guide: [{ title: "테스트 안내", body: "실제 장비에 연결하지 않는 테스트입니다." }] };
  assert.equal((await request("PATCH", "admin/robots/qdd-01", robot, memberToken)).status, 403);
  assert.equal((await request("PATCH", "admin/robots/qdd-01", robot, adminToken)).status, 200);
  assert.equal((await getRobot("qdd-01"))?.hostname, robot.hostname);
  assert.equal((await request("PATCH", "admin/robots/qdd-01", { ...robot, id: "changed-id" }, adminToken)).status, 400);
  for (const route of ["robots", "robots/qdd-01"]) {
    const response = await request("GET", route); const text = await response.text();
    for (const value of [robot.hostname, robot.ssh_user, robot.launch_command, robot.network_note]) assert.equal(text.includes(`"${value}"`), false);
    for (const key of ["hostname", "ssh_user", "ssh_port", "guide", "launch_command"]) assert.equal(text.includes(`"${key}"`), false);
  }
  const config = await request("GET", "robots/qdd-01/ssh-config", undefined, memberToken);
  assert.equal(config.status, 200); assert.match(await config.text(), /Host mero-qdd-01/);
  const qr = await request("GET", "robots/qdd-01/qr");
  assert.equal(qr.status, 200); assert.equal(qr.headers.get("content-type"), "image/png");
  assert.equal(Buffer.from(await qr.arrayBuffer()).subarray(1,4).toString(), "PNG");
});

test("self-demotion is rejected and suspension revokes all member sessions", async () => {
  assert.equal((await request("PATCH", "admin/members/test-admin", { role: "member", status: "active" }, adminToken)).status, 400);
  const secondSession = await createSession(memberId);
  assert.equal((await request("PATCH", `admin/members/${memberId}`, { role: "member", status: "suspended" }, adminToken)).status, 200);
  assert.equal(await sessionMember(memberToken), null); assert.equal(await sessionMember(secondSession), null);
  assert.equal((await request("GET", "robots/qdd-01/connection", undefined, memberToken)).status, 401);
  assert.equal((await request("POST", "auth/login", { email: "new@example.test", password })).status, 403);
});

test("password changes rotate sessions and invalidate the old password", async () => {
  const nextPassword = "Updated-Test-Password-2026";
  const previousSession = await createSession("test-admin");
  const response = await request("POST", "auth/password", { current: password, password: nextPassword }, adminToken);
  assert.equal(response.status, 200); assert.equal(await sessionMember(adminToken), null); assert.equal(await sessionMember(previousSession), null);
  const replacement = response.headers.get("set-cookie")!.match(/mero_session=([^;]+)/)![1]; assert.equal((await sessionMember(replacement))?.id, "test-admin");
  assert.equal((await request("POST", "auth/login", { email: "admin@example.test", password })).status, 401);
  assert.equal((await request("POST", "auth/login", { email: "admin@example.test", password: nextPassword })).status, 200);
});


test("a simultaneous old-password login cannot survive a password change", async () => {
  const currentPassword = "Updated-Test-Password-2026";
  const login = await request("POST", "auth/login", { email: "admin@example.test", password: currentPassword });
  const token = login.headers.get("set-cookie")!.match(/mero_session=([^;]+)/)![1];
  const [change, concurrentLogin] = await Promise.all([
    request("POST", "auth/password", { current: currentPassword, password: "Concurrent-Test-Password-2026" }, token),
    request("POST", "auth/login", { email: "admin@example.test", password: currentPassword }),
  ]);
  assert.equal(change.status, 200);
  assert.ok([200, 401].includes(concurrentLogin.status));
  if (concurrentLogin.status === 200) {
    const oldPasswordToken = concurrentLogin.headers.get("set-cookie")!.match(/mero_session=([^;]+)/)![1];
    assert.equal(await sessionMember(oldPasswordToken), null);
  }
});

test("a failed transaction rolls back member writes and audit logs together", async () => {
  const db = getDb();
  const before = await db.prepare("SELECT name FROM members WHERE id = ?").get("test-admin");
  await assert.rejects(db.transaction(async () => {
    await db.prepare("UPDATE members SET name = ? WHERE id = ?").run("롤백될 이름", "test-admin");
    await audit("test-admin", "rollback_test", "test-admin");
    throw new Error("forced failure");
  }), /forced failure/);
  assert.deepEqual(await db.prepare("SELECT name FROM members WHERE id = ?").get("test-admin"), before);
  assert.equal(await db.prepare("SELECT id FROM audit_log WHERE action = ?").get("rollback_test"), undefined);
});

test("concurrent rate limit requests count atomically", async () => {
  const decisions = await Promise.all(Array.from({ length: 24 }, () => takeRateLimit("concurrency-test", 8, 60)));
  assert.equal(decisions.filter(Boolean).length, 8);
});

test("concurrent administrators cannot suspend every active administrator", async () => {
  const db = getDb();
  await db.prepare("UPDATE members SET status = 'suspended' WHERE role = 'admin'").run();
  for (const id of ["admin-a", "admin-b"]) {
    await db.prepare("INSERT INTO members VALUES (?, ?, ?, '', ?, 'admin', 'active', ?)")
      .run(id, id, `${id}@example.test`, await hashPassword(password), new Date().toISOString());
  }
  const [a, b] = await Promise.all([createSession("admin-a"), createSession("admin-b")]);
  const responses = await Promise.all([
    request("PATCH", "admin/members/admin-b", { role: "member", status: "suspended" }, a),
    request("PATCH", "admin/members/admin-a", { role: "member", status: "suspended" }, b),
  ]);
  assert.equal(responses.filter(response => response.status === 200).length, 1);
  assert.ok(responses.some(response => [401, 403].includes(response.status)));
  const row = await db.prepare("SELECT COUNT(*) AS count FROM members WHERE role='admin' AND status='active'").get();
  assert.equal(Number(row?.count), 1);
});

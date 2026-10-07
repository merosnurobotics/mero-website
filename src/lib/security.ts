import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { databaseAvailable, getDb } from "./db";
import type { Member } from "./types";

const derive = promisify(scrypt);
export const SESSION_COOKIE = "mero_session";
export const SESSION_SECONDS = 60 * 60 * 24 * 7;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await derive(password, salt, 64) as Buffer;
  return `scrypt:${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, hash] = stored.split(":");
  if (algorithm !== "scrypt" || !salt || !hash || hash.length !== 128) return false;
  const key = await derive(password, salt, 64) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return expected.length === key.length && timingSafeEqual(key, expected);
}
export function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }
export function createSession(memberId: string) {
  const token = randomBytes(32).toString("hex");
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(Date.now());
  db.prepare("INSERT INTO sessions VALUES (?, ?, ?)").run(tokenHash(token), memberId, Date.now() + SESSION_SECONDS * 1000);
  return token;
}
export function sessionMember(token?: string): Member | null {
  if (!databaseAvailable() || !token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const member = getDb().prepare(`SELECT m.id, m.name, m.email, m.department, m.role, m.status, m.created_at
    FROM members m JOIN sessions s ON s.member_id = m.id WHERE s.token_hash = ? AND s.expires_at > ?`)
    .get(tokenHash(token), Date.now()) as Member | undefined;
  return member && member.status !== "suspended" ? { ...member } : null;
}
export function destroySession(token: string) { getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash(token)); }
export function canAccessRobot(member: Member | null) { return member?.status === "active"; }
export function canAdmin(member: Member | null) { return member?.status === "active" && member.role === "admin"; }
export function safeReturnPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value)) return "/account";
  try { const url = new URL(value, "https://mero.invalid"); return url.origin === "https://mero.invalid" ? url.pathname + url.search + url.hash : "/account"; }
  catch { return "/account"; }
}
export function takeRateLimit(key: string, limit: number, seconds: number) {
  const db = getDb(); const now = Date.now();
  db.prepare("DELETE FROM rate_limits WHERE reset_at <= ?").run(now);
  db.prepare(`INSERT INTO rate_limits (key, attempts, reset_at) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1`).run(key, now + seconds * 1000);
  const row = db.prepare("SELECT attempts FROM rate_limits WHERE key = ?").get(key) as { attempts: number };
  return row.attempts <= limit;
}

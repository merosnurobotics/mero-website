import { randomBytes, randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { databaseUrl, getDb } from "../src/lib/db";
import { hashPassword } from "../src/lib/security";

async function main() {
const args = process.argv.slice(2);
const value = (key: string, fallback: string) => args.includes(key) ? args[args.indexOf(key) + 1] || fallback : fallback;
if (databaseUrl() && !args.includes("--email")) throw new Error("외부 DB 관리자 생성에는 --email을 지정하세요.");
const email = value("--email", "admin@mero.local").toLowerCase();
const name = value("--name", "MERO 운영진");
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("올바른 관리자 이메일이 필요합니다.");
const db = getDb();
if (await db.prepare("SELECT id FROM members WHERE lower(email) = lower(?)").get(email)) {
  console.log("이 이메일의 계정이 이미 있습니다. 기존 계정은 변경하지 않았습니다.");
} else {
  const password = randomBytes(18).toString("base64url");
  const hash = await hashPassword(password);
  await db.prepare("INSERT INTO members (id, name, email, department, password_hash, role, status, created_at) VALUES (?, ?, ?, '', ?, 'admin', 'active', ?)")
    .run(randomUUID(), name, email, hash, new Date().toISOString());
  const dir = resolve(".local"); mkdirSync(dir, { recursive: true, mode: 0o700 });
  const path = resolve(dir, "admin-credentials.txt");
  writeFileSync(path, `MERO 관리자 계정\n이메일: ${email}\n초기 비밀번호: ${password}\n\n로그인한 뒤 내 계정에서 비밀번호를 변경해 주세요.\n이 파일을 공개하거나 저장소에 커밋하지 마세요.\n`, { mode: 0o600 });
  console.log(`관리자 계정을 생성했습니다. 초기 로그인 정보: ${path}`);
}
await db.close();
}
main().catch(error => { console.error(error instanceof Error ? error.message : "관리자 계정을 생성하지 못했습니다."); process.exitCode = 1; });

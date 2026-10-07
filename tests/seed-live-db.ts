import { existsSync, lstatSync, mkdirSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { getDb } from "../src/lib/db";
import { hashPassword } from "../src/lib/security";

async function main() {
  const directory = resolve(".local/qa");
  const path = resolve(process.env.DATABASE_PATH || ".local/qa/live.sqlite");
  const within = relative(directory, path);
  if (!within || within === ".." || within.startsWith(`..${sep}`) || isAbsolute(within) || !path.endsWith(".sqlite")) {
    throw new Error("DATABASE_PATH must be a throwaway .sqlite file inside .local/qa.");
  }
  for (const item of [resolve(".local"), directory, path, `${path}-wal`, `${path}-shm`]) {
    if (existsSync(item) && lstatSync(item).isSymbolicLink()) throw new Error("QA database paths must not be symbolic links.");
  }
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const actualParent = relative(realpathSync(directory), realpathSync(dirname(path)));
  if (actualParent === ".." || actualParent.startsWith(`..${sep}`) || isAbsolute(actualParent)) {
    throw new Error("The QA database directory must stay inside .local/qa.");
  }
  process.env.DATABASE_PATH = path;
  const db = getDb();
  const hash = await hashPassword("QA-only-MERO-2026!");
  db.prepare(`INSERT INTO members (id, name, email, department, password_hash, role, status, created_at)
    VALUES ('qa-admin', '브라우저 검증 운영진', 'qa-admin@mero.test', '격리된 검증 환경', ?, 'admin', 'active', ?)
    ON CONFLICT(email) DO UPDATE SET password_hash=excluded.password_hash, role='admin', status='active'`)
    .run(hash, new Date().toISOString());
  db.prepare("DELETE FROM sessions WHERE member_id IN (SELECT id FROM members WHERE email='qa-admin@mero.test')").run();
  db.prepare("DELETE FROM rate_limits WHERE key='login:qa-admin@mero.test'").run();
  db.close();
  console.log(`Seeded test-only qa-admin@mero.test in ${path}`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : "Could not seed the QA database.");
  process.exitCode = 1;
});

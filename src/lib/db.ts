import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { seedRobots } from "./content";
import type { Member, Robot, PublicRobot } from "./types";

const databases = globalThis as typeof globalThis & { meroDatabases?: Map<string, DatabaseSync> };

// Vercel functions have no persistent local filesystem. Public content can
// use the real seed data until a durable remote database is connected.
export function databaseAvailable() { return process.env.VERCEL !== "1"; }

export function getDb() {
  if (!databaseAvailable()) throw new Error("A persistent database is required for member features on Vercel.");
  const path = resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH || "./data/mero.sqlite");
  databases.meroDatabases ??= new Map();
  const cached = databases.meroDatabases.get(path);
  if (cached) return cached;
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY, name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE, department TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('member','admin')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','suspended')),
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_member_idx ON sessions(member_id);
    CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, reset_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS robots (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, platform TEXT NOT NULL, project_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('building','ready','maintenance','archived')),
      description TEXT NOT NULL, creators TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL,
      hostname TEXT NOT NULL, ssh_user TEXT NOT NULL, ssh_port INTEGER NOT NULL,
      workdir TEXT NOT NULL, launch_command TEXT NOT NULL, stop_command TEXT NOT NULL,
      network_note TEXT NOT NULL, guide TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT, actor_id TEXT NOT NULL,
      action TEXT NOT NULL, target_id TEXT NOT NULL, created_at TEXT NOT NULL
    );
  `);
  const insert = db.prepare("INSERT OR IGNORE INTO robots VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const robot of seedRobots) {
      insert.run(robot.id, robot.name, robot.platform, robot.project_id, robot.status, robot.description,
        JSON.stringify(robot.creators), robot.start_date, robot.end_date, robot.hostname, robot.ssh_user,
        robot.ssh_port, robot.workdir, robot.launch_command, robot.stop_command, robot.network_note,
        JSON.stringify(robot.guide), new Date().toISOString());
    }
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); db.close(); throw error; }
  databases.meroDatabases.set(path, db);
  return db;
}

export function getMembers(): Member[] {
  return getDb().prepare("SELECT id, name, email, department, role, status, created_at FROM members ORDER BY created_at DESC").all().map(row => ({ ...row })) as unknown as Member[];
}

export function getMember(id: string): Member | undefined {
  const row = getDb().prepare("SELECT id, name, email, department, role, status, created_at FROM members WHERE id = ?").get(id);
  // node:sqlite rows have a null prototype; React requires plain client props.
  return row ? { ...row } as Member : undefined;
}

function decodeRobot(row: Record<string, unknown>): Robot {
  return { ...row, creators: JSON.parse(row.creators as string), guide: JSON.parse(row.guide as string) } as Robot;
}
export function getRobots(): Robot[] {
  if (!databaseAvailable()) return structuredClone(seedRobots);
  return getDb().prepare("SELECT * FROM robots ORDER BY rowid").all().map(row => decodeRobot(row));
}
export function getRobot(id: string): Robot | undefined {
  if (!databaseAvailable()) return structuredClone(seedRobots.find(robot => robot.id === id));
  const row = getDb().prepare("SELECT * FROM robots WHERE id = ?").get(id);
  return row ? decodeRobot(row) : undefined;
}
export function publicRobot(robot: Robot): PublicRobot {
  const { id, name, platform, project_id, status, description, creators, start_date, end_date, updated_at } = robot;
  return { id, name, platform, project_id, status, description, creators, start_date, end_date, updated_at };
}
export function saveRobot(robot: Robot, insert = false) {
  const db = getDb();
  if (insert) {
    db.prepare("INSERT INTO robots VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
      robot.id, robot.name, robot.platform, robot.project_id, robot.status, robot.description,
      JSON.stringify(robot.creators), robot.start_date, robot.end_date, robot.hostname, robot.ssh_user,
      robot.ssh_port, robot.workdir, robot.launch_command, robot.stop_command, robot.network_note,
      JSON.stringify(robot.guide), robot.updated_at);
  } else {
    db.prepare(`UPDATE robots SET name=?, platform=?, project_id=?, status=?, description=?, creators=?,
      start_date=?, end_date=?, hostname=?, ssh_user=?, ssh_port=?, workdir=?, launch_command=?,
      stop_command=?, network_note=?, guide=?, updated_at=? WHERE id=?`).run(
      robot.name, robot.platform, robot.project_id, robot.status, robot.description, JSON.stringify(robot.creators),
      robot.start_date, robot.end_date, robot.hostname, robot.ssh_user, robot.ssh_port, robot.workdir,
      robot.launch_command, robot.stop_command, robot.network_note, JSON.stringify(robot.guide), robot.updated_at, robot.id);
  }
}
export function audit(actor: string, action: string, target: string) {
  getDb().prepare("INSERT INTO audit_log (actor_id, action, target_id, created_at) VALUES (?, ?, ?, ?)")
    .run(actor, action, target, new Date().toISOString());
}

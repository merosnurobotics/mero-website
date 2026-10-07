import { AsyncLocalStorage } from "node:async_hooks";
import type { DatabaseSync, SQLInputValue } from "node:sqlite";
import { Pool, type PoolClient } from "pg";
import type { Robot } from "./types";

type Row = Record<string, unknown>;
type Context = { db: SqlDatabase; client?: PoolClient };
const transactions = new AsyncLocalStorage<Context>();

// SQL is application-owned; values always remain bound parameters. No SQL in
// this application contains a literal '?' or a PostgreSQL JSON '?' operator.
function postgresSql(sql: string) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

export class SqlDatabase {
  private ready?: Promise<void>;
  private queue: Promise<void> = Promise.resolve();
  constructor(private backend: DatabaseSync | Pool, private initialize?: () => Promise<void>) {}
  get postgres() { return this.backend instanceof Pool; }
  private async initialized() {
    if (!this.initialize) return;
    this.ready ??= this.initialize().catch(error => { this.ready = undefined; throw error; });
    await this.ready;
  }
  private async exclusive<T>(work: () => Promise<T>): Promise<T> {
    const previous = this.queue;
    let release!: () => void;
    this.queue = new Promise<void>(resolve => { release = resolve; });
    await previous;
    try { return await work(); } finally { release(); }
  }
  private async rows(sql: string, values: SQLInputValue[] = [], write = false): Promise<Row[]> {
    await this.initialized();
    const context = transactions.getStore();
    if (this.backend instanceof Pool) {
      const runner = context?.db === this && context.client ? context.client : this.backend;
      return (await runner.query(postgresSql(sql), values)).rows;
    }
    const backend = this.backend;
    const work = async () => {
      const statement = backend.prepare(sql);
      if (write) { statement.run(...values); return []; }
      return statement.all(...values).map(row => ({ ...row }));
    };
    return context?.db === this ? work() : this.exclusive(work);
  }
  prepare(sql: string) {
    return {
      all: (...values: SQLInputValue[]) => this.rows(sql, values),
      get: async (...values: SQLInputValue[]) => (await this.rows(sql, values))[0],
      run: async (...values: SQLInputValue[]) => { await this.rows(sql, values, true); },
    };
  }
  async transaction<T>(work: () => Promise<T>): Promise<T> {
    if (transactions.getStore()?.db === this) return work();
    await this.initialized();
    if (this.backend instanceof Pool) {
      const client = await this.backend.connect();
      try {
        await client.query("BEGIN");
        const result = await transactions.run({ db: this, client }, work);
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally { client.release(); }
    }
    const backend = this.backend;
    return this.exclusive(async () => {
      backend.exec("BEGIN IMMEDIATE");
      try {
        const result = await transactions.run({ db: this }, work);
        backend.exec("COMMIT");
        return result;
      } catch (error) { backend.exec("ROLLBACK"); throw error; }
    });
  }
  async lockMembers() {
    if (transactions.getStore()?.db !== this) throw new Error("Member lock requires a transaction.");
    // Serialize membership authorization and changes across function instances.
    if (this.postgres) await this.rows("SELECT pg_advisory_xact_lock(73492026)");
  }
  async close() {
    if (this.backend instanceof Pool) await this.backend.end();
    else this.backend.close();
  }
}

const state = globalThis as typeof globalThis & { meroPostgres?: Map<string, SqlDatabase> };
export function postgresDatabase(url: string, robots: Robot[]): SqlDatabase {
  state.meroPostgres ??= new Map();
  const cached = state.meroPostgres.get(url);
  if (cached) return cached;
  const parsed = new URL(url);
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) throw new Error("DATABASE_URL must be a PostgreSQL URL.");
  const local = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(parsed.hostname);
  // Require certificate validation for cloud databases even when the provider
  // URL says sslmode=require. Let pg use an explicit verified TLS config.
  if (!local) {
    for (const name of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) parsed.searchParams.delete(name);
  }
  const pool = new Pool({ connectionString: parsed.toString(), max: 4,
    connectionTimeoutMillis: 15_000, idleTimeoutMillis: 10_000, allowExitOnIdle: true,
    ...(local ? {} : { ssl: { rejectUnauthorized: true } }),
  });
  pool.on("error", () => console.error("MERO database connection interrupted"));
  const db = new SqlDatabase(pool, async () => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(73492025)");
      await client.query(`
        CREATE TABLE IF NOT EXISTS members (
          id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
          department TEXT NOT NULL DEFAULT '', password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('member','admin')),
          status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','suspended')),
          created_at TEXT NOT NULL
        );
        CREATE UNIQUE INDEX IF NOT EXISTS members_email_lower_idx ON members (lower(email));
        CREATE TABLE IF NOT EXISTS sessions (
          token_hash TEXT PRIMARY KEY, member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
          expires_at BIGINT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS sessions_member_idx ON sessions(member_id);
        CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, reset_at BIGINT NOT NULL);
        CREATE TABLE IF NOT EXISTS robots (
          id TEXT PRIMARY KEY, name TEXT NOT NULL, platform TEXT NOT NULL, project_id TEXT NOT NULL,
          status TEXT NOT NULL CHECK(status IN ('building','ready','maintenance','archived')),
          description TEXT NOT NULL, creators TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL,
          hostname TEXT NOT NULL, ssh_user TEXT NOT NULL, ssh_port INTEGER NOT NULL,
          workdir TEXT NOT NULL, launch_command TEXT NOT NULL, stop_command TEXT NOT NULL,
          network_note TEXT NOT NULL, guide TEXT NOT NULL, updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS audit_log (
          id BIGSERIAL PRIMARY KEY, actor_id TEXT NOT NULL, action TEXT NOT NULL,
          target_id TEXT NOT NULL, created_at TEXT NOT NULL
        );
      `);
      for (const robot of robots) {
        await client.query(`INSERT INTO robots VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
          ON CONFLICT(id) DO NOTHING`, [robot.id, robot.name, robot.platform, robot.project_id, robot.status,
          robot.description, JSON.stringify(robot.creators), robot.start_date, robot.end_date,
          robot.hostname, robot.ssh_user, robot.ssh_port, robot.workdir, robot.launch_command,
          robot.stop_command, robot.network_note, JSON.stringify(robot.guide), robot.updated_at]);
      }
      await client.query("COMMIT");
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
  });
  state.meroPostgres.set(url, db);
  return db;
}

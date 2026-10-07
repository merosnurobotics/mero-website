import assert from "node:assert/strict";
import { after, test } from "node:test";
import { mkdtempSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NextRequest } from "next/server";
import { GET, POST } from "../src/app/api/[...path]/route";
import { getDb } from "../src/lib/db";
import { sessionMember } from "../src/lib/security";

const directory = mkdtempSync(join(tmpdir(), "mero-vercel-"));
process.env.VERCEL = "1";
process.env.DATABASE_PATH = join(directory, "never-created.sqlite");
after(() => rmSync(directory, { recursive: true, force: true }));
const origin = "https://mero-preview.vercel.app";
function request(path: string, method = "GET") {
  return new NextRequest(`${origin}/api/${path}`, { method, ...(method === "POST" ? {
    headers: { origin, "content-type": "application/json" }, body: "{}",
  } : {}) });
}
function context(path: string) { return { params: Promise.resolve({ path: path.split("/") }) }; }

test("Vercel public robot data and QR stay available without opening SQLite", async () => {
  const response = await GET(request("robots"), context("robots"));
  assert.equal(response.status, 200);
  const { robots } = await response.json();
  assert.ok(robots.length > 0);
  assert.equal("hostname" in robots[0], false);
  assert.equal("guide" in robots[0], false);
  const qr = await GET(request("robots/qdd-01/qr"), context("robots/qdd-01/qr"));
  assert.equal(qr.status, 200);
  assert.equal(qr.headers.get("content-type"), "image/png");
  const me = await GET(request("me"), context("me"));
  assert.deepEqual(await me.json(), { member: null });
  assert.equal(existsSync(process.env.DATABASE_PATH!), false);
});

test("Vercel member writes and private reads fail safely without an ephemeral DB", async () => {
  for (const path of ["auth/signup", "auth/login"]) {
    const response = await POST(request(path, "POST"), context(path));
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /회원 서비스 연결/);
  }
  const privateRead = await GET(request("robots/qdd-01/connection"), context("robots/qdd-01/connection"));
  assert.equal(privateRead.status, 503);
  assert.equal(sessionMember("a".repeat(64)), null);
  assert.throws(() => getDb(), /persistent database/);
  assert.equal(existsSync(process.env.DATABASE_PATH!), false);
});

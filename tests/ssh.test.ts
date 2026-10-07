import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { seedRobots } from "../src/lib/content";
import { setupScript } from "../src/lib/ssh";
import { safeReturnPath } from "../src/lib/security";
import { robotSchema } from "../src/lib/validation";

const robot = { ...seedRobots[0], hostname: "robot.internal.test", ssh_user: "mero", ssh_port: 2222, updated_at: new Date().toISOString() };
test("SSH setup preserves existing hosts, backs up config, and updates its own block idempotently", () => {
  const directory = mkdtempSync(join(tmpdir(), "mero-ssh-"));
  try {
    mkdirSync(join(directory, ".ssh"));
    const config = join(directory, ".ssh/config");
    writeFileSync(config, "Host existing\n    HostName existing.example\n\n# BEGIN MERO qdd-01\nHost mero-qdd-01\n    HostName old.example\n# END MERO qdd-01\n");
    for (let i=0; i<2; i++) {
      const result = spawnSync("sh", [], { input: setupScript(robot), env: { ...process.env, HOME: directory }, encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr);
    }
    const text = readFileSync(config,"utf8");
    assert.match(text, /Host existing\n    HostName existing.example/);
    assert.match(text, /HostName robot.internal.test/); assert.equal(text.includes("old.example"), false);
    assert.equal(text.match(/# BEGIN MERO qdd-01/g)?.length, 1);
    assert.equal(statSync(config).mode & 0o777, 0o600);
    assert.equal(readdirSync(join(directory,".ssh")).filter(name=>name.includes("mero-backup")).length, 2);
  } finally { rmSync(directory, {recursive:true,force:true}); }
});

test("SSH setup refuses to overwrite a symlink target", () => {
  const directory = mkdtempSync(join(tmpdir(), "mero-ssh-symlink-"));
  try {
    mkdirSync(join(directory,".ssh")); const target = join(directory,"protected"); writeFileSync(target,"unchanged");
    symlinkSync(target,join(directory,".ssh/config"));
    const result = spawnSync("sh", [], { input: setupScript(robot), env: { ...process.env, HOME: directory }, encoding: "utf8" });
    assert.equal(result.status, 1); assert.equal(readFileSync(target,"utf8"),"unchanged");
  } finally { rmSync(directory,{recursive:true,force:true}); }
});

test("SSH values reject command injection and return URLs stay on the site", () => {
  for (const hostname of ["host; touch /tmp/injected", "$(id)", "host\nProxyCommand evil", "-oProxyCommand=evil"]) assert.equal(robotSchema.safeParse({...robot,hostname}).success,false);
  for (const ssh_user of ["root;id", "$(id)", "root\nHost hacked"]) assert.equal(robotSchema.safeParse({...robot,ssh_user}).success,false);
  for (const path of ["https://evil.example", "//evil.example", "/\\evil.example", "/robots\nLocation: evil"]) assert.equal(safeReturnPath(path),"/account");
  assert.equal(safeReturnPath("/robots/qdd-01?tab=qr"),"/robots/qdd-01?tab=qr");
});

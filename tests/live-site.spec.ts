import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import QRCode from "qrcode";

const baseURL = process.env.MERO_LIVE_E2E_BASE_URL;
const adminEmail = process.env.MERO_LIVE_E2E_ADMIN_EMAIL || "";
const adminPassword = process.env.MERO_LIVE_E2E_ADMIN_PASSWORD || "";

// The default E2E command runs the standalone HTML tests without a live server.
test.skip(!baseURL, "Run with playwright.live.config.ts against a throwaway database.");

async function login(page: Page, email: string, password: string, next?: string) {
  await page.goto(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  await page.getByLabel("이메일", { exact: true }).fill(email);
  await page.getByLabel("비밀번호", { exact: true }).fill(password);
  await page.locator("form").getByRole("button", { name: "로그인", exact: true }).click();
}

async function downloadBytes(page: Page, name: string, filename: string) {
  const pending = page.waitForEvent("download");
  await page.getByRole("link", { name, exact: true }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe(filename);
  expect(await download.failure()).toBeNull();
  return readFile((await download.path())!);
}

async function expectDialogAboveHeader(page: Page) {
  const dialog = page.getByRole("dialog");
  // Radix disables pointer events outside its modal, so hit tests alone cannot
  // reveal a sticky header that still paints over the title and close button.
  expect(await page.evaluate(() => {
    const overlay = document.querySelector(".rt-BaseDialogOverlay")!;
    const header = document.querySelector(".site-header")!;
    return Number(getComputedStyle(overlay).zIndex) > Number(getComputedStyle(header).zIndex);
  })).toBe(true);
  for (const target of [
    dialog.getByRole("heading", { name: "MERO QDD 정보 관리", exact: true }),
    dialog.getByRole("button", { name: "편집 창 닫기", exact: true }),
  ]) {
    const box = await target.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(await page.evaluate(({ x, y }) => Boolean(document.elementFromPoint(x, y)?.closest('[role="dialog"]')), {
      x: box!.x + box!.width / 2, y: box!.y + Math.min(5, box!.height / 2),
    })).toBe(true);
  }
}

test("real signup, approval, protected robot guide, editing, downloads and password sessions", async ({ page, browser }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const email = `live-${randomUUID()}@example.invalid`;
  const password = "Live-member-password-2026!";
  const newPassword = "Changed-live-password-2026!";
  const hostname = `private-${randomUUID().slice(0, 8)}.example.invalid`;
  const command = "python3 live_e2e_control.py";

  await page.goto("/robots/qdd-01");
  await expect(page.getByRole("heading", { name: "로봇 안내를 열어보세요." })).toBeVisible();
  expect((await page.request.get("/api/robots/qdd-01/connection")).status()).toBe(401);

  await page.goto("/signup");
  await page.getByLabel("이름", { exact: true }).fill("브라우저 검증 회원");
  await page.getByLabel("소속 / 학과 (선택)").fill("격리된 검증 환경");
  await page.getByLabel("이메일", { exact: true }).fill(email);
  await page.getByLabel("비밀번호", { exact: true }).fill(password);
  await page.getByLabel("비밀번호 확인", { exact: true }).fill(password);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "회원가입", exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.locator(".account-card")).toContainText("승인 대기");
  const session = (await page.context().cookies()).find(cookie => cookie.name === "mero_session");
  expect(session?.httpOnly).toBe(true);
  expect(session?.sameSite).toBe("Lax");

  await page.goto("/robots/qdd-01");
  await expect(page.getByRole("heading", { name: "회원 승인을 기다리고 있어요." })).toBeVisible();
  await expect(page.getByRole("tablist", { name: "로봇 운용 안내" })).toHaveCount(0);
  for (const route of ["connection", "setup.sh", "ssh-config"]) {
    expect((await page.request.get(`/api/robots/qdd-01/${route}`)).status(), route).toBe(403);
  }
  expect((await page.request.get("/api/admin/members")).status()).toBe(403);
  const publicRobot = (await (await page.request.get("/api/robots/qdd-01")).json()).robot;
  for (const field of ["hostname", "ssh_user", "workdir", "launch_command", "guide"]) {
    expect(publicRobot).not.toHaveProperty(field);
  }

  const administrator = await browser.newContext({ baseURL, reducedMotion: "reduce" });
  const admin = await administrator.newPage();
  admin.on("pageerror", error => errors.push(error.message));
  try {
    await login(admin, adminEmail, adminPassword);
    await expect(admin).toHaveURL(/\/admin$/);
    await expect(admin.getByRole("heading", { name: "함께 만드는 동아리를 관리합니다." })).toBeVisible();
    await admin.getByLabel("회원 검색", { exact: true }).fill(email);
    const row = admin.getByRole("row").filter({ hasText: email });
    await expect(row).toContainText("승인 대기");
    await row.getByRole("button", { name: "승인", exact: true }).click();
    await expect(admin.getByRole("status")).toContainText("회원 정보가 저장되었습니다.");
    await expect(row).toContainText("활동 회원");

    await page.getByRole("button", { name: "로그아웃", exact: true }).click();
    await expect(page).toHaveURL(`${baseURL}/`);
    await login(page, email, password, "/robots/qdd-01");
    await expect(page).toHaveURL(/\/robots\/qdd-01$/);
    await expect(page.getByRole("tab", { name: "접속하기", exact: true })).toBeVisible();
    await page.getByRole("tab", { name: "제어 안내", exact: true }).click();
    await expect(page.getByRole("tabpanel")).toContainText("프로젝트별 운용 안내");

    await admin.getByRole("tab", { name: "로봇 관리", exact: true }).click();
    await admin.getByRole("button", { name: "MERO QDD 편집", exact: true }).click();
    const dialog = admin.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("로봇 ID", { exact: true })).toBeDisabled();
    await dialog.getByLabel("호스트 이름 / IP", { exact: true }).fill(hostname);
    await dialog.getByLabel("장비 사용자 이름", { exact: true }).fill("mero_e2e");
    await dialog.getByLabel("SSH 포트", { exact: true }).fill("2222");
    await dialog.getByLabel("장비의 프로젝트 폴더", { exact: true }).fill("/home/mero_e2e/project with spaces");
    await dialog.getByLabel("제어 시작 명령어", { exact: true }).fill(command);
    await dialog.getByRole("button", { name: "로봇 정보 저장", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(admin.getByRole("status")).toContainText("MERO QDD 정보가 저장되었습니다.");

    await page.reload();
    await expect(page.locator(".code-block").first()).toContainText(`ssh -p 2222 mero_e2e@${hostname}`);
    const script = (await downloadBytes(page, "SSH 설정 스크립트", "qdd-01-setup-ssh.sh")).toString("utf8");
    expect(script).toContain(`HostName ${hostname}`);
    expect(script).toContain("User mero_e2e\n    Port 2222");
    expect(script).toContain("# BEGIN MERO qdd-01");
    await page.getByText("SSH 설정 블록 보기", { exact: true }).click();
    const config = (await downloadBytes(page, "설정 파일 다운로드", "qdd-01-ssh-config.txt")).toString("utf8");
    expect(config).toContain(`HostName ${hostname}`);
    expect(config).toContain("Host mero-qdd-01");
    await page.getByRole("tab", { name: "제어 안내", exact: true }).click();
    await expect(page.getByRole("tabpanel")).toContainText(command);

    await page.getByRole("tab", { name: "QR 코드", exact: true }).click();
    await page.getByLabel("QR에 사용할 사이트 주소", { exact: true }).fill(baseURL!);
    await expect(page.locator(".qr-preview img")).toHaveJSProperty("naturalWidth", 720);
    const png = await downloadBytes(page, "QR 이미지 다운로드", "mero-qdd-01-qr.png");
    expect(png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const expectedPng = await QRCode.toBuffer(`${baseURL}/robots/qdd-01`, {
      width: 720, margin: 3, errorCorrectionLevel: "M", color: { dark: "#183889", light: "#ffffff" },
    });
    expect(png.equals(expectedPng)).toBe(true);

    const olderSession = await browser.newContext({ baseURL });
    try {
      const olderPage = await olderSession.newPage();
      await login(olderPage, email, password);
      await expect(olderPage).toHaveURL(/\/account$/);
      await page.goto("/account");
      await page.getByLabel("현재 비밀번호", { exact: true }).fill(password);
      await page.getByLabel("새 비밀번호", { exact: true }).fill(newPassword);
      await page.getByLabel("새 비밀번호 확인", { exact: true }).fill(newPassword);
      await page.getByRole("button", { name: "비밀번호 변경", exact: true }).click();
      await expect(page.getByRole("status")).toContainText("비밀번호를 변경했습니다.");
      await olderPage.reload();
      await expect(olderPage).toHaveURL(/\/login\?next=%2Faccount$/);
      expect((await (await olderPage.request.get("/api/me")).json()).member).toBeNull();
    } finally { await olderSession.close(); }

    await page.getByRole("button", { name: "로그아웃", exact: true }).click();
    await expect(page).toHaveURL(`${baseURL}/`);
    expect((await (await page.request.get("/api/me")).json()).member).toBeNull();
    expect((await page.request.get("/api/robots/qdd-01/connection")).status()).toBe(401);
    await expect(page.locator("body")).not.toContainText(hostname);
    await login(page, email, password);
    await expect(page.locator("form").getByRole("alert")).toContainText("이메일 또는 비밀번호를 확인해 주세요.");
    await page.getByLabel("비밀번호", { exact: true }).fill(newPassword);
    await page.locator("form").getByRole("button", { name: "로그인", exact: true }).click();
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.locator(".account-card")).toContainText("활동 회원");
    expect(errors).toEqual([]);
  } finally { await administrator.close(); }
});

test("mobile administrator dialog, empty states and QR errors work in both themes", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, adminEmail, adminPassword);
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "함께 만드는 동아리를 관리합니다." })).toBeVisible();
  await page.getByLabel("회원 검색", { exact: true }).fill(`absent-${randomUUID()}`);
  await expect(page.locator(".admin-empty")).toContainText("조건에 맞는 회원이 없습니다.");
  await page.getByRole("tab", { name: "로봇 관리", exact: true }).click();

  for (const theme of ["light", "dark"] as const) {
    if (theme === "dark") await page.getByRole("button", { name: "어두운 테마로 전환", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.getByRole("button", { name: "MERO QDD 편집", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expectDialogAboveHeader(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await dialog.getByRole("tab", { name: "QR 코드", exact: true }).click();
    await dialog.getByLabel("QR에 사용할 사이트 주소", { exact: true }).fill("file:///private/robot");
    await expect(dialog.getByRole("alert")).toContainText("올바른 HTTP 또는 HTTPS 주소를 입력해 주세요.");
    await expect(dialog.getByRole("link", { name: "QR 이미지 다운로드", exact: true })).toHaveCount(0);
    await dialog.getByLabel("QR에 사용할 사이트 주소", { exact: true }).fill(baseURL!);
    await expect(dialog.locator(".qr-preview img")).toHaveJSProperty("naturalWidth", 720);
    await page.setViewportSize({ width: 320, height: 740 });
    await expectDialogAboveHeader(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.local/live-admin-mobile-${theme}.png` });
    await dialog.getByRole("button", { name: "편집 창 닫기", exact: true }).click();
    await expect(dialog).toHaveCount(0);

    await page.getByRole("tab", { name: "회원 관리", exact: true }).click();
    await page.getByLabel("회원 검색", { exact: true }).fill("브라우저 검증 회원");
    await page.getByRole("combobox", { name: "브라우저 검증 회원 상태", exact: true }).first().click();
    const options = page.getByRole("listbox");
    await expect(options).toBeVisible();
    expect(await options.evaluate(element => {
      const popper = element.closest("[data-radix-popper-content-wrapper]") || element.parentElement!;
      const header = document.querySelector(".site-header")!;
      return Number(getComputedStyle(popper).zIndex) > Number(getComputedStyle(header).zIndex);
    })).toBe(true);
    const option = await options.getByRole("option", { name: "활동 회원", exact: true }).boundingBox();
    expect(option).not.toBeNull();
    expect(await page.evaluate(({ x, y }) => Boolean(document.elementFromPoint(x, y)?.closest('[role="listbox"]')), {
      x: option!.x + option!.width / 2, y: option!.y + option!.height / 2,
    })).toBe(true);
    await page.keyboard.press("Escape");
    await expect(options).toHaveCount(0);
    await page.getByRole("tab", { name: "로봇 관리", exact: true }).click();
    await page.setViewportSize({ width: 390, height: 844 });
  }
  expect(errors).toEqual([]);
});

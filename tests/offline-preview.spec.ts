import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const file = pathToFileURL(resolve("output/MERO-preview.html")).href;
test.beforeEach(async ({ page }) => { await page.goto(file); await expect(page.locator("main h1")).toContainText("상상을 설계하고"); });

test("all 19 pages work with embedded assets and no HTTP requests", async ({ page }) => {
  const requests: string[] = []; const errors: string[] = [];
  page.on("request", request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  page.on("pageerror", error => errors.push(error.message));
  const routes = await page.locator(".preview-view-select option").evaluateAll(options => options.map(option => (option as HTMLOptionElement).value));
  expect(routes).toHaveLength(19);
  for (const route of routes) {
    await page.getByRole("combobox", { name: "미리보기 페이지", exact: true }).selectOption(route);
    await expect(page.locator("main")).toHaveAttribute("data-route",route);
    await expect(page.locator("main h1").first()).toBeVisible();
    await expect(page.locator("main")).not.toContainText("화면을 다시 열어주세요.");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
  }
  expect(errors).toEqual([]); expect(requests).toEqual([]);
});

test("signup, administrator approval and robot QR download work as an in-memory demo", async ({ page }) => {
  await page.getByRole("combobox", { name: "미리보기 페이지", exact: true }).selectOption("/signup");
  await page.getByLabel("이름",{exact:true}).fill("HTML 테스트 회원");
  await page.getByLabel("소속 / 학과 (선택)").fill("데모 소속");
  await page.getByLabel("이메일",{exact:true}).fill("preview-user@example.invalid");
  await page.getByLabel("비밀번호",{exact:true}).fill("Preview-Password-2026");
  await page.getByLabel("비밀번호 확인",{exact:true}).fill("Preview-Password-2026");
  await page.getByRole("checkbox").check();
  await page.getByRole("button",{name:"회원가입",exact:true}).click();
  await expect(page.locator("main")).toHaveAttribute("data-route","/account");
  await expect(page.locator(".account-card")).toContainText("승인 대기");
  await page.getByRole("button",{name:"관리자",exact:true}).click();
  await page.getByLabel("회원 검색",{exact:true}).fill("preview-user@example.invalid");
  const row = page.getByRole("row").filter({hasText:"preview-user@example.invalid"});
  await row.getByRole("button",{name:"승인",exact:true}).click();
  await expect(page.getByRole("status")).toContainText("회원 정보가 저장되었습니다");
  await page.getByRole("combobox", { name: "미리보기 페이지", exact: true }).selectOption("/login");
  await page.getByLabel("이메일",{exact:true}).fill("preview-user@example.invalid");
  await page.getByLabel("비밀번호",{exact:true}).fill("Preview-Password-2026");
  await page.locator("form").getByRole("button",{name:"로그인",exact:true}).click();
  await expect(page.locator("main")).toHaveAttribute("data-route","/account");
  await expect(page.locator(".account-card")).toContainText("활동 회원");
  await page.getByRole("combobox", { name: "미리보기 페이지", exact: true }).selectOption("/robots/qdd-01");
  await page.getByRole("tab",{name:"제어 안내",exact:true}).click();
  await expect(page.getByRole("tabpanel")).toContainText("프로젝트별 운용 안내");
  await page.getByRole("tab",{name:"QR 코드",exact:true}).click();
  await expect(page.locator(".qr-preview img")).toHaveAttribute("src",/^data:image\/png/);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link",{name:"QR 이미지 다운로드",exact:true}).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("mero-qdd-01-qr.png");
});

test("administrator robot editing generates a downloadable SSH setup without a server", async ({ page }) => {
  await page.getByRole("button",{name:"관리자",exact:true}).click();
  await page.getByRole("tab",{name:"로봇 관리",exact:true}).click();
  await page.getByRole("button",{name:"MERO QDD 편집",exact:true}).click();
  const dialog = page.getByRole("dialog"); await expect(dialog).toBeVisible();
  const title = await dialog.getByRole("heading").first().boundingBox();
  expect(title).not.toBeNull();
  expect(await page.evaluate(({x,y}) => Boolean(document.elementFromPoint(x,y)?.closest('[role="dialog"]')), {x:title!.x + title!.width/2,y:title!.y + title!.height/2})).toBe(true);
  await expect(dialog.getByLabel("로봇 ID",{exact:true})).toBeDisabled();
  await dialog.getByLabel("호스트 이름 / IP",{exact:true}).fill("qdd-preview.example.invalid");
  await dialog.getByLabel("장비 사용자 이름",{exact:true}).fill("mero_demo");
  await dialog.getByLabel("장비의 프로젝트 폴더",{exact:true}).fill("/home/mero_demo/project");
  await dialog.getByLabel("제어 시작 명령어",{exact:true}).fill("python3 demo_control.py");
  await dialog.getByRole("button",{name:"로봇 정보 저장",exact:true}).click();
  await expect(dialog).toHaveCount(0);
  await page.getByRole("combobox", { name: "미리보기 페이지", exact: true }).selectOption("/robots/qdd-01");
  await expect(page.locator(".code-block").first()).toContainText("ssh -p 22 mero_demo@qdd-preview.example.invalid");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link",{name:"SSH 설정 스크립트",exact:true}).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("qdd-01-setup-ssh.sh");
  const content = await readFile((await download.path())!,"utf8");
  expect(content).toContain("HostName qdd-preview.example.invalid");
  expect(content).toContain("# BEGIN MERO qdd-01");
  await page.getByRole("tab",{name:"제어 안내",exact:true}).click();
  await expect(page.getByRole("tabpanel")).toContainText("python3 demo_control.py");
});

test("activity filters, project search, gallery and both themes work on mobile", async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.getByRole("button",{name:"메뉴 열기",exact:true}).click();
  await page.getByRole("navigation",{name:"모바일 메뉴",exact:true}).getByRole("link",{name:"활동",exact:true}).click();
  await expect(page.locator("main")).toHaveAttribute("data-route","/activities");
  await page.getByRole("button",{name:"2026-1학기",exact:true}).click();
  await expect(page.locator(".timeline-group")).toHaveCount(1);
  await expect(page.locator(".timeline-group")).toContainText("AI 로봇챌린지");
  await page.getByRole("combobox", { name: "미리보기 페이지", exact: true }).selectOption("/projects");
  await page.getByLabel("프로젝트 검색",{exact:true}).fill("no-project-match");
  await expect(page.locator(".empty-state")).toContainText("찾는 프로젝트가 없어요");
  await page.getByRole("button",{name:"전체 프로젝트 보기",exact:true}).click();
  await expect(page.locator(".project-card")).toHaveCount(3);
  await page.getByRole("combobox", { name: "미리보기 페이지", exact: true }).selectOption("/activities/ai-robot-challenge");
  await expect(page.getByRole("link",{name:/로봇신문 관련 기사/})).toHaveAttribute("href","https://www.irobotnews.com/news/articleView.html?idxno=47888");
  await page.getByRole("button",{name:"AI 로봇챌린지 경기 준비 현장 크게 보기",exact:true}).click();
  await expect(page.getByRole("dialog",{name:"활동사진 크게 보기",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"다음 사진",exact:true}).click();
  await expect(page.getByRole("dialog")).toContainText("AI 로봇챌린지 경기장과 로봇");
  await page.getByRole("button",{name:"사진 닫기",exact:true}).click();
  await page.getByRole("button",{name:"어두운 테마로 전환",exact:true}).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
  await page.getByRole("combobox", { name: "미리보기 페이지", exact: true }).selectOption("/");
  await page.screenshot({path:".local/offline-home-mobile-dark.png",fullPage:true});
  await page.getByRole("button",{name:"밝은 테마로 전환",exact:true}).click();
  await page.screenshot({path:".local/offline-home-mobile-light.png",fullPage:true});
  await page.setViewportSize({width:320,height:740});
  const routes = await page.locator(".preview-view-select option").evaluateAll(options => options.map(option => (option as HTMLOptionElement).value));
  for (const route of routes) {
    await page.getByRole("combobox", { name: "미리보기 페이지", exact: true }).selectOption(route);
    await expect(page.locator("main")).toHaveAttribute("data-route",route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),route).toBe(true);
  }
});

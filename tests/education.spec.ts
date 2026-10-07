import { test, expect } from "@playwright/test";

const baseURL = process.env.MERO_EDUCATION_TEST_URL;
test.skip(!baseURL, "Set MERO_EDUCATION_TEST_URL to a running MERO server.");
test.beforeEach(async ({ context }) => {
  const email=process.env.MERO_EDUCATION_TEST_EMAIL;
  const password=process.env.MERO_EDUCATION_TEST_PASSWORD;
  test.skip(!email || !password,"Member credentials are required for protected lessons.");
  const response=await context.request.post(`${baseURL}/api/auth/login`, {data:{email,password},headers:{Origin:baseURL!}});
  expect(response.status()).toBe(200);
});

const lessonPath = "/education/reinforcement-learning/kimodo-mjwarp";

test("education navigation, expandable catalog and lesson interactions", async ({ page, context }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(`${baseURL}/education`);
  expect(await page.locator(".desktop-nav a").allTextContents()).toEqual(["동아리 소개", "활동", "교육", "로봇 안내"]);
  await page.locator(".education-topic-tree > summary").first().click();
  await expect(page.locator(".education-lesson-tree").first()).not.toBeVisible();
  await page.locator(".education-topic-tree > summary").first().click();
  await page.locator(".education-series-row").first().click();
  await expect(page).toHaveURL(`${baseURL}/education/reinforcement-learning`);
  await page.getByRole("link", { name: "자료 읽기" }).click();
  await expect(page).toHaveURL(`${baseURL}${lessonPath}`);
  await expect(page.locator(".education-lesson .chapter")).toHaveCount(6);
  const assets = await page.locator(".education-lesson [src], .education-lesson [poster], .education-lesson a[href^='/education-assets/']").evaluateAll(elements => [...new Set(elements.flatMap(element => [element.getAttribute("src"), element.getAttribute("poster"), element.getAttribute("href")]).filter((url): url is string => Boolean(url?.startsWith("/education-assets/"))))]);
  for (const url of assets) expect((await page.request.get(`${baseURL}${url}`)).status(), url).toBe(200);
  await page.locator(".education-sidebar a[href$='#kimodo']").click();
  await expect(page.locator(".education-sidebar a[aria-current='location']")).toContainText("Kimodo와 모션 생성");
  await page.waitForFunction(() => (document.querySelector("#reference-video") as HTMLVideoElement).readyState >= 1);
  await page.locator("#reference-frame").evaluate(element => { (element as HTMLInputElement).value = "90"; element.dispatchEvent(new Event("input", { bubbles: true })); });
  await expect.poll(() => page.locator("#reference-video").evaluate(element => (element as HTMLVideoElement).currentTime)).toBeCloseTo(3, 1);
  await page.locator("#query").getByRole("button", { name: "문장 Copy" }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("A humanoid robot");
  await page.evaluate(() => { window.print = () => { document.body.dataset.printCalled = "true"; }; });
  await page.locator("#print").click();
  await expect(page.locator("body")).toHaveAttribute("data-print-called", "true");
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("link", { name: "전체 자료 다운로드 (ZIP)" }).click();
  expect((await downloadEvent).suggestedFilename()).toBe("microban-imitation-rl-lesson.zip");
  await page.getByRole("navigation", { name: "주 메뉴" }).getByRole("link", { name: "교육", exact: true }).click();
  await page.locator(".education-sidebar a[href$='/kimodo-mjwarp']").click();
  expect(errors).toEqual([]);
});

test("education pages fit mobile and desktop in both themes", async ({ page }) => {
  for (const width of [320, 390, 1440]) for (const theme of ["light", "dark"]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(theme => localStorage.setItem("mero-theme", theme), theme);
    for (const path of ["/education", "/education/reinforcement-learning", lessonPath]) {
      await page.goto(`${baseURL}${path}`);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      if (width < 768) {
        await expect(page.getByRole("navigation", { name: "교육자료 목록" })).not.toBeVisible();
        await page.getByRole("button", { name: "교육자료 목록" }).click();
        await expect(page.getByRole("navigation", { name: "교육자료 목록" })).toBeVisible();
        await page.getByRole("button", { name: "교육자료 목록" }).click();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}/${theme}/${path}`).toBe(true);
      expect(await page.locator(".education-lesson img").evaluateAll(images => images.filter(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth === 0).length)).toBe(0);
      if (path === lessonPath && width !== 320) await page.screenshot({ path: `.local/qa/education/lesson-${width}-${theme}.png`, fullPage: true });
    }
  }
});

test("object recognition course, chapter catalog, code and private activity", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(`${baseURL}/education`);
  await page.locator('.education-series-row').filter({ hasText: '객체인식' }).click();
  await page.getByRole('link', { name: '자료 읽기' }).click();
  await expect(page.locator('.perception-chapter')).toHaveCount(10);
  await expect(page.locator('#improve h2')).toHaveText('10. 실습 확장하기');
  await expect(page.locator('.perception-lesson')).not.toContainText('장수를 늘리기 전에 실패 원인을');
  await expect(page.locator('#first-look table')).toContainText('classification');
  await expect(page.locator('#first-look table')).toContainText('instance segmentation');
  await expect(page.locator('.education-prediction-grid img')).toHaveCount(4);
  await page.locator('.education-prediction-grid').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.education-prediction-grid img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  const inferenceRecord = await page.request.get(`${baseURL}/education-assets/object-recognition/inference-examples.json`);
  expect((await inferenceRecord.json()).examples).toHaveLength(4);
  await page.locator('.education-sidebar a[href$="#labels"]').click();
  await expect(page.locator('.education-sidebar a[aria-current="location"]')).toContainText('사진과 정답지');
  await page.getByRole('button', { name: '라벨 형식 예시 복사' }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('0.20 0.25');
  await page.locator('#render .education-recipe > summary').click();
  await expect(page.locator('#render .education-recipe code')).toContainText('--num_images 120');
  const urls = await page.locator('.perception-lesson [src], .perception-lesson a[download]').evaluateAll(elements => [...new Set(elements.map(el => el.getAttribute('src') || el.getAttribute('href')).filter((url): url is string => Boolean(url?.startsWith('/education-assets/'))))]);
  for (const url of urls) expect((await page.request.get(`${baseURL}${url}`)).status(), url).toBe(200);
  for (const width of [320,390,1440]) for (const theme of ['light','dark']) {
    await page.setViewportSize({width, height: 1000});
    await page.addInitScript(theme => localStorage.setItem('mero-theme', theme), theme);
    await page.goto(`${baseURL}/education/object-recognition/synthetic-data`);
    await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}/${theme}`).toBe(true);
    await page.screenshot({path:`.local/qa/education/detection-${width}-${theme}.png`,fullPage:true});
  }
  await page.goto(`${baseURL}/activities`);
  await expect(page.locator('body')).not.toContainText('TRI-RESPONSE');
  const hidden = await page.request.get(`${baseURL}/activities/tri-response`);
  expect(await hidden.text()).not.toContain("TRI-RESPONSE");
  expect(await hidden.text()).toContain('name="robots" content="noindex"');
  expect((await page.request.get(`${baseURL}/images/tri-response.webp`)).status()).toBe(404);
  await page.goto(`${baseURL}/projects/qdd-quadruped`);
  await expect(page.locator('body')).not.toContainText('TRI-RESPONSE');
  const offline = await page.request.get(`${baseURL}/MERO-preview.html`);
  expect(await offline.text()).not.toContain('tri-response');
});

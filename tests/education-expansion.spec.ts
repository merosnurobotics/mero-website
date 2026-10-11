import { test, expect } from "@playwright/test";
import { educationTopics } from "../src/lib/education/catalog";
import index from "../src/lib/education/generated/concept-index.json";
const baseURL = process.env.MERO_EDUCATION_TEST_URL;
test.skip(!baseURL || process.env.MERO_EDUCATION_TEST_MEMBERS_ONLY === "true", "Requires public education QA server");

for (const topic of educationTopics) test(`${topic.title}: every listed lesson opens with its chapter anchors`, async ({page}) => {
  test.setTimeout(120000);
  await page.goto(`${baseURL}${topic.path}`);
  await expect(page.locator('h1')).toHaveText(topic.title);
  await expect(page.locator('.education-course')).toHaveCount(topic.lessons.length);
  for (const lesson of topic.lessons) {
    const response = await page.goto(`${baseURL}${lesson.path}`);
    expect(response?.status(), lesson.path).toBe(200);
    expect((await page.locator('h1').innerText()).replace(/\s/g, '')).toBe(lesson.title.replace(/\s/g, ''));
    for (const chapter of lesson.chapters) await expect(page.locator(`[id="${chapter.id}"]`), `${lesson.path}#${chapter.id}`).toHaveCount(1);
    const navigation = page.getByRole('navigation', {name: '교육자료 읽는 순서'});
    await expect(navigation).toBeVisible();
  }
});
test("merged topic aliases and previous lesson URLs remain usable", async ({page}) => {
  for (const alias of ['object-recognition', 'vla']) {
    await page.goto(`${baseURL}/education/${alias}`);
    await expect(page).toHaveURL(`${baseURL}/education/robot-vision`);
    await expect(page.locator('h1')).toHaveText('로봇 비전');
  }
  await page.goto(`${baseURL}/education/vla/foundations`);
  await expect(page.locator('.breadcrumbs')).toContainText('로봇 비전');
  await expect(page.locator('.education-topic-tree[open] > summary')).toContainText('로봇 비전');
});
test("concept lessons fit mobile, reveal explanations, and navigate in difficulty order", async ({page}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const additions = index.metadata as Record<string, {path: string}[]>;
  for (const width of [320, 1440]) for (const topic of educationTopics) {
    const path = additions[topic.path][0].path;
    await page.setViewportSize({width, height: 1000});
    await page.goto(`${baseURL}${path}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path}/${width}`).toBe(true);
    const check = page.locator('#self-check details').first();
    await expect(check.locator('p')).not.toBeVisible();
    await check.locator('summary').click();
    await expect(check.locator('p')).toBeVisible();
    await expect(page.locator('#sources a').first()).toBeVisible();
    const current = topic.lessons.findIndex(lesson => lesson.path === path);
    const next = topic.lessons[current + 1];
    if (next) {
      await page.getByRole('navigation', {name: '교육자료 읽는 순서'}).getByRole('link', {name:/다음 자료/}).click();
      await expect(page).toHaveURL(`${baseURL}${next.path}`);
    }
  }
  expect(errors).toEqual([]);
});

test("official videos load on request, retain attribution, and fit mobile", async ({page}) => {
  await page.setViewportSize({width: 320, height: 900});
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({contentType:'text/html', body:'<p>Embedded player boundary</p>'}));
  await page.goto(`${baseURL}/education/reinforcement-learning/reward-design`);
  const demos = page.locator('#robot-demos');
  await expect(demos).toContainText('RAI Institute');
  await expect(demos.locator('iframe,video')).toHaveCount(0);
  await expect(demos.getByRole('link', {name:'제작팀의 연구 설명'})).toHaveAttribute('href', /rai-inst.com/);
  await demos.getByRole('button', {name:/영상 불러오기/}).click();
  await expect(demos.locator('iframe')).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/cjaZUFMZWOY?autoplay=1&rel=0');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.route('https://openvla.github.io/static/videos/**', route => route.fulfill({status:204}));
  await page.goto(`${baseURL}/education/robot-vision/openvla-and-action-models`);
  await expect(demos.locator('video')).toHaveCount(0);
  await demos.getByRole('button', {name:/영상 불러오기/}).click();
  await expect(demos.locator('video')).toHaveAttribute('controls', '');
  await expect(demos.locator('video')).toHaveAttribute('src', /openvla.github.io\/static\/videos/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

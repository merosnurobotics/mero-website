import { test, expect } from "@playwright/test";
const baseURL = process.env.MERO_EDUCATION_TEST_URL;
test.skip(!baseURL || process.env.MERO_EDUCATION_TEST_MEMBERS_ONLY === "true", "Requires the public education QA server.");

test("foundations connect to the existing robot application", async ({ page }) => {
  await page.goto(`${baseURL}/education`);
  await expect(page.locator('.education-topic-tree[open]')).toHaveCount(0);
  await expect(page.locator('.education-stage[open]')).toHaveCount(0);
  await page.locator('.education-topic-tree').filter({has:page.locator('a[href="/education/reinforcement-learning"]')}).locator(':scope > summary').click();
  await expect(page.locator('.education-topic-tree').filter({has:page.locator('a[href="/education/reinforcement-learning"]')})).toContainText('관측에서 행동으로');
  await expect(page.locator('.education-topic-tree').filter({has:page.locator('a[href="/education/reinforcement-learning"]')})).toContainText('모방 강화학습');
  await page.goto(`${baseURL}/education/reinforcement-learning`);
  await expect(page.locator('h1')).toHaveText('강화학습');
  await expect(page.locator('.education-course')).toHaveCount(3);
  await page.goto(`${baseURL}/education/simulation/rl-environments`);
  await page.getByRole('navigation',{name:'교육자료 읽는 순서'}).getByRole('link',{name:/다음 자료/}).click();
  await expect(page).toHaveURL(`${baseURL}/education/reinforcement-learning/kimodo-mjwarp`);
});

test("generated lessons render readable emphasis, figures and legal notices", async ({ page }) => {
  const paths = [
    '/education/deepml/data-and-models','/education/deepml/neural-networks','/education/deepml/evaluation',
    '/education/reinforcement-learning/reinforcement-learning','/education/reinforcement-learning/policy-and-robot',
    '/education/simulation/robot-models','/education/simulation/mujoco-first-run','/education/simulation/rl-environments',
  ];
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  for (const width of [320,1440]) for (const path of paths) {
    await page.setViewportSize({width,height:1000});
    await page.goto(`${baseURL}${path}`);
    await expect(page.locator('.perception-chapter')).toHaveCount(/\/(robot-models|mujoco-first-run)$/.test(path) ? 5 : 4);
    expect((await page.locator('.deepml-content').allTextContents()).join('')).not.toContain('**');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),`${path}/${width}`).toBe(true);
    const images=page.locator('.deepml-content img');
    for (const image of await images.all()) { await image.scrollIntoViewIfNeeded(); await expect.poll(()=>image.evaluate(el=>(el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth>0)).toBe(true); }
    const desktop=page.locator('.am-flow-desktop');
    if (await desktop.count()) {
      if(width===1440) await expect(desktop.first()).toBeVisible(); else await expect(desktop.first()).not.toBeVisible();
    }
  }
  await page.goto(`${baseURL}/education/deepml/neural-networks`);
  await expect(page.locator('.deepml-content strong').first()).toBeVisible();
  const animation=page.locator('.deepml-network-animation img');
  await animation.scrollIntoViewIfNeeded();
  await expect.poll(()=>animation.evaluate(el=>(el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth>0)).toBe(true);
  const gif = await page.request.get(`${baseURL}/education-assets/deepml/neural-network.gif`);
  expect(gif.status()).toBe(200);
  expect(gif.headers()['content-type']).toBe('image/gif');
  await page.goto(`${baseURL}/education/reinforcement-learning/reinforcement-learning`);
  await expect(page.locator('.education-sources')).toContainText('Farama');
  await expect(page.locator('.education-sources')).toContainText('MIT');
  expect(errors).toEqual([]);
});


test("MuJoCo animations load and switch to static results for reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(`${baseURL}/education/simulation/mujoco-first-run`);
  for (const name of ["pendulum", "inverted-pendulum"]) {
    const image = page.locator(`img[src="/education-assets/simulation/${name}.gif"]`);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(el => (el as HTMLImageElement).currentSrc)).toContain(`${name}.gif`);
    const response = await page.request.get(`${baseURL}/education-assets/simulation/${name}.gif`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/gif");
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const name of ["pendulum", "inverted-pendulum"]) {
    const image = page.locator(`img[src="/education-assets/simulation/${name}.gif"]`);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(el => (el as HTMLImageElement).currentSrc)).toContain(`${name}-at-1.0s.png`);
  }
});

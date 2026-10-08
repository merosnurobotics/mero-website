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
    '/education/simulation/gazebo-basics','/education/vla/foundations',
  ];
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  for (const width of [320,1440]) for (const path of paths) {
    await page.setViewportSize({width,height:1000});
    await page.goto(`${baseURL}${path}`);
    await expect(page.locator('.perception-chapter')).toHaveCount(path.endsWith('/foundations') ? 8 : path.endsWith('/mujoco-first-run') ? 6 : path.endsWith('/robot-models') ? 7 : path.endsWith('/evaluation') || path.endsWith('/rl-environments') ? 4 : 5);
    expect(await page.locator('.deepml-content').evaluateAll(elements=>elements.map(el=>{const clone=el.cloneNode(true) as HTMLElement;clone.querySelectorAll('pre,code').forEach(item=>item.remove());return clone.textContent;}).join(''))).not.toContain('**');
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

test("cart-pole sliders select recorded PID trials and retain a comparison", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(`${baseURL}/education/simulation/mujoco-first-run#cartpole`);
  const tuner = page.locator('.cartpole-tuner');
  const results = tuner.locator('.cartpole-result');
  await expect(tuner.locator('.cartpole-loading')).toHaveCount(0);
  await expect(results.first()).toContainText('1.35초에 종료');
  for (const [key, values] of [['kp',[12,24,48]],['ki',[0,2,6]],['kd',[1,4,8]]] as const) {
    const slider = page.locator(`#cartpole-${key}`);
    await slider.focus();
    await slider.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuetext', String(values[1]));
  }
  await expect(results.first()).toContainText('P 24 · I 2 · D 4');
  await expect(results.first()).toContainText('8초 동안');
  const selected = results.first().locator('img');
  await expect.poll(() => selected.evaluate(el => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
  await tuner.getByRole('button', {name:'현재 조합을 비교 기준으로'}).click();
  await page.locator('#cartpole-kp').press('End');
  await expect(results.first()).toContainText('P 48 · I 2 · D 4');
  await expect(results.last()).toContainText('P 24 · I 2 · D 4');
  const before = await selected.getAttribute('src');
  await tuner.getByRole('button', {name:'처음부터 다시 보기'}).click();
  await expect(selected).not.toHaveAttribute('src', before!);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(() => selected.evaluate(el => (el as HTMLImageElement).currentSrc)).toContain('p48-i2-d4.png');
  for (const p of [12,24,48]) for (const i of [0,2,6]) for (const d of [1,4,8]) {
    const response = await page.request.get(`${baseURL}/education-assets/simulation/cartpole/p${p}-i${i}-d${d}.gif`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('image/gif');
  }
  await page.setViewportSize({width:320,height:900});
  await expect.poll(() => page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});


test("preparation paths stay collapsed and the small environment separates task end from time limits", async ({ page }) => {
  await page.goto(`${baseURL}/education`);
  await expect(page.locator('.education-route[open]')).toHaveCount(0);
  await expect(page.locator('a[href="/education/vla/foundations"]').first()).toBeAttached();
  await page.goto(`${baseURL}/education/reinforcement-learning/reinforcement-learning`);
  const environment=page.locator('.tiny-rl-environment');
  await environment.getByRole('button',{name:'오른쪽 →'}).click();
  await environment.getByRole('button',{name:'오른쪽 →'}).click();
  await expect(environment.getByRole('status')).toContainText('실제 종료');
  await expect(environment).toContainText('4.400');
  await expect(environment.getByRole('button',{name:'오른쪽 →'})).toBeDisabled();
  await environment.getByRole('button',{name:'초기화'}).click();
  for(let step=0;step<8;step++) await environment.getByRole('button',{name:step%2===0 ? '← 왼쪽' : '오른쪽 →'}).click();
  await expect(environment.getByRole('status')).toContainText('외부 시간 제한');
  await page.goto(`${baseURL}/education/reinforcement-learning/kimodo-mjwarp`);
  await expect(page.locator('#control-comparison')).toContainText('8 / 8');
  await expect(page.locator('#control-comparison')).toContainText('성공률');
  await page.goto(`${baseURL}/education/vla/foundations`);
  await expect(page.locator('#chunks')).toContainText('ACT');
  await expect(page.locator('#boundary')).toContainText('프로젝트');
  await page.screenshot({path:'.local/qa/education/vla-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:900});
  await page.screenshot({path:'.local/qa/education/vla-mobile.png',fullPage:true});
});

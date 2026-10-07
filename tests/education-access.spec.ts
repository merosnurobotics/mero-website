import { test, expect } from "@playwright/test";
const baseURL = process.env.MERO_EDUCATION_TEST_URL;
test.skip(!baseURL,"Set MERO_EDUCATION_TEST_URL.");
const membersOnly = process.env.MERO_EDUCATION_TEST_MEMBERS_ONLY === "true";
const courses=[
  ["/education/localization/lidar","LiDAR로 시작하는 localization",6],
  ["/education/control/pid-control","그림으로 이해하는 PID control",5],
  ["/education/development-setup/remote-work","원격 작업하기: ssh jetson부터 GUI까지",8],
] as const;
async function login(context: import("@playwright/test").BrowserContext) {
  const email=process.env.MERO_EDUCATION_TEST_EMAIL,password=process.env.MERO_EDUCATION_TEST_PASSWORD;
  test.skip(!email||!password,"Member credentials needed for content tests.");
  expect((await context.request.post(`${baseURL}/api/auth/login`,{data:{email,password},headers:{Origin:baseURL!}})).status()).toBe(200);
}

test("guests and invalid sessions cannot read education pages, files or optimized copies",async({page,context})=>{
  test.skip(!membersOnly,"Private-mode regression test.");
  for(const path of ["/education",...courses.map(c=>c[0]),"/education/object-recognition/synthetic-data","/education/reinforcement-learning/kimodo-mjwarp"]) {
    const response=await context.request.get(`${baseURL}${path}`,{maxRedirects:0});
    expect(response.status(),path).toBe(307);
    const location=new URL(response.headers().location,baseURL);
    expect(location.pathname).toBe('/login');expect(location.searchParams.get('next')).toBe(path);
    const rsc=await context.request.get(`${baseURL}${path}?_rsc=guest`,{headers:{RSC:'1'},maxRedirects:0});
    expect(rsc.status()).toBe(307);
  }
  for(const asset of ['localization/NOTICE.md','control/PID_en.svg','setup/NOTICE.md','kimodo-mjwarp/media/oneleg_gpu_policy.mp4','kimodo-mjwarp/microban-imitation-rl-lesson.zip','object-recognition/inference-examples.json']) {
    const response=await context.request.get(`${baseURL}/education-assets/${asset}`);
    expect(response.status()).toBe(401);expect(response.headers()['cache-control']).toContain('no-store');
  }
  expect((await context.request.get(`${baseURL}/_next/image?url=%2Feducation-assets%2Fobject-recognition%2Fsynthetic-samples.jpg&w=1080&q=75`)).status()).toBe(404);
  await context.addCookies([{name:'mero_session',value:'a'.repeat(64),url:baseURL!}]);
  await page.goto(`${baseURL}/education/localization/lidar`);
  await expect(page).toHaveURL(/\/login\?next=/);
  await expect(page.locator('.perception-lesson')).toHaveCount(0);
  expect((await context.request.get(`${baseURL}/education-assets/control/PID_varyingP.jpg`)).status()).toBe(401);
});

test("members can read all new courses and play authenticated media ranges",async({page,context})=>{
  await login(context); await context.grantPermissions(["clipboard-read","clipboard-write"]);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${baseURL}/education`);await expect(page.locator('.education-series-row')).toHaveCount(6);
  for(const [path,title,count] of courses) {
    await page.goto(`${baseURL}${path}`);
    await expect(page.locator('h1')).toHaveText(title);
    await expect(page.locator('.perception-chapter')).toHaveCount(count);
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content',membersOnly ? /noindex/ : /^index, follow$/);
    const images=await page.locator('.perception-lesson img').evaluateAll(els=>els.map(e=>e.getAttribute('src')!));
    await expect(page.locator(".education-native-figure")).toHaveCount(path.includes("pid-control") ? 2 : 4);
    for(const image of images) {
      const r=await context.request.get(`${baseURL}${image}`);
      expect(r.status(),image).toBe(200);expect(r.headers()['cache-control']).toContain('private');
    }
    await page.getByRole('button',{name:/복사$/}).first().click();
    await expect(page.locator('[role=status]').first()).toContainText('복사했습니다.');
  }
  await page.goto(`${baseURL}/education/localization/lidar`);
  await expect(page.locator(".perception-lesson img")).toHaveCount(0);
  await expect(page.locator('#practice')).toContainText('초기 yaw=0.35');
  await expect(page.locator('#discussion')).toContainText('심화 discussion');
  await page.goto(`${baseURL}/education/control/pid-control`);
  await expect(page.locator('#applications')).toContainText('P 중심');
  await expect(page.locator('#applications')).toContainText('PI');
  await expect(page.locator('.perception-lesson')).not.toContainText('시뮬레이션');
  await expect(page.locator('img[src*="motor-response"]')).toHaveCount(0);
  const media=`${baseURL}/education-assets/kimodo-mjwarp/media/oneleg_gpu_policy.mp4`;
  const range=await context.request.get(media,{headers:{Range:'bytes=0-99'}});
  expect(range.status()).toBe(206);expect((await range.body()).length).toBe(100);
  expect(range.headers()['content-range']).toMatch(/^bytes 0-99\//);
  const invalid=await context.request.get(media,{headers:{Range:'bytes=999999999-'}});
  expect(invalid.status()).toBe(416);
  expect(errors).toEqual([]);
  expect((await context.request.post(`${baseURL}/api/auth/logout`,{data:{},headers:{Origin:baseURL!}})).status()).toBe(200);
  expect((await context.request.get(media)).status()).toBe(membersOnly ? 401 : 200);
});

test("new education lessons fit narrow screens and both themes",async({page,context})=>{
  await login(context); await context.grantPermissions(['clipboard-read','clipboard-write']);
  for(const width of [320,390,1440]) for(const theme of ['light','dark']) {
    await page.setViewportSize({width,height:1000});
    await page.addInitScript(theme=>localStorage.setItem('mero-theme',theme),theme);
    for(const [path] of courses) {
      await page.goto(`${baseURL}${path}`);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${path}/${width}/${theme}`).toBe(true);
      await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
      await page.locator('.perception-lesson img').evaluateAll(els=>els.forEach(e=>(e as HTMLImageElement).loading='eager'));
      await expect.poll(()=>page.locator('.perception-lesson img').evaluateAll(els=>els.every(e=>(e as HTMLImageElement).complete && (e as HTMLImageElement).naturalWidth>0))).toBe(true);
      if(width!==320) await page.screenshot({path:`.local/qa/education/${path.split('/').pop()}-${width}-${theme}.png`,fullPage:true});
    }
  }
});

test("public mode opens lessons and files without a member account",async({page,context})=>{
  test.skip(membersOnly,"Public-mode regression test.");
  for(const [path,title] of courses) {
    await page.goto(`${baseURL}${path}`);
    await expect(page.locator('h1')).toHaveText(title);
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','index, follow');
  }
  await page.goto(`${baseURL}/education`);
  await expect(page.locator('.education-series-row')).toHaveCount(6);
  for(const asset of ['localization/NOTICE.md','control/PID_en.svg','setup/NOTICE.md','object-recognition/inference-examples.json','kimodo-mjwarp/microban-imitation-rl-lesson.zip']) {
    expect((await context.request.get(`${baseURL}/education-assets/${asset}`)).status()).toBe(200);
  }
  const response=await context.request.get(`${baseURL}/education-assets/kimodo-mjwarp/media/oneleg_gpu_policy.mp4`,{headers:{Range:'bytes=0-99'}});
  expect(response.status()).toBe(206);expect((await response.body()).length).toBe(100);
});

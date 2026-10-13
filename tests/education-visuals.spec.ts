import { test, expect } from "@playwright/test";
import index from "../src/lib/education/generated/concept-index.json";

const baseURL = process.env.MERO_EDUCATION_TEST_URL;
test.skip(!baseURL || process.env.MERO_EDUCATION_TEST_MEMBERS_ONLY === "true", "Requires public education QA server");

for (const [topic, lessons] of Object.entries(index.metadata)) test(`${topic}: visual lessons stay readable on mobile and desktop`, async ({page}) => {
  test.setTimeout(240000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const width of [320, 1440]) {
    await page.setViewportSize({width, height: 950});
    for (const lesson of lessons) {
      await page.goto(`${baseURL}${lesson.path}`);
      await expect(page.locator(".concept-visual")).toHaveCount(3);
      await expect(page.locator(".concept-section-summary")).toHaveCount(4);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${lesson.path}/${width}: page overflow`).toBe(true);
      for (const figure of await page.locator(".concept-reference").all()) {
        await figure.scrollIntoViewIfNeeded();
        await expect.poll(() => figure.locator("img").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
        await expect(figure.getByRole("link", {name: "원문", exact: true})).toHaveAttribute("href", /^https:/);
        await expect(figure.getByRole("link", {name: "사용 조건", exact: true})).toHaveAttribute("href", /^https:/);
      }
      const clipped = await page.locator(".concept-visual-content svg:visible").evaluateAll(elements => elements.flatMap(svg => {
        const bounds = svg.getBoundingClientRect();
        const viewbox = (svg as SVGSVGElement).viewBox.baseVal;
        const scale = bounds.width / viewbox.width;
        const texts = Array.from(svg.querySelectorAll("text"));
        return texts.filter(text => parseFloat(getComputedStyle(text).fontSize) * scale < 10.5).map(text => text.textContent);
      }));
      expect(clipped, `${lesson.path}/${width}: tiny diagram labels`).toEqual([]);
    }
  }
  // The same diagrams inherit the site's dark palette without altering source photos.
  await page.evaluate(() => document.documentElement.dataset.theme = "dark");
  const ink = await page.locator(".concept-visual-content").first().evaluate(node => getComputedStyle(node).getPropertyValue("--ink").trim());
  expect(ink).toBe("#e9edf7");
  expect(errors).toEqual([]);
});

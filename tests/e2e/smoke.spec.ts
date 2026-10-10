import { expect, test } from "@playwright/test";

test("map root fills the viewport without page scrolling", async ({ page }) => {
  await page.goto("/");
  const root = page.getByTestId("map-root");
  await expect(root).toBeVisible();

  const viewport = page.viewportSize();
  const box = await root.boundingBox();
  expect(box?.width).toBe(viewport?.width);
  expect(box?.height).toBe(viewport?.height);

  const scrolls = await page.evaluate(() => ({
    x: document.documentElement.scrollWidth > window.innerWidth,
    y: document.documentElement.scrollHeight > window.innerHeight,
  }));
  expect(scrolls).toEqual({ x: false, y: false });
  await expect(page.locator("html")).toHaveAttribute("lang", "th");
});

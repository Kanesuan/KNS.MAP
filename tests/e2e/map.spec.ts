import { expect, test } from "@playwright/test";
import { openMap, viewFromUrl } from "./helpers";

test("map fills the viewport without page scrolling", async ({ page }) => {
  await openMap(page);
  const viewport = page.viewportSize();
  const box = await page.getByTestId("map-root").boundingBox();
  expect(box?.width).toBe(viewport?.width);
  expect(box?.height).toBe(viewport?.height);

  const scrolls = await page.evaluate(() => ({
    x: document.documentElement.scrollWidth > window.innerWidth,
    y: document.documentElement.scrollHeight > window.innerHeight,
  }));
  expect(scrolls).toEqual({ x: false, y: false });
  await expect(page.locator("html")).toHaveAttribute("lang", "th");
});

test("default view covers the six provinces", async ({ page }) => {
  await openMap(page);
  const { lat, lng } = viewFromUrl(page);
  expect(lat).toBeGreaterThan(13.6);
  expect(lat).toBeLessThan(14.1);
  expect(lng).toBeGreaterThan(100.2);
  expect(lng).toBeLessThan(100.7);
});

test("view survives a reload", async ({ page }) => {
  await openMap(page, "?c=13.75000,100.50000&z=12.00");
  await page.getByRole("button", { name: "ซูมเข้า" }).click();
  await expect.poll(() => viewFromUrl(page).zoom).toBeCloseTo(13, 1);

  const before = viewFromUrl(page);
  await page.reload();
  await expect(page.getByTestId("map-root")).toHaveAttribute("data-loaded", "true");
  const after = viewFromUrl(page);
  expect(after.zoom).toBeCloseTo(before.zoom, 1);
  expect(after.lat).toBeCloseTo(before.lat, 3);
  expect(after.lng).toBeCloseTo(before.lng, 3);
});

test("searching coordinates moves the map", async ({ page }) => {
  await openMap(page);
  await page.getByRole("searchbox", { name: "ค้นหาสถานที่หรือพิกัด" }).fill("13.7563, 100.5018");
  await page.keyboard.press("Enter");
  await expect.poll(() => viewFromUrl(page).lat, { timeout: 10_000 }).toBeCloseTo(13.7563, 3);
  expect(viewFromUrl(page).lng).toBeCloseTo(100.5018, 3);
});

test("searching a place name shows results from the geocoder", async ({ page }) => {
  await page.route("**/api/geocode?**", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ results: [{ lat: 13.7466, lng: 100.5348, label: "สยามพารากอน" }] }),
    }),
  );
  await openMap(page);
  await page.getByRole("searchbox").fill("สยาม");
  await page.getByRole("button", { name: "ค้นหา", exact: true }).click();
  await page.getByRole("button", { name: "สยามพารากอน" }).click();
  await expect.poll(() => viewFromUrl(page).lat, { timeout: 10_000 }).toBeCloseTo(13.7466, 3);
});

test("controls have 44px touch targets", async ({ page }) => {
  await openMap(page);
  for (const name of ["ซูมเข้า", "ซูมออก", "ตำแหน่งของฉัน", "ค้นหา"]) {
    const box = await page.getByRole("button", { name, exact: true }).boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

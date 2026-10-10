import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, type Page } from "@playwright/test";

const testStyle = readFileSync(path.join(__dirname, "fixtures/test-style.json"), "utf8");

/** Serves a local basemap so tests never depend on the tile provider. */
export async function mockBasemap(page: Page): Promise<void> {
  await page.route("**/styles/liberty", (route) =>
    route.fulfill({ contentType: "application/json", body: testStyle }),
  );
  await page.route("https://basemap.test/**", (route) => route.fulfill({ status: 404 }));
}

export async function openMap(page: Page, search = ""): Promise<void> {
  await mockBasemap(page);
  await page.goto(`/${search}`);
  await expect(page.getByTestId("map-root")).toHaveAttribute("data-loaded", "true");
}

export function viewFromUrl(page: Page): { lat: number; lng: number; zoom: number } {
  const params = new URL(page.url()).searchParams;
  const [lat, lng] = (params.get("c") ?? "").split(",").map(Number);
  return { lat: lat ?? NaN, lng: lng ?? NaN, zoom: Number(params.get("z")) };
}

/** True when the app uses its mobile layout (768px wide or less, as in the brief). */
export function isMobileLayout(page: Page): boolean {
  return (page.viewportSize()?.width ?? 0) <= 768;
}

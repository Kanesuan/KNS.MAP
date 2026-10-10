import { expect, test, type Page } from "@playwright/test";
import { openMap } from "./helpers";

/** Opens the map centred on a point and taps the centre of the map. */
async function tapAt(page: Page, lat: number, lng: number) {
  await openMap(page, `?c=${lat},${lng}&z=14&l=bkk-zoning-current`);
  const vp = page.viewportSize();
  if (!vp) throw new Error("no viewport");
  await page.getByTestId("map-root").click({ position: { x: vp.width / 2, y: vp.height / 2 } });
}

const results = (page: Page) =>
  test.info().project.name === "mobile"
    ? page.getByTestId("inspect-sheet")
    : page.getByTestId("inspect-panel");

test("tapping a point in Bangkok shows a card per layer within 2 seconds", async ({ page }) => {
  await tapAt(page, 13.775, 100.535);
  const panel = results(page);
  const zoning = panel.getByTestId("result-bkk-zoning-current");
  await expect(zoning).toContainText("ที่ดินประเภทพาณิชยกรรม", { timeout: 2_000 });
  await expect(zoning).toContainText("ข้อมูลตัวอย่าง");
  await expect(panel.locator('[data-testid^="result-"]')).toHaveCount(7);
  await expect(panel.locator('[data-testid^="result-"]').first()).toHaveAttribute(
    "data-testid",
    "result-bkk-zoning-current",
  );
  await expect(panel.getByTestId("result-rail-transit")).toContainText("สถานีใกล้ที่สุดคือ");
  await expect(panel).toContainText("ไม่ใช่เอกสารทางกฎหมาย");
  await expect(panel.getByTestId("result-flood-recurrence")).toHaveAttribute(
    "data-status",
    /not_ready|answer|empty/,
  );
});

test("a point without data says so", async ({ page }) => {
  await tapAt(page, 13.6, 100.3);
  const zoning = results(page).getByTestId("result-bkk-zoning-current");
  await expect(zoning).toContainText("ไม่มีข้อมูลในจุดนี้", { timeout: 2_000 });
});

test("'show on map' turns the layer on", async ({ page }) => {
  await tapAt(page, 13.775, 100.535);
  const card = results(page).getByTestId("result-subsidence");
  await card.getByRole("button", { name: "ดูบนแผนที่" }).click();
  await expect(card.getByRole("button", { name: "แสดงบนแผนที่อยู่" })).toBeDisabled();
  await expect.poll(() => new URL(page.url()).searchParams.get("l")).toContain("subsidence");
});

test("an external API failure only breaks its own card", async ({ page }) => {
  await page.route("**/api/inspect?**", (route) =>
    route.fulfill({ status: 502, body: "bad gateway" }),
  );
  await tapAt(page, 13.775, 100.535);
  const panel = results(page);
  await expect(panel.getByTestId("result-flood-recurrence")).toContainText("โหลดไม่สำเร็จ");
  await expect(panel.getByTestId("result-bkk-zoning-current")).toContainText(
    "ที่ดินประเภทพาณิชยกรรม",
  );
});

test("the panel closes", async ({ page }) => {
  await tapAt(page, 13.775, 100.535);
  const panel = results(page);
  await expect(panel).toBeVisible();
  if (test.info().project.name === "mobile") {
    await panel.getByRole("button", { name: "ปิด", exact: true }).click();
  } else {
    await page.getByRole("button", { name: "ปิดผลของจุด" }).click();
  }
  await expect(panel).toBeHidden();
});

test("first-visit hint can be dismissed", async ({ page }) => {
  await openMap(page);
  const hint = page.getByText("แตะที่แผนที่เพื่อดูข้อมูลของจุดนั้น");
  await expect(hint).toBeVisible();
  await page.getByRole("button", { name: "ปิดคำแนะนำ" }).click();
  await expect(hint).toBeHidden();
  await page.reload();
  await expect(page.getByTestId("map-root")).toHaveAttribute("data-loaded", "true");
  await expect(hint).toBeHidden();
});

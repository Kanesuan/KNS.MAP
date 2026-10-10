import { expect, test, type Page } from "@playwright/test";
import { openMap } from "./helpers";

const layersInUrl = (page: Page) => new URL(page.url()).searchParams.get("l");

async function openPanel(page: Page) {
  if (test.info().project.name === "mobile") {
    await page.getByRole("button", { name: "เปิดแผงชั้นข้อมูล" }).click();
    await expect(page.getByTestId("layer-sheet")).toBeVisible();
  }
}

const zoningSwitch = (page: Page) =>
  page.getByRole("switch", { name: "ผังเมืองรวม กทม. ที่บังคับใช้" });
const draftSwitch = (page: Page) =>
  page.getByRole("switch", { name: "ร่างผังเมืองรวม กทม. ปรับปรุงครั้งที่ 4" });
const subsidenceSwitch = (page: Page) => page.getByRole("switch", { name: "แผ่นดินทรุด" });

test("current zoning is on by default and in the URL", async ({ page }) => {
  await openMap(page);
  await expect.poll(() => layersInUrl(page)).toBe("bkk-zoning-current");
  await openPanel(page);
  await expect(zoningSwitch(page)).toHaveAttribute("aria-checked", "true");
});

test("toggle layers, with zoning plans exclusive", async ({ page }) => {
  await openMap(page);
  await openPanel(page);
  await subsidenceSwitch(page).click();
  await expect.poll(() => layersInUrl(page)).toBe("bkk-zoning-current,subsidence");

  await draftSwitch(page).click();
  await expect(zoningSwitch(page)).toHaveAttribute("aria-checked", "false");
  await expect.poll(() => layersInUrl(page)).toBe("subsidence,bkk-zoning-draft4");
  await expect(page.getByTestId("layer-row-bkk-zoning-draft4")).toContainText(
    "ร่าง ยังไม่บังคับใช้",
  );

  await subsidenceSwitch(page).click();
  await expect.poll(() => layersInUrl(page)).toBe("bkk-zoning-draft4");
});

test("visible layers survive a reload", async ({ page }) => {
  await openMap(page, "?l=rail-transit,admin-boundary");
  await openPanel(page);
  await expect(page.getByRole("switch", { name: "รถไฟฟ้าและสถานี" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(zoningSwitch(page)).toHaveAttribute("aria-checked", "false");
  await page.reload();
  await expect(page.getByTestId("map-root")).toHaveAttribute("data-loaded", "true");
  await expect.poll(() => layersInUrl(page)).toBe("rail-transit,admin-boundary");
});

test("every layer has a sample badge and a '?' with its source and data date", async ({ page }) => {
  await openMap(page);
  await openPanel(page);
  const rows = page.locator('[data-testid^="layer-row-"]');
  await expect(rows).toHaveCount(7);
  for (const row of await rows.all()) {
    await expect(row).toContainText("ข้อมูลตัวอย่าง");
    const info = row.getByRole("button", { name: /^อ่านเพิ่มเติมเกี่ยวกับ/ });
    await expect(info).toHaveAttribute("aria-expanded", "false");
    await info.click();
    await expect(info).toHaveAttribute("aria-expanded", "true");
    await expect(row).toContainText("ที่มา:");
    await expect(row).toContainText("ข้อมูล ณ");
  }
});

test("opacity slider and legend appear when a layer is on", async ({ page }) => {
  await openMap(page);
  await openPanel(page);
  const row = page.getByTestId("layer-row-bkk-zoning-current");
  await expect(row.getByRole("list", { name: "คำอธิบายสัญลักษณ์" })).toContainText("พาณิชยกรรม");
  const thumb = row.getByRole("slider");
  await expect(thumb).toHaveAttribute("aria-valuenow", "60");
  await thumb.focus();
  await page.keyboard.press("ArrowRight");
  await expect(thumb).toHaveAttribute("aria-valuenow", "65");
});

test("a failed load shows an error with a working retry", async ({ page }) => {
  let fail = true;
  await page.route("**/data/subsidence.sample.geojson", (route) =>
    fail ? route.fulfill({ status: 500 }) : route.fallback(),
  );
  await openMap(page);
  await openPanel(page);
  await subsidenceSwitch(page).click();
  const row = page.getByTestId("layer-row-subsidence");
  await expect(row.getByRole("alert")).toContainText("โหลดไม่สำเร็จ");
  fail = false;
  await row.getByRole("button", { name: "ลองใหม่" }).click();
  await expect(row.getByRole("alert")).toHaveCount(0);
  await expect(row.getByRole("list", { name: "คำอธิบายสัญลักษณ์" })).toBeVisible();
});

test("the panel works with the keyboard only", async ({ page }) => {
  test.skip(test.info().project.name === "mobile", "keyboard path is checked on desktop");
  await openMap(page);
  await subsidenceSwitch(page).focus();
  await page.keyboard.press("Space");
  await expect(subsidenceSwitch(page)).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Enter");
  await expect(subsidenceSwitch(page)).toHaveAttribute("aria-checked", "false");

  const collapse = page.getByRole("button", { name: "ย่อแผงชั้นข้อมูล" });
  await collapse.focus();
  await page.keyboard.press("Enter");
  await expect(subsidenceSwitch(page)).toBeHidden();
  await page.getByRole("button", { name: "ขยายแผงชั้นข้อมูล" }).press("Enter");
  await expect(subsidenceSwitch(page)).toBeVisible();
});

test("mobile sheet drags up, closes, and leaves the map controls clear", async ({ page }) => {
  test.skip(test.info().project.name !== "mobile", "mobile only");
  await openMap(page);
  await openPanel(page);
  const sheet = page.getByTestId("layer-sheet");
  await expect(sheet).toHaveAttribute("data-snap", "half");

  // Controls slide up above the sheet (animated), so poll until they clear it.
  await expect
    .poll(async () => {
      const sheetBox = await sheet.boundingBox();
      const zoomBox = await page.getByRole("button", { name: "ซูมเข้า" }).boundingBox();
      return !!sheetBox && !!zoomBox && zoomBox.y + zoomBox.height <= sheetBox.y;
    })
    .toBe(true);

  const handle = page.getByTestId("layer-sheet-handle");
  const hb = await handle.boundingBox();
  if (!hb) throw new Error("no handle");
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
  await page.mouse.down();
  await page.mouse.move(hb.x + hb.width / 2, 40, { steps: 8 });
  await page.mouse.up();
  await expect(sheet).toHaveAttribute("data-snap", "full");

  const hb2 = await handle.boundingBox();
  if (!hb2) throw new Error("no handle");
  await page.mouse.move(hb2.x + hb2.width / 2, hb2.y + hb2.height / 2);
  await page.mouse.down();
  await page.mouse.move(hb2.x + hb2.width / 2, 630, { steps: 10 });
  await page.mouse.up();
  await expect(sheet).toBeHidden();
  await expect(page.getByRole("button", { name: "เปิดแผงชั้นข้อมูล" })).toBeVisible();
});

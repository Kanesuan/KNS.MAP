import { describe, expect, it } from "vitest";
import { hasMessage, t, th } from "@/i18n/th";

describe("i18n", () => {
  it("has a non-empty Thai app title", () => {
    expect(th.app.title).toMatch(/[฀-๿]/);
  });

  it("resolves dotted keys", () => {
    expect(t("panel.badges.sample")).toBe("ข้อมูลตัวอย่าง");
    expect(t("layers.subsidence.name")).toBe("แผ่นดินทรุด");
  });

  it("knows which keys exist", () => {
    expect(hasMessage("panel.title")).toBe(true);
    expect(hasMessage("panel")).toBe(false);
    expect(hasMessage("panel.nope")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { th } from "@/i18n/th";

describe("i18n", () => {
  it("has a non-empty Thai app title", () => {
    expect(th.app.title).toMatch(/[฀-๿]/);
  });
});

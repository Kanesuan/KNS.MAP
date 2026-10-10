import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseFloodRecurrence } from "@/lib/gistda";
import { describeFloodRecurrence } from "@/layers/describe";

const dir = path.join(__dirname, "../fixtures");
const fixture = (lat: string, lon: string): unknown =>
  JSON.parse(readFileSync(path.join(dir, `gistda-flood-recurrence_${lat}_${lon}.json`), "utf8"))
    .body;

describe("GISTDA flood recurrence parser", () => {
  it("parses every recorded fixture", () => {
    const files = readdirSync(dir).filter((f) => f.startsWith("gistda-flood-recurrence_"));
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const body: unknown = JSON.parse(readFileSync(path.join(dir, f), "utf8")).body;
      expect(() => parseFloodRecurrence(body)).not.toThrow();
    }
  });

  it("returns null for 'not found'", () => {
    expect(parseFloodRecurrence(fixture("13.7563", "100.5018"))).toBeNull();
  });

  it("reads the place and the flood years", () => {
    expect(parseFloodRecurrence(fixture("14.0500", "100.6200"))).toEqual({
      subdistrict: "คลองหนึ่ง",
      district: "คลองหลวง",
      province: "ปทุมธานี",
      floodYears: [2011],
      firstYear: 2011,
      lastYear: 2023,
    });
  });

  it("rejects an unknown shape instead of guessing", () => {
    expect(() => parseFloodRecurrence({ data: [] })).toThrow();
    expect(() => parseFloodRecurrence([{ foo: 1 }])).toThrow();
  });

  it("describes a Bangkok point with แขวง/เขต", () => {
    const parsed = parseFloodRecurrence(fixture("13.8600", "100.8300"));
    expect(describeFloodRecurrence(parsed as unknown as Record<string, unknown>)).toBe(
      "เคยมีน้ำท่วม 1 ปีในช่วง 2011–2023 (ปี 2011) · แขวงคู้ฝั่งเหนือ เขตหนองจอก กรุงเทพมหานคร",
    );
  });

  it("describes other provinces with ตำบล/อำเภอ", () => {
    const parsed = parseFloodRecurrence(fixture("13.9200", "100.4000"));
    expect(describeFloodRecurrence(parsed as unknown as Record<string, unknown>)).toBe(
      "เคยมีน้ำท่วม 1 ปีในช่วง 2011–2023 (ปี 2011) · ตำบลพิมลราช อำเภอบางบัวทอง จังหวัดนนทบุรี",
    );
  });

  it("says when no flood was found", () => {
    expect(describeFloodRecurrence({ floodYears: [], firstYear: 2011, lastYear: 2023 })).toBe(
      "ไม่พบน้ำท่วมในช่วง 2011–2023",
    );
  });
});

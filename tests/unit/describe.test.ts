import { describe, expect, it } from "vitest";
import {
  describeAdmin,
  describePlannedRoad,
  describeRailStation,
  describeSubsidence,
  describeZoning,
  formatDistance,
} from "@/layers/describe";

describe("describe functions", () => {
  it("zoning", () => {
    expect(describeZoning({ zone: "อ.3", category: "warehouse" })).toBe(
      "ที่ดินประเภทคลังสินค้า (อ.3)",
    );
    expect(describeZoning({ zone: "ศ.1", category: "conservation" })).toBe(
      "ที่ดินประเภทอนุรักษ์เพื่อส่งเสริมเอกลักษณ์ศิลปวัฒนธรรมไทย (ศ.1)",
    );
    expect(describeZoning({ zone: "ย.3", category: "residential_low" })).toBe(
      "ที่ดินประเภทที่อยู่อาศัยหนาแน่นน้อย (ย.3)",
    );
    expect(describeZoning({ zone: "พ.3", category: "commercial" })).toBe(
      "ที่ดินประเภทพาณิชยกรรม (พ.3)",
    );
    expect(describeZoning({ zone: "x", category: "unknown" })).toBeNull();
    expect(describeZoning({})).toBeNull();
  });

  it("planned road", () => {
    expect(describePlannedRoad({ code: "ก", widthM: 12, name: "ก5" }, { distanceM: 42.4 })).toBe(
      "มีแนวถนนโครงการ ก5 เขตทางกว้าง 12 เมตร ห่างจากจุดนี้ประมาณ 42 เมตร",
    );
    expect(describePlannedRoad({ code: "ข", widthM: 16 }, { distanceM: 10 })).toBe(
      "มีแนวถนนโครงการ ข เขตทางกว้าง 16 เมตร ห่างจากจุดนี้ประมาณ 10 เมตร",
    );
    expect(describePlannedRoad({ code: "ก1" }, { distanceM: 1 })).toBeNull();
  });

  it("subsidence", () => {
    expect(describeSubsidence({ rateClass: "10to20" })).toBe("พื้นดินทรุดตัว 10–20 มิลลิเมตรต่อปี");
    expect(describeSubsidence({ rateClass: "huge" })).toBeNull();
  });

  it("rail station", () => {
    expect(describeRailStation({ name: "สถานีตัวอย่าง ก1" }, { distanceM: 853 })).toBe(
      "สถานีใกล้ที่สุดคือสถานีตัวอย่าง ก1 ห่างประมาณ 850 เมตร",
    );
    expect(describeRailStation({}, { distanceM: 1 })).toBeNull();
  });

  it("admin boundary", () => {
    expect(describeAdmin({ name: "พระนคร", province: "กรุงเทพมหานคร" })).toBe(
      "เขตพระนคร กรุงเทพมหานคร",
    );
    expect(describeAdmin({ name: "เมืองนนทบุรี", province: "นนทบุรี" })).toBe(
      "อำเภอเมืองนนทบุรี จังหวัดนนทบุรี",
    );
    expect(describeAdmin({ name: "พระนคร" })).toBeNull();
    expect(describeAdmin({ name: 3, province: "x" })).toBeNull();
  });

  it("formats distances", () => {
    expect(formatDistance(3)).toBe("10 เมตร");
    expect(formatDistance(999)).toBe("1000 เมตร");
    expect(formatDistance(1234)).toBe("1.2 กิโลเมตร");
  });
});

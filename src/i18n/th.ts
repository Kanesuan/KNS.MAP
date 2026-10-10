// All on-screen Thai text lives here.
export const th = {
  app: {
    title: "แผนที่ตรวจที่ดิน กรุงเทพฯ และปริมณฑล",
    description: "เปิดดูผังเมืองและข้อมูลภัยพิบัติ แล้วแตะจุดเพื่ออ่านคำอธิบาย",
    map: "แผนที่",
    mapLoadFailed: "โหลดแผนที่ไม่สำเร็จ",
    retry: "ลองใหม่",
  },
  controls: {
    zoomIn: "ซูมเข้า",
    zoomOut: "ซูมออก",
    myLocation: "ตำแหน่งของฉัน",
    locating: "กำลังหาตำแหน่ง",
    locationDenied: "ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง",
    locationUnavailable: "หาตำแหน่งไม่ได้",
  },
  search: {
    label: "ค้นหาสถานที่หรือพิกัด",
    placeholder: "ค้นหาสถานที่ หรือพิกัด",
    submit: "ค้นหา",
    clear: "ล้างคำค้น",
    searching: "กำลังค้นหา…",
    noResults: "ไม่พบสถานที่นี้",
    failed: "ค้นหาไม่สำเร็จ ลองใหม่อีกครั้ง",
    results: "ผลการค้นหา",
  },
  panel: {
    title: "ชั้นข้อมูล",
    open: "เปิดแผงชั้นข้อมูล",
    collapse: "ย่อแผงชั้นข้อมูล",
    expand: "ขยายแผงชั้นข้อมูล",
    close: "ปิด",
    dragHandle: "ลากเพื่อปรับความสูง",
    groups: {
      zoning: "ผังเมือง",
      hazard: "ภัยพิบัติ",
      infrastructure: "โครงสร้างพื้นฐาน",
      boundary: "ขอบเขตการปกครอง",
    },
    badges: {
      sample: "ข้อมูลตัวอย่าง",
      draft: "ร่าง ยังไม่บังคับใช้",
    },
    opacity: "ความโปร่งใส",
    legend: "คำอธิบายสัญลักษณ์",
    source: "ที่มา",
    dataDate: "ข้อมูล ณ",
    loading: "กำลังโหลด…",
    loadFailed: "โหลดไม่สำเร็จ",
    retry: "ลองใหม่",
    tapOnly: "ชั้นนี้ไม่แสดงบนแผนที่ แตะที่แผนที่เพื่อดูข้อมูลของจุดนั้น",
    exclusive: "เปิดได้ทีละชั้นกับ",
  },
  layers: {
    "bkk-zoning-current": {
      name: "ผังเมืองรวม กทม. ที่บังคับใช้",
      summary: "ที่ดินแต่ละแปลงใช้ทำอะไรได้บ้างตามผังเมืองปัจจุบัน",
    },
    "bkk-zoning-draft4": {
      name: "ร่างผังเมืองรวม กทม. ปรับปรุงครั้งที่ 4",
      summary: "ร่างผังใหม่ที่อาจเปลี่ยนการใช้ที่ดินในอนาคต",
    },
    "bkk-planned-roads": {
      name: "โครงการถนนตามผังเมือง",
      summary: "แนวถนนที่ผังเมืองกำหนดให้สร้างหรือขยายในอนาคต",
    },
    "flood-recurrence": {
      name: "น้ำท่วมซ้ำซาก 2011–2023",
      summary: "พื้นที่ที่น้ำท่วมบ่อยจากภาพถ่ายดาวเทียม",
    },
    subsidence: {
      name: "แผ่นดินทรุด",
      summary: "อัตราการทรุดตัวของพื้นดินต่อปี",
    },
    "rail-transit": {
      name: "รถไฟฟ้าและสถานี",
      summary: "แนวรถไฟฟ้าและที่ตั้งสถานี",
    },
    "admin-boundary": {
      name: "ขอบเขตจังหวัดและเขต",
      summary: "เส้นแบ่งจังหวัด เขต และอำเภอ",
    },
  },
  legend: {
    residentialLow: "ที่อยู่อาศัยหนาแน่นน้อย (ย.1–ย.4)",
    residentialMedium: "ที่อยู่อาศัยหนาแน่นปานกลาง (ย.5–ย.7)",
    residentialHigh: "ที่อยู่อาศัยหนาแน่นมาก (ย.8–ย.10)",
    commercial: "พาณิชยกรรม (พ.)",
    industrial: "อุตสาหกรรม (อ.)",
    agriculture: "อนุรักษ์ชนบทและเกษตรกรรม (ก.)",
    institutional: "สถาบันราชการ (ส.)",
    plannedRoad: "แนวถนนโครงการ",
    floodRecurrence: "ตอบเมื่อแตะจุด",
    subsidenceLt10: "ทรุดน้อยกว่า 10 มม./ปี",
    subsidence10to20: "ทรุด 10–20 มม./ปี",
    subsidence20to30: "ทรุด 20–30 มม./ปี",
    subsidenceGt30: "ทรุดมากกว่า 30 มม./ปี",
    railLine: "แนวรถไฟฟ้า",
    railStation: "สถานี",
    adminBoundary: "เส้นแบ่งเขตการปกครอง",
  },
} as const;

export type Messages = typeof th;

type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

/** A dotted path to any string in `th`, e.g. "panel.title". */
export type MessageKey = Leaves<Messages>;

export function t(key: MessageKey): string {
  let node: unknown = th;
  for (const part of key.split(".")) {
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : key;
}

export function hasMessage(key: string): boolean {
  let node: unknown = th;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null || !(part in node)) return false;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string";
}

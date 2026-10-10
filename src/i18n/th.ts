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
} as const;

export type Messages = typeof th;

// All on-screen Thai text lives here.
export const th = {
  app: {
    title: "แผนที่ตรวจที่ดิน กรุงเทพฯ และปริมณฑล",
    description: "เปิดดูผังเมืองและข้อมูลภัยพิบัติ แล้วแตะจุดเพื่ออ่านคำอธิบาย",
    mapPlaceholder: "แผนที่",
  },
} as const;

export type Messages = typeof th;

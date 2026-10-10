import type { Metadata, Viewport } from "next";
import { th } from "@/i18n/th";
import "./globals.css";

export const metadata: Metadata = {
  title: th.app.title,
  description: th.app.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}

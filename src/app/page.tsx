import { th } from "@/i18n/th";

// Placeholder for the full-screen map (M1).
export default function Home() {
  return (
    <main
      aria-label={th.app.mapPlaceholder}
      data-testid="map-root"
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100dvh", background: "#e5e7eb" }}
    />
  );
}

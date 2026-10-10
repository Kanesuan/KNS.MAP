"use client";

import dynamic from "next/dynamic";
import { SearchBox } from "@/components/search/SearchBox";

// MapLibre needs the browser (WebGL, window), so the map renders on the client only.
const MapView = dynamic(() => import("@/components/map/MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => <div className="fixed inset-0 h-dvh w-screen bg-neutral-200" />,
});

export function MapApp() {
  return (
    <main className="fixed inset-0 h-dvh w-screen overflow-hidden">
      <MapView />
      <SearchBox />
    </main>
  );
}

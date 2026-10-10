"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { LayerPanel } from "@/components/layers/LayerPanel";
import { SearchBox } from "@/components/search/SearchBox";
import { useLayerStore } from "@/store/layer-store";

// MapLibre needs the browser (WebGL, window), so the map renders on the client only.
const MapView = dynamic(() => import("@/components/map/MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => <div className="fixed inset-0 h-dvh w-screen bg-neutral-200" />,
});

export function MapApp() {
  const initFromUrl = useLayerStore((s) => s.initFromUrl);
  useEffect(() => {
    initFromUrl(window.location.search);
  }, [initFromUrl]);

  return (
    <main className="fixed inset-0 h-dvh w-screen overflow-hidden">
      <MapView />
      <SearchBox />
      <LayerPanel />
    </main>
  );
}

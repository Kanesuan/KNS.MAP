"use client";

import { useState } from "react";
import { t } from "@/i18n/th";
import { LAYERS } from "@/layers/registry";

// Credit every live data source, as their licences require. Rendered by React
// (not MapLibre) so it is on screen before the map finishes loading.
const SOURCES = [
  ...new Set([
    ...LAYERS.filter((l) => l.status === "live").map((l) => l.attribution.org),
    "© OpenStreetMap contributors",
    "OpenFreeMap",
  ]),
];

export function Attribution() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed right-3 bottom-1 z-50">
      {open && (
        // Opens upwards, clear of the buttons along the bottom edge.
        <p
          id="map-attribution"
          className="absolute right-0 bottom-full mb-8 w-[min(320px,calc(100vw-24px))] rounded-lg bg-white/95 px-3 py-2 text-xs leading-relaxed text-neutral-700 shadow"
        >
          {SOURCES.join(" · ")}
        </p>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="map-attribution"
        aria-label={t("app.attribution")}
        className="flex h-11 min-w-11 items-center justify-center text-xs text-neutral-600 focus-visible:outline-2 focus-visible:outline-blue-600"
      >
        <span
          aria-hidden
          className="flex size-5 items-center justify-center rounded-full bg-white/85 font-semibold shadow-sm"
        >
          i
        </span>
      </button>
    </div>
  );
}

"use client";

import type { Map as MaplibreMap } from "maplibre-gl";
import { useState, type ReactNode } from "react";
import { th } from "@/i18n/th";
import { useMapStore } from "@/store/map-store";

type LocateState = "idle" | "locating" | "denied" | "unavailable";

function ControlButton(props: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={props.label}
      title={props.label}
      onClick={props.onClick}
      disabled={props.disabled}
      className="flex size-11 items-center justify-center text-neutral-800 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
    >
      {props.children}
    </button>
  );
}

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  "aria-hidden": true,
};

export function MapControls({ map }: { map: MaplibreMap }) {
  const flyTo = useMapStore((s) => s.flyTo);
  const [locate, setLocate] = useState<LocateState>("idle");

  const findMe = () => {
    if (!("geolocation" in navigator)) {
      setLocate("unavailable");
      return;
    }
    setLocate("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocate("idle");
        flyTo({ lat: pos.coords.latitude, lng: pos.coords.longitude, zoom: 16, marker: true });
      },
      (err) => setLocate(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable"),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const message =
    locate === "denied"
      ? th.controls.locationDenied
      : locate === "unavailable"
        ? th.controls.locationUnavailable
        : null;

  return (
    <div className="fixed right-3 bottom-8 z-10 flex flex-col items-end gap-2">
      {message && (
        <p role="status" className="max-w-56 rounded-lg bg-white px-3 py-2 text-base shadow">
          {message}
        </p>
      )}
      <div className="flex flex-col divide-y divide-neutral-200 overflow-hidden rounded-xl bg-white shadow-md">
        <ControlButton label={th.controls.zoomIn} onClick={() => map.zoomIn()}>
          <svg {...iconProps}>
            <path d="M12 5v14M5 12h14" />
          </svg>
        </ControlButton>
        <ControlButton label={th.controls.zoomOut} onClick={() => map.zoomOut()}>
          <svg {...iconProps}>
            <path d="M5 12h14" />
          </svg>
        </ControlButton>
      </div>
      <div className="overflow-hidden rounded-xl bg-white shadow-md">
        <ControlButton
          label={locate === "locating" ? th.controls.locating : th.controls.myLocation}
          onClick={findMe}
          disabled={locate === "locating"}
        >
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </ControlButton>
      </div>
    </div>
  );
}

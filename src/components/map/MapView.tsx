"use client";

import { getVersion, Map as MaplibreMap, Marker, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { th } from "@/i18n/th";
import { basemapStyleUrl, loadBasemapStyle } from "@/lib/basemap";
import { MAX_BOUNDS, MAX_ZOOM, MIN_ZOOM, REGION_BOUNDS } from "@/lib/region";
import { parseViewState, serializeViewState } from "@/lib/url-state";
import { useMapStore } from "@/store/map-store";
import { MapControls } from "./MapControls";

setWorkerUrl(`/vendor/maplibre/maplibre-gl-worker.mjs?v=${getVersion()}`);

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MaplibreMap | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const flyTarget = useMapStore((s) => s.flyTarget);
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let instance: MaplibreMap | null = null;

    loadBasemapStyle(basemapStyleUrl(), window.location.origin)
      .then((style) => {
        if (cancelled) return;
        const initial = parseViewState(window.location.search);
        const m = new MaplibreMap({
          container,
          style,
          ...(initial
            ? { center: [initial.lng, initial.lat], zoom: initial.zoom }
            : { bounds: REGION_BOUNDS, fitBoundsOptions: { padding: 16 } }),
          minZoom: MIN_ZOOM,
          maxZoom: MAX_ZOOM,
          maxBounds: MAX_BOUNDS,
          attributionControl: { compact: true },
          dragRotate: false,
          pitchWithRotate: false,
        });
        instance = m;
        m.touchZoomRotate.disableRotation();
        m.keyboard.disableRotation();

        const syncUrl = () => {
          const c = m.getCenter();
          const next = serializeViewState(
            { lat: c.lat, lng: c.lng, zoom: m.getZoom() },
            window.location.search,
          );
          window.history.replaceState(window.history.state, "", next + window.location.hash);
        };
        m.on("moveend", syncUrl);
        m.once("load", () => {
          syncUrl();
          container.dataset.loaded = "true";
        });
        setMap(m);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      instance?.remove();
      setMap(null);
    };
  }, [attempt]);

  useEffect(() => {
    if (!map || !flyTarget) return;
    map.flyTo({
      center: [flyTarget.lng, flyTarget.lat],
      zoom: flyTarget.zoom ?? Math.max(map.getZoom(), 15),
      essential: true,
    });
    markerRef.current?.remove();
    markerRef.current = flyTarget.marker
      ? new Marker({ color: "#2563eb" }).setLngLat([flyTarget.lng, flyTarget.lat]).addTo(map)
      : null;
  }, [map, flyTarget]);

  const retry = useCallback(() => {
    setFailed(false);
    setAttempt((n) => n + 1);
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        data-testid="map-root"
        role="region"
        aria-label={th.app.map}
        className="fixed inset-0 h-dvh w-screen bg-neutral-200"
      />
      {map && <MapControls map={map} />}
      {failed && (
        <div
          role="alert"
          className="fixed inset-x-4 top-1/2 mx-auto max-w-sm -translate-y-1/2 rounded-xl bg-white p-4 text-center shadow-lg"
        >
          <p className="mb-3">{th.app.mapLoadFailed}</p>
          <button
            type="button"
            onClick={retry}
            className="min-h-11 rounded-lg bg-neutral-900 px-4 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {th.app.retry}
          </button>
        </div>
      )}
    </>
  );
}

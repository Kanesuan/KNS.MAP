"use client";

import { getVersion, Map as MaplibreMap, Marker, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { th } from "@/i18n/th";
import { basemapStyleUrl, loadBasemapStyle } from "@/lib/basemap";
import { LAYERS } from "@/layers/registry";
import { MAX_BOUNDS, MAX_ZOOM, MIN_ZOOM, REGION_BOUNDS } from "@/lib/region";
import { replaceSearch } from "@/lib/url";
import { parseViewState, serializeViewState } from "@/lib/url-state";
import { useInspectStore } from "@/store/inspect-store";
import { useLayerStore } from "@/store/layer-store";
import { useMapStore } from "@/store/map-store";
import { MapControls } from "./MapControls";
import { MapLayers } from "./MapLayers";

// Credit every live data source on the map, as their licences require.
const ATTRIBUTION = [
  ...new Set(LAYERS.filter((l) => l.status === "live").map((l) => l.attribution.org)),
];

setWorkerUrl(`/vendor/maplibre/maplibre-gl-worker.mjs?v=${getVersion()}`);

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MaplibreMap | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const flyTarget = useMapStore((s) => s.flyTarget);
  const markerRef = useRef<Marker | null>(null);
  const [styleLoaded, setStyleLoaded] = useState(false);
  const inspectPoint = useInspectStore((s) => s.point);
  const pinRef = useRef<Marker | null>(null);
  const layersReady = useLayerStore((s) => s.initialized);

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
          attributionControl: { compact: true, customAttribution: ATTRIBUTION },
          dragRotate: false,
          pitchWithRotate: false,
        });
        instance = m;
        m.touchZoomRotate.disableRotation();
        m.keyboard.disableRotation();

        const syncUrl = () => {
          const c = m.getCenter();
          replaceSearch((search) =>
            serializeViewState({ lat: c.lat, lng: c.lng, zoom: m.getZoom() }, search),
          );
        };
        m.on("moveend", syncUrl);
        m.on("click", (e) => {
          useInspectStore.getState().inspect({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        });
        m.once("load", () => {
          syncUrl();
          setStyleLoaded(true);
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
      setStyleLoaded(false);
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

  useEffect(() => {
    pinRef.current?.remove();
    pinRef.current =
      map && inspectPoint
        ? new Marker({ color: "#dc2626" })
            .setLngLat([inspectPoint.lng, inspectPoint.lat])
            .addTo(map)
        : null;
  }, [map, inspectPoint]);

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
      {map && styleLoaded && layersReady && <MapLayers map={map} />}
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

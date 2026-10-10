"use client";

import type { GeoJSONSource, Map as MaplibreMap } from "maplibre-gl";
import { useEffect, useRef } from "react";
import { LAYERS } from "@/layers/registry";
import { serializeVisibleLayers } from "@/lib/layer-url";
import { applyOpacity, applyVisibility, ensureLayerAdded } from "@/lib/map-layers";
import { replaceSearch } from "@/lib/url";
import { useLayerStore } from "@/store/layer-store";

/** Keeps the map's overlay layers in step with the layer store. Renders nothing. */
export function MapLayers({ map }: { map: MaplibreMap }) {
  const visible = useLayerStore((s) => s.visible);
  const opacity = useLayerStore((s) => s.opacity);
  const reloadToken = useLayerStore((s) => s.reloadToken);
  const setLoad = useLayerStore((s) => s.setLoad);
  const ours = useRef(new Set<string>());
  const fetched = useRef(new Map<string, number>());

  useEffect(() => {
    replaceSearch((search) => serializeVisibleLayers(visible, search));

    for (const config of LAYERS) {
      const on = visible.includes(config.id);
      if (on) ensureLayerAdded(map, config, ours.current);
      applyVisibility(map, config, on);

      const src = config.source;
      const token = reloadToken[config.id] ?? 0;
      if (!on || src.kind !== "geojson" || fetched.current.get(config.id) === token) continue;
      fetched.current.set(config.id, token);
      setLoad(config.id, "loading");
      fetch(src.url)
        .then((res) => {
          if (!res.ok) throw new Error(String(res.status));
          return res.json() as Promise<Parameters<GeoJSONSource["setData"]>[0]>;
        })
        .then((data) => {
          (map.getSource(config.id) as GeoJSONSource | undefined)?.setData(data);
          setLoad(config.id, "ready");
        })
        .catch(() => {
          setLoad(config.id, "error");
        });
    }
  }, [map, visible, reloadToken, setLoad]);

  useEffect(() => {
    for (const config of LAYERS) {
      const value = opacity[config.id];
      if (value !== undefined) applyOpacity(map, config, value);
    }
  }, [map, opacity, visible]);

  return null;
}

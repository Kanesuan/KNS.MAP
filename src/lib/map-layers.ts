import type { LayerSpecification, Map as MaplibreMap } from "maplibre-gl";
import type { LayerConfig } from "@/layers/types";

type PaintProp = Parameters<MaplibreMap["setPaintProperty"]>[1];

const OPACITY_PROPS: Partial<Record<LayerSpecification["type"], PaintProp[]>> = {
  fill: ["fill-opacity"],
  line: ["line-opacity"],
  circle: ["circle-opacity", "circle-stroke-opacity"],
  symbol: ["text-opacity", "icon-opacity"],
  "fill-extrusion": ["fill-extrusion-opacity"],
  raster: ["raster-opacity"],
  heatmap: ["heatmap-opacity"],
};

/** The paint opacity values to set on one style layer for a layer opacity of `value`. */
export function opacityPaint(spec: LayerSpecification, value: number): [PaintProp, number][] {
  const paint = ("paint" in spec ? spec.paint : undefined) as Record<string, unknown> | undefined;
  return (OPACITY_PROPS[spec.type] ?? []).map((prop) => {
    const base = paint?.[prop];
    return [prop, (typeof base === "number" ? base : 1) * value];
  });
}

/** First basemap symbol layer, so overlays sit under the basemap labels. */
function firstBasemapSymbol(map: MaplibreMap, ours: Set<string>): string | undefined {
  return map.getStyle().layers.find((l) => l.type === "symbol" && !ours.has(l.id))?.id;
}

export function ensureLayerAdded(
  map: MaplibreMap,
  config: LayerConfig,
  ours: Set<string>,
): boolean {
  if (config.source.kind !== "geojson") return false;
  if (map.getSource(config.id)) return false;
  map.addSource(config.id, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  for (const spec of config.style) {
    ours.add(spec.id);
    map.addLayer(spec, spec.type === "symbol" ? undefined : firstBasemapSymbol(map, ours));
  }
  return true;
}

export function applyVisibility(map: MaplibreMap, config: LayerConfig, visible: boolean): void {
  for (const spec of config.style) {
    if (map.getLayer(spec.id))
      map.setLayoutProperty(spec.id, "visibility", visible ? "visible" : "none");
  }
}

export function applyOpacity(map: MaplibreMap, config: LayerConfig, value: number): void {
  for (const spec of config.style) {
    if (!map.getLayer(spec.id)) continue;
    for (const [prop, v] of opacityPaint(spec, value)) {
      map.setPaintProperty(spec.id, prop, v);
    }
  }
}

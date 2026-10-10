import type { LayerConfig } from "@/layers/types";
import type { LatLng } from "./coords";
import { queryPoint, type FeatureCollection } from "./geo";

export type CardResult =
  | { status: "loading" }
  | { status: "answer"; text: string }
  | { status: "empty" }
  | { status: "error" }
  | { status: "not_ready" };

/** Layers that get a card when a point is tapped. */
export function inspectableLayers(layers: readonly LayerConfig[]): LayerConfig[] {
  return layers.filter((l) => l.inspect || l.source.kind === "api");
}

/** Visible layers first, then the registry order. */
export function orderForCards(
  layers: readonly LayerConfig[],
  visible: readonly string[],
): LayerConfig[] {
  const on = layers.filter((l) => visible.includes(l.id));
  const off = layers.filter((l) => !visible.includes(l.id));
  return [...on, ...off];
}

const dataCache = new Map<string, Promise<FeatureCollection>>();

function loadGeoJson(url: string): Promise<FeatureCollection> {
  let p = dataCache.get(url);
  if (!p) {
    p = fetch(url).then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res.json() as Promise<FeatureCollection>;
    });
    p.catch(() => dataCache.delete(url));
    dataCache.set(url, p);
  }
  return p;
}

type ApiBody =
  { ok: true; properties: Record<string, unknown> | null } | { ok: false; error: string };

export async function inspectLayer(layer: LayerConfig, point: LatLng): Promise<CardResult> {
  const src = layer.source;
  const inspect = layer.inspect;
  try {
    if (src.kind === "api") {
      const qs = new URLSearchParams({
        layer: layer.id,
        lat: String(point.lat),
        lng: String(point.lng),
      });
      const res = await fetch(`${src.endpoint}?${qs}`);
      const body = (await res.json()) as ApiBody;
      if (!body.ok)
        return {
          status:
            body.error === "not_ready" || body.error === "not_configured" ? "not_ready" : "error",
        };
      if (!inspect) return { status: "not_ready" };
      const text = body.properties ? inspect.describe(body.properties, { distanceM: 0 }) : null;
      return text ? { status: "answer", text } : { status: "empty" };
    }
    if (!inspect || src.kind !== "geojson") return { status: "not_ready" };
    const data = await loadGeoJson(src.url);
    const filtered = inspect.filter
      ? { ...data, features: data.features.filter((f) => inspect.filter?.(f.properties ?? {})) }
      : data;
    const hit = queryPoint(filtered, [point.lng, point.lat], inspect.mode, inspect.maxDistanceM);
    const text = hit ? inspect.describe(hit.properties, { distanceM: hit.distanceM }) : null;
    return text ? { status: "answer", text } : { status: "empty" };
  } catch {
    return { status: "error" };
  }
}

import type { LayerConfig } from "@/layers/types";

const PARAM = "l";

/**
 * Reads the visible layers from `?l=a,b`. A missing param means "use the
 * defaults"; an empty one means "nothing on". Unknown ids are dropped and only
 * the first layer of each exclusive group is kept.
 */
export function parseVisibleLayers(search: string, layers: readonly LayerConfig[]): string[] {
  const params = new URLSearchParams(search);
  const raw = params.get(PARAM);
  const ids =
    raw === null
      ? layers.filter((l) => l.defaultVisible).map((l) => l.id)
      : raw.split(",").map((s) => s.trim());
  return enforceExclusive(ids, layers);
}

export function enforceExclusive(ids: readonly string[], layers: readonly LayerConfig[]): string[] {
  const byId = new Map(layers.map((l) => [l.id, l]));
  const seenGroups = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    const layer = byId.get(id);
    if (!layer || out.includes(id)) continue;
    if (layer.exclusiveGroup) {
      if (seenGroups.has(layer.exclusiveGroup)) continue;
      seenGroups.add(layer.exclusiveGroup);
    }
    out.push(id);
  }
  return out;
}

/** Writes the visible layers into `search`, keeping any other params. */
export function serializeVisibleLayers(ids: readonly string[], search = ""): string {
  const params = new URLSearchParams(search);
  params.set(PARAM, ids.join(","));
  return `?${params.toString().replace(/%2C/g, ",")}`;
}

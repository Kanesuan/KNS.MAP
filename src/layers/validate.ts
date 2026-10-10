import { hasMessage } from "@/i18n/th";
import { LAYER_GROUPS, type LayerConfig } from "./types";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Returns human-readable problems with the registry. Empty means valid. */
export function validateRegistry(layers: readonly LayerConfig[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const layer of layers) {
    const at = `layer "${layer.id}"`;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(layer.id)) errors.push(`${at}: id must be kebab-case`);
    if (ids.has(layer.id)) errors.push(`${at}: duplicate id`);
    ids.add(layer.id);

    if (!LAYER_GROUPS.includes(layer.group)) errors.push(`${at}: unknown group "${layer.group}"`);
    for (const key of [layer.name, layer.summary, ...layer.legend.map((l) => l.label)]) {
      if (!hasMessage(key)) errors.push(`${at}: missing i18n key "${key}"`);
    }
    if (layer.defaultOpacity < 0 || layer.defaultOpacity > 1) {
      errors.push(`${at}: defaultOpacity must be between 0 and 1`);
    }

    const a = layer.attribution;
    if (!a.org.trim()) errors.push(`${at}: attribution.org is empty`);
    if (!a.license.trim()) errors.push(`${at}: attribution.license is empty`);
    if (!DATE.test(a.dataDate) || Number.isNaN(Date.parse(a.dataDate))) {
      errors.push(`${at}: attribution.dataDate must be YYYY-MM-DD`);
    }
    if (layer.status === "live" && a.commercialUse !== "yes") {
      errors.push(`${at}: status is "live" but commercialUse is "${a.commercialUse}", not "yes"`);
    }

    const src = layer.source;
    if (src.kind === "api") {
      if (layer.style.length > 0) errors.push(`${at}: "api" layers must have an empty style`);
    } else {
      if (layer.style.length === 0) errors.push(`${at}: style is empty`);
      for (const s of layer.style) {
        if (!("source" in s) || s.source !== layer.id) {
          errors.push(`${at}: style layer "${s.id}" must use source "${layer.id}"`);
        }
      }
      const isSampleFile = src.url.endsWith(".sample.geojson");
      if (layer.status === "sample" && src.kind === "geojson" && !isSampleFile) {
        errors.push(`${at}: sample data must be a .sample.geojson file`);
      }
      if (layer.status === "live" && isSampleFile) {
        errors.push(`${at}: a live layer cannot use a .sample.geojson file`);
      }
    }
    if (layer.coverage.length === 0) errors.push(`${at}: coverage is empty`);
  }

  const styleIds = layers.flatMap((l) => l.style.map((s) => s.id));
  const dupStyle = styleIds.filter((id, i) => styleIds.indexOf(id) !== i);
  for (const id of new Set(dupStyle)) errors.push(`style layer id "${id}" is used twice`);

  const groups = new Map<string, LayerConfig[]>();
  for (const l of layers) {
    if (l.exclusiveGroup)
      groups.set(l.exclusiveGroup, [...(groups.get(l.exclusiveGroup) ?? []), l]);
  }
  for (const [group, members] of groups) {
    if (members.filter((m) => m.defaultVisible).length > 1) {
      errors.push(`exclusive group "${group}" has more than one layer visible by default`);
    }
  }
  return errors;
}

import type { LayerSpecification } from "maplibre-gl";
import type { MessageKey } from "@/i18n/th";

export type LayerGroup = "zoning" | "hazard" | "infrastructure" | "boundary";

export const LAYER_GROUPS: readonly LayerGroup[] = [
  "zoning",
  "hazard",
  "infrastructure",
  "boundary",
];

export type LayerSource =
  | { kind: "pmtiles"; url: string; sourceLayer: string }
  | { kind: "geojson"; url: string }
  | { kind: "api"; endpoint: string }; // answers point queries only, never drawn

export type LayerConfig = {
  id: string;
  group: LayerGroup;
  name: MessageKey;
  summary: MessageKey;
  source: LayerSource;
  /** MapLibre layers drawn for this layer. Each `source` must equal `id`. Empty for "api". */
  style: LayerSpecification[];
  legend: { color: string; label: MessageKey; shape?: "fill" | "line" | "point" }[];
  defaultVisible: boolean;
  defaultOpacity: number; // 0 to 1
  /** Layers sharing a value can only be on one at a time. */
  exclusiveGroup?: string;
  /** The "sample" badge comes from `status`; this is for extra labels. */
  badge?: "draft";
  inspect?: {
    describe: (props: Record<string, unknown>) => string | null;
  };
  attribution: {
    org: string;
    url: string;
    license: string;
    dataDate: string; // YYYY-MM-DD
    commercialUse: "yes" | "no" | "unverified";
  };
  status: "live" | "sample";
  coverage: string[]; // province codes, "10" is Bangkok
};

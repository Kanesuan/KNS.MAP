import type { ExpressionSpecification } from "maplibre-gl";
import type { LayerConfig } from "./types";

// Standard land-use colours of the Bangkok comprehensive plan.
const ZONING_COLORS = {
  residential_low: "#f7e36b",
  residential_medium: "#f4a340",
  residential_high: "#a0522d",
  commercial: "#e03c31",
  industrial: "#8e44ad",
  agriculture: "#6dbe45",
  institutional: "#2e6fd8",
} as const;

const zoningFill: ExpressionSpecification = [
  "match",
  ["get", "category"],
  ...Object.entries(ZONING_COLORS).flat(),
  "#cccccc",
] as unknown as ExpressionSpecification;

const zoningLegend: LayerConfig["legend"] = [
  { color: ZONING_COLORS.residential_low, label: "legend.residentialLow" },
  { color: ZONING_COLORS.residential_medium, label: "legend.residentialMedium" },
  { color: ZONING_COLORS.residential_high, label: "legend.residentialHigh" },
  { color: ZONING_COLORS.commercial, label: "legend.commercial" },
  { color: ZONING_COLORS.industrial, label: "legend.industrial" },
  { color: ZONING_COLORS.agriculture, label: "legend.agriculture" },
  { color: ZONING_COLORS.institutional, label: "legend.institutional" },
];

const zoningStyle = (id: string): LayerConfig["style"] => [
  {
    id: `${id}-fill`,
    type: "fill",
    source: id,
    paint: { "fill-color": zoningFill, "fill-opacity": 1 },
  },
  {
    id: `${id}-outline`,
    type: "line",
    source: id,
    paint: { "line-color": "#ffffff", "line-width": 0.8, "line-opacity": 0.8 },
  },
];

const BMA_ZONING = {
  org: "สำนักการวางผังและพัฒนาเมือง กรุงเทพมหานคร",
  url: "https://cpd.bangkok.go.th",
  license: "ยังไม่ได้รับอนุญาต ใช้ข้อมูลสมมติแทน",
  dataDate: "2026-10-10",
  commercialUse: "unverified",
} as const;

// Viridis steps: ordered by lightness, so they stay distinguishable with colour blindness.
const SUBSIDENCE_COLORS = {
  lt10: "#fde725",
  "10to20": "#5ec962",
  "20to30": "#21918c",
  gt30: "#3b528b",
} as const;

export const LAYERS: LayerConfig[] = [
  {
    id: "bkk-zoning-current",
    group: "zoning",
    name: "layers.bkk-zoning-current.name",
    summary: "layers.bkk-zoning-current.summary",
    source: { kind: "geojson", url: "/data/bkk-zoning-current.sample.geojson" },
    style: zoningStyle("bkk-zoning-current"),
    legend: zoningLegend,
    defaultVisible: true,
    defaultOpacity: 0.6,
    exclusiveGroup: "bkk-zoning",
    attribution: BMA_ZONING,
    status: "sample",
    coverage: ["10"],
  },
  {
    id: "bkk-zoning-draft4",
    group: "zoning",
    name: "layers.bkk-zoning-draft4.name",
    summary: "layers.bkk-zoning-draft4.summary",
    source: { kind: "geojson", url: "/data/bkk-zoning-draft4.sample.geojson" },
    style: zoningStyle("bkk-zoning-draft4"),
    legend: zoningLegend,
    defaultVisible: false,
    defaultOpacity: 0.6,
    exclusiveGroup: "bkk-zoning",
    badge: "draft",
    attribution: BMA_ZONING,
    status: "sample",
    coverage: ["10"],
  },
  {
    id: "flood-recurrence",
    group: "hazard",
    name: "layers.flood-recurrence.name",
    summary: "layers.flood-recurrence.summary",
    source: { kind: "api", endpoint: "/api/inspect" },
    style: [],
    legend: [],
    defaultVisible: false,
    defaultOpacity: 1,
    attribution: {
      org: "สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ (GISTDA)",
      url: "https://api-gateway.gistda.or.th",
      license: "Open Data Common",
      dataDate: "2023-12-31",
      commercialUse: "unverified",
    },
    status: "sample",
    coverage: ["10", "12", "13", "11", "73", "74"],
  },
  {
    id: "subsidence",
    group: "hazard",
    name: "layers.subsidence.name",
    summary: "layers.subsidence.summary",
    source: { kind: "geojson", url: "/data/subsidence.sample.geojson" },
    style: [
      {
        id: "subsidence-fill",
        type: "fill",
        source: "subsidence",
        paint: {
          "fill-color": [
            "match",
            ["get", "rateClass"],
            ...Object.entries(SUBSIDENCE_COLORS).flat(),
            "#cccccc",
          ] as unknown as ExpressionSpecification,
          "fill-opacity": 1,
        },
      },
    ],
    legend: [
      { color: SUBSIDENCE_COLORS.lt10, label: "legend.subsidenceLt10" },
      { color: SUBSIDENCE_COLORS["10to20"], label: "legend.subsidence10to20" },
      { color: SUBSIDENCE_COLORS["20to30"], label: "legend.subsidence20to30" },
      { color: SUBSIDENCE_COLORS.gt30, label: "legend.subsidenceGt30" },
    ],
    defaultVisible: false,
    defaultOpacity: 0.55,
    attribution: {
      org: "ยังไม่มีแหล่งข้อมูลที่ยืนยันได้",
      url: "",
      license: "ข้อมูลสมมติ",
      dataDate: "2026-10-10",
      commercialUse: "unverified",
    },
    status: "sample",
    coverage: ["10"],
  },
  {
    id: "bkk-planned-roads",
    group: "infrastructure",
    name: "layers.bkk-planned-roads.name",
    summary: "layers.bkk-planned-roads.summary",
    source: { kind: "geojson", url: "/data/bkk-planned-roads.sample.geojson" },
    style: [
      {
        id: "bkk-planned-roads-line",
        type: "line",
        source: "bkk-planned-roads",
        layout: { "line-cap": "round" },
        paint: {
          "line-color": "#d6336c",
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 16, 8],
          "line-dasharray": [2, 1],
          "line-opacity": 1,
        },
      },
    ],
    legend: [{ color: "#d6336c", label: "legend.plannedRoad", shape: "line" }],
    defaultVisible: false,
    defaultOpacity: 0.9,
    attribution: BMA_ZONING,
    status: "sample",
    coverage: ["10"],
  },
  {
    id: "rail-transit",
    group: "infrastructure",
    name: "layers.rail-transit.name",
    summary: "layers.rail-transit.summary",
    source: { kind: "geojson", url: "/data/rail-transit.sample.geojson" },
    style: [
      {
        id: "rail-transit-line",
        type: "line",
        source: "rail-transit",
        filter: ["==", ["get", "kind"], "line"],
        paint: { "line-color": "#1f2937", "line-width": 3, "line-opacity": 1 },
      },
      {
        id: "rail-transit-station",
        type: "circle",
        source: "rail-transit",
        filter: ["==", ["get", "kind"], "station"],
        paint: {
          "circle-radius": 5,
          "circle-color": "#ffffff",
          "circle-stroke-color": "#1f2937",
          "circle-stroke-width": 2,
          "circle-opacity": 1,
          "circle-stroke-opacity": 1,
        },
      },
      {
        id: "rail-transit-label",
        type: "symbol",
        source: "rail-transit",
        minzoom: 12,
        filter: ["==", ["get", "kind"], "station"],
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 13,
          "text-offset": [0, 1],
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#1f2937",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
          "text-opacity": 1,
        },
      },
    ],
    legend: [
      { color: "#1f2937", label: "legend.railLine", shape: "line" },
      { color: "#1f2937", label: "legend.railStation", shape: "point" },
    ],
    defaultVisible: false,
    defaultOpacity: 1,
    attribution: {
      org: "OpenStreetMap contributors",
      url: "https://www.openstreetmap.org/copyright",
      license: "ODbL 1.0",
      dataDate: "2026-10-10",
      commercialUse: "yes",
    },
    status: "sample",
    coverage: ["10"],
  },
  {
    id: "admin-boundary",
    group: "boundary",
    name: "layers.admin-boundary.name",
    summary: "layers.admin-boundary.summary",
    source: { kind: "geojson", url: "/data/admin-boundary.sample.geojson" },
    style: [
      {
        id: "admin-boundary-line",
        type: "line",
        source: "admin-boundary",
        paint: {
          "line-color": "#4b5563",
          "line-width": 1.5,
          "line-dasharray": [3, 2],
          "line-opacity": 1,
        },
      },
    ],
    legend: [{ color: "#4b5563", label: "legend.adminBoundary", shape: "line" }],
    defaultVisible: false,
    defaultOpacity: 1,
    attribution: {
      org: "OCHA COD-AB บน HDX (ยังไม่ได้เลือกชุดข้อมูล)",
      url: "https://data.humdata.org",
      license: "รอบันทึกสัญญาอนุญาตของชุดที่เลือก",
      dataDate: "2026-10-10",
      commercialUse: "unverified",
    },
    status: "sample",
    coverage: ["10"],
  },
];

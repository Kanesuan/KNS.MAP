// Small geometry helpers for point queries on sample-sized GeoJSON.
// Coordinates are [lng, lat]; distances use an equirectangular projection,
// which is accurate to well under 1% at Bangkok's scale.

export type Position = [number, number];
type Ring = Position[];

export type Geometry =
  | { type: "Point"; coordinates: Position }
  | { type: "MultiPoint"; coordinates: Position[] }
  | { type: "LineString"; coordinates: Position[] }
  | { type: "MultiLineString"; coordinates: Position[][] }
  | { type: "Polygon"; coordinates: Ring[] }
  | { type: "MultiPolygon"; coordinates: Ring[][] };

export type Feature = {
  type: "Feature";
  properties: Record<string, unknown> | null;
  geometry: Geometry | null;
};
export type FeatureCollection = { type: "FeatureCollection"; features: Feature[] };

const EARTH_RADIUS_M = 6_371_000;
const RAD = Math.PI / 180;

/** Projects to local metres around `origin`. */
function toMeters([lng, lat]: Position, origin: Position): [number, number] {
  const k = Math.cos(origin[1] * RAD);
  return [(lng - origin[0]) * RAD * EARTH_RADIUS_M * k, (lat - origin[1]) * RAD * EARTH_RADIUS_M];
}

function ringContains(ring: Ring, [x, y]: Position): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if (!a || !b) continue;
    if (a[1] > y !== b[1] > y && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) {
      inside = !inside;
    }
  }
  return inside;
}

function polygonContains(rings: Ring[], p: Position): boolean {
  const [outer, ...holes] = rings;
  return !!outer && ringContains(outer, p) && !holes.some((h) => ringContains(h, p));
}

function segmentDistance(p: Position, a: Position, b: Position): number {
  const [ax, ay] = toMeters(a, p);
  const [bx, by] = toMeters(b, p);
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2));
  return Math.hypot(ax + t * dx, ay + t * dy);
}

function lineDistance(p: Position, line: Position[]): number {
  if (line.length === 1 && line[0]) return Math.hypot(...toMeters(line[0], p));
  let best = Infinity;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1];
    const b = line[i];
    if (a && b) best = Math.min(best, segmentDistance(p, a, b));
  }
  return best;
}

/** Distance in metres from `p` to the geometry; 0 when a polygon contains it. */
export function distanceTo(p: Position, g: Geometry): number {
  switch (g.type) {
    case "Point":
      return Math.hypot(...toMeters(g.coordinates, p));
    case "MultiPoint":
      return Math.min(...g.coordinates.map((c) => Math.hypot(...toMeters(c, p))));
    case "LineString":
      return lineDistance(p, g.coordinates);
    case "MultiLineString":
      return Math.min(...g.coordinates.map((l) => lineDistance(p, l)));
    case "Polygon":
      return polygonContains(g.coordinates, p)
        ? 0
        : Math.min(...g.coordinates.map((r) => lineDistance(p, r)));
    case "MultiPolygon":
      return g.coordinates.some((poly) => polygonContains(poly, p))
        ? 0
        : Math.min(...g.coordinates.flat().map((r) => lineDistance(p, r)));
  }
}

export function contains(p: Position, g: Geometry): boolean {
  if (g.type === "Polygon") return polygonContains(g.coordinates, p);
  if (g.type === "MultiPolygon") return g.coordinates.some((poly) => polygonContains(poly, p));
  return false;
}

export type Hit = { properties: Record<string, unknown>; distanceM: number };

/** The polygon feature containing `p`, or the nearest feature within `maxDistanceM`. */
export function queryPoint(
  data: FeatureCollection,
  p: Position,
  mode: "contains" | "nearest",
  maxDistanceM = 0,
): Hit | null {
  let best: Hit | null = null;
  for (const f of data.features) {
    if (!f.geometry) continue;
    if (mode === "contains") {
      if (contains(p, f.geometry)) return { properties: f.properties ?? {}, distanceM: 0 };
      continue;
    }
    const d = distanceTo(p, f.geometry);
    if (d <= maxDistanceM && (!best || d < best.distanceM)) {
      best = { properties: f.properties ?? {}, distanceM: d };
    }
  }
  return best;
}

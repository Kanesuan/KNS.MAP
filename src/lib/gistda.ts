// Typed parser for the GISTDA flood-recurrence API (v1.1), written against
// responses recorded in tests/fixtures/gistda-flood-recurrence_*.json.
//
// A point inside a mapped area returns an array of
//   { subdistrict_name, district_name, province_name, total, detail: [{ year, freq }] }
// and a point outside returns { result: "not found" }.

export type FloodRecurrence = {
  subdistrict: string;
  district: string;
  province: string;
  /** Years (CE) in which the point flooded at least once. */
  floodYears: number[];
  firstYear: number;
  lastYear: number;
};

type Detail = { year: string; freq: number };
type Item = {
  subdistrict_name: string;
  district_name: string;
  province_name: string;
  total: number;
  detail: Detail[];
};

function isDetail(v: unknown): v is Detail {
  if (typeof v !== "object" || v === null) return false;
  const d = v as Record<string, unknown>;
  return typeof d.year === "string" && typeof d.freq === "number";
}

function isItem(v: unknown): v is Item {
  if (typeof v !== "object" || v === null) return false;
  const i = v as Record<string, unknown>;
  return (
    typeof i.subdistrict_name === "string" &&
    typeof i.district_name === "string" &&
    typeof i.province_name === "string" &&
    Array.isArray(i.detail) &&
    i.detail.every(isDetail)
  );
}

/** Returns null for "not found". Throws on a shape the parser does not know. */
export function parseFloodRecurrence(body: unknown): FloodRecurrence | null {
  if (typeof body === "object" && body !== null && !Array.isArray(body)) {
    if ((body as Record<string, unknown>).result === "not found") return null;
  }
  if (!Array.isArray(body)) throw new Error("unexpected GISTDA response");
  if (body.length === 0) return null;
  const item: unknown = body[0];
  if (!isItem(item)) throw new Error("unexpected GISTDA item");
  const years = item.detail.map((d) => Number(d.year)).filter(Number.isFinite);
  return {
    subdistrict: item.subdistrict_name,
    district: item.district_name,
    province: item.province_name,
    floodYears: item.detail
      .filter((d) => d.freq > 0)
      .map((d) => Number(d.year))
      .filter(Number.isFinite)
      .sort((a, b) => a - b),
    firstYear: Math.min(...years),
    lastYear: Math.max(...years),
  };
}

const ENDPOINT =
  "https://api-gateway.gistda.or.th/api/2.0/resources/gi-service/v1.1/disasters/flood-recurrence";

/** Server-side only: the key must never reach the browser. */
export async function fetchFloodRecurrence(
  lat: number,
  lng: number,
  apiKey: string,
  timeoutMs = 1500,
): Promise<FloodRecurrence | null> {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lng), api_key: apiKey });
  const res = await fetch(`${ENDPOINT}?${params}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
    // Flood history changes yearly at most.
    next: { revalidate: 60 * 60 * 24 * 30 },
  });
  if (!res.ok) throw new Error(`GISTDA HTTP ${res.status}`);
  return parseFloodRecurrence(await res.json());
}

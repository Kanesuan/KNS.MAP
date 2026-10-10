import type { LatLng } from "./coords";

export type GeocodeResult = LatLng & { label: string };

/** Place search. Swap the implementation without touching the UI. */
export interface Geocoder {
  search(query: string): Promise<GeocodeResult[]>;
}

type NominatimItem = { lat: string; lon: string; display_name: string };

function isNominatimItem(value: unknown): value is NominatimItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.lat === "string" && typeof v.lon === "string" && typeof v.display_name === "string"
  );
}

export function parseNominatimResponse(body: unknown): GeocodeResult[] {
  if (!Array.isArray(body)) return [];
  return body.filter(isNominatimItem).flatMap((item) => {
    const lat = Number(item.lat);
    const lng = Number(item.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
    return [{ lat, lng, label: item.display_name }];
  });
}

/**
 * Server-side Nominatim client. The public instance allows about one request
 * per second and no autocomplete, so the UI only searches on submit.
 */
export class NominatimGeocoder implements Geocoder {
  constructor(
    private readonly baseUrl = "https://nominatim.openstreetmap.org",
    private readonly userAgent = "land-map/0.1 (https://github.com/Kanesuan/KNS.MAP)",
  ) {}

  async search(query: string): Promise<GeocodeResult[]> {
    const params = new URLSearchParams({
      q: query,
      format: "jsonv2",
      limit: "5",
      countrycodes: "th",
      "accept-language": "th",
      // Prefer the Bangkok Metropolitan Region without excluding the rest of Thailand.
      viewbox: "99.85,14.3,101.0,13.45",
    });
    const res = await fetch(`${this.baseUrl}/search?${params}`, {
      headers: { "User-Agent": this.userAgent },
      next: { revalidate: 86_400 },
    });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    return parseNominatimResponse(await res.json());
  }
}

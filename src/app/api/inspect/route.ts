import { LAYERS } from "@/layers/registry";
import { isValidLatLng } from "@/lib/coords";
import {
  InspectorNotConfigured,
  InspectorNotReady,
  SERVER_INSPECTORS,
} from "@/lib/server/inspectors";

export type InspectResponse =
  | { ok: true; properties: Record<string, unknown> | null }
  | { ok: false; error: "bad_request" | "not_ready" | "not_configured" | "upstream" };

const json = (body: InspectResponse, status = 200, cache = false) =>
  Response.json(body, {
    status,
    headers: cache
      ? { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" }
      : {},
  });

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const layerId = params.get("layer") ?? "";
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  const layer = LAYERS.find((l) => l.id === layerId && l.source.kind === "api");
  const inspector = SERVER_INSPECTORS[layerId];
  if (!layer || !isValidLatLng(lat, lng) || !params.get("lat") || !params.get("lng")) {
    return json({ ok: false, error: "bad_request" }, 400);
  }
  if (!inspector) return json({ ok: false, error: "not_ready" }, 503);

  try {
    // Round to ~10 m so nearby taps share a cache entry.
    const properties = await inspector(Math.round(lat * 1e4) / 1e4, Math.round(lng * 1e4) / 1e4);
    return json({ ok: true, properties }, 200, true);
  } catch (err) {
    if (err instanceof InspectorNotReady) return json({ ok: false, error: "not_ready" }, 503);
    if (err instanceof InspectorNotConfigured)
      return json({ ok: false, error: "not_configured" }, 503);
    return json({ ok: false, error: "upstream" }, 502);
  }
}

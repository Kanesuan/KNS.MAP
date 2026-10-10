import { isValidLatLng } from "./coords";
import { MAX_ZOOM, MIN_ZOOM } from "./region";

export type ViewState = { lat: number; lng: number; zoom: number };

/** Reads `?c=lat,lng&z=zoom`. Returns null when missing or invalid. */
export function parseViewState(search: string): ViewState | null {
  const params = new URLSearchParams(search);
  const c = params.get("c");
  const z = params.get("z");
  if (!c || !z) return null;
  const parts = c.split(",");
  if (parts.length !== 2) return null;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  const zoom = Number(z);
  if (parts.some((p) => p.trim() === "") || z.trim() === "") return null;
  if (!isValidLatLng(lat, lng) || !Number.isFinite(zoom)) return null;
  if (zoom < MIN_ZOOM || zoom > MAX_ZOOM) return null;
  return { lat, lng, zoom };
}

/** Writes the view into `search`, keeping any other params. */
export function serializeViewState(view: ViewState, search = ""): string {
  const params = new URLSearchParams(search);
  params.set("c", `${view.lat.toFixed(5)},${view.lng.toFixed(5)}`);
  params.set("z", view.zoom.toFixed(2));
  // Keep the comma readable in shared links.
  return `?${params.toString().replace(/%2C/g, ",")}`;
}

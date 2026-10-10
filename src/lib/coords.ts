export type LatLng = { lat: number; lng: number };

const NUMBER = String.raw`[-+]?\d{1,3}(?:\.\d+)?`;
const LAT_LNG = new RegExp(String.raw`^\s*(${NUMBER})\s*[,\s]\s*(${NUMBER})\s*$`);

export function isValidLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
  );
}

/** Parses "13.7563, 100.5018" (latitude first). Returns null for anything else. */
export function parseLatLng(input: string): LatLng | null {
  const match = LAT_LNG.exec(input);
  if (!match?.[1] || !match[2]) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  return isValidLatLng(lat, lng) ? { lat, lng } : null;
}

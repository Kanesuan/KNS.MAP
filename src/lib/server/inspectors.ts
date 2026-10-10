import "server-only";
import { fetchFloodRecurrence } from "@/lib/gistda";

export class InspectorNotReady extends Error {}
export class InspectorNotConfigured extends Error {}

type Inspector = (lat: number, lng: number) => Promise<Record<string, unknown> | null>;

const gistdaFloodRecurrence: Inspector = async (lat, lng) => {
  const key = process.env.GISTDA_API_KEY;
  if (!key) throw new InspectorNotConfigured("GISTDA_API_KEY is not set");
  return fetchFloodRecurrence(lat, lng, key);
};

/** Server-side point lookups for layers whose source kind is "api", by layer id. */
export const SERVER_INSPECTORS: Record<string, Inspector> = {
  "flood-recurrence": gistdaFloodRecurrence,
};

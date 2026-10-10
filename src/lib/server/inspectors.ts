import "server-only";

export class InspectorNotReady extends Error {}
export class InspectorNotConfigured extends Error {}

type Inspector = (lat: number, lng: number) => Promise<Record<string, unknown> | null>;

/**
 * GISTDA flood recurrence. The response shape must come from a real call
 * stored as a fixture (docs/BRIEF.md section 5), which has not been possible
 * yet from the build sandbox, so this reports "not ready" instead of guessing.
 */
const gistdaFloodRecurrence: Inspector = async () => {
  if (!process.env.GISTDA_API_KEY) throw new InspectorNotConfigured("GISTDA_API_KEY is not set");
  throw new InspectorNotReady("GISTDA response parser pending a recorded fixture");
};

/** Server-side point lookups for layers whose source kind is "api", by layer id. */
export const SERVER_INSPECTORS: Record<string, Inspector> = {
  "flood-recurrence": gistdaFloodRecurrence,
};

// Bangkok and the five surrounding provinces: Nonthaburi, Pathum Thani,
// Samut Prakan, Nakhon Pathom and Samut Sakhon.
export type LngLatBounds = [[number, number], [number, number]];

export const REGION_BOUNDS: LngLatBounds = [
  [99.85, 13.45],
  [101.0, 14.3],
];

// How far the user may pan away from the region.
export const MAX_BOUNDS: LngLatBounds = [
  [98.5, 12.8],
  [102.3, 15.0],
];

export const MIN_ZOOM = 7;
export const MAX_ZOOM = 19;

// Usage events (docs/BRIEF.md section 6, M5). Everything goes through `track`;
// the default sink logs to the console so any analytics tool can be plugged in later.

export type AnalyticsEvent =
  | { name: "layer_toggled"; layerId: string; on: boolean }
  | { name: "point_inspected"; lat: number; lng: number; visibleLayers: string[] }
  | { name: "search_used"; kind: "coordinates" | "place"; resultCount: number };

export type AnalyticsSink = (event: AnalyticsEvent) => void;

const consoleSink: AnalyticsSink = (event) => {
  console.info("[analytics]", event.name, event);
};

let sink: AnalyticsSink = consoleSink;

/** Replace the sink, e.g. with a real analytics client. */
export function setAnalyticsSink(next: AnalyticsSink): void {
  sink = next;
}

export function track(event: AnalyticsEvent): void {
  try {
    sink(event);
  } catch {
    // Analytics must never break the app.
  }
}

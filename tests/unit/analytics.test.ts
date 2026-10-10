import { afterEach, describe, expect, it, vi } from "vitest";
import { setAnalyticsSink, track, type AnalyticsEvent } from "@/lib/analytics";

afterEach(() => setAnalyticsSink(() => {}));

describe("analytics", () => {
  it("sends events to the configured sink", () => {
    const sink = vi.fn();
    setAnalyticsSink(sink);
    const event: AnalyticsEvent = { name: "layer_toggled", layerId: "subsidence", on: true };
    track(event);
    expect(sink).toHaveBeenCalledWith(event);
  });

  it("never throws when the sink fails", () => {
    setAnalyticsSink(() => {
      throw new Error("boom");
    });
    expect(() => track({ name: "search_used", kind: "place", resultCount: 0 })).not.toThrow();
  });
});

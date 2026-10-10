import { describe, expect, it } from "vitest";
import { contains, distanceTo, queryPoint, type FeatureCollection } from "@/lib/geo";

const square = {
  type: "Polygon" as const,
  coordinates: [
    [
      [100, 13],
      [100.1, 13],
      [100.1, 13.1],
      [100, 13.1],
      [100, 13],
    ] as [number, number][],
  ],
};

describe("geo", () => {
  it("tests polygon containment", () => {
    expect(contains([100.05, 13.05], square)).toBe(true);
    expect(contains([100.15, 13.05], square)).toBe(false);
  });

  it("respects holes", () => {
    const withHole = {
      ...square,
      coordinates: [
        ...square.coordinates,
        [
          [100.04, 13.04],
          [100.06, 13.04],
          [100.06, 13.06],
          [100.04, 13.06],
          [100.04, 13.04],
        ] as [number, number][],
      ],
    };
    expect(contains([100.05, 13.05], withHole)).toBe(false);
    expect(contains([100.02, 13.02], withHole)).toBe(true);
  });

  it("measures distance to a line in metres", () => {
    // 0.001 degrees of latitude is about 111 m.
    const d = distanceTo([100.05, 13.001], {
      type: "LineString",
      coordinates: [
        [100, 13],
        [100.1, 13],
      ],
    });
    expect(d).toBeGreaterThan(105);
    expect(d).toBeLessThan(116);
  });

  it("finds the containing feature or the nearest within range", () => {
    const fc: FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { n: "a" },
          geometry: { type: "Point", coordinates: [100, 12.9] },
        },
        {
          type: "Feature",
          properties: { n: "b" },
          geometry: { type: "Point", coordinates: [100.01, 12.9] },
        },
        { type: "Feature", properties: { n: "sq" }, geometry: square },
      ],
    };
    expect(queryPoint(fc, [100.05, 13.05], "contains")?.properties).toEqual({ n: "sq" });
    expect(queryPoint(fc, [100.009, 12.9], "nearest", 500)?.properties).toEqual({ n: "b" });
    expect(queryPoint(fc, [100.5, 13.5], "nearest", 500)).toBeNull();
  });
});

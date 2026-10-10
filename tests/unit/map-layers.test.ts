import { describe, expect, it } from "vitest";
import { opacityPaint } from "@/lib/map-layers";

describe("opacityPaint", () => {
  it("scales the layer's own opacity", () => {
    expect(
      opacityPaint({ id: "a", type: "line", source: "s", paint: { "line-opacity": 0.8 } }, 0.5),
    ).toEqual([["line-opacity", 0.4]]);
  });

  it("treats a missing opacity as 1 and covers circle strokes", () => {
    expect(opacityPaint({ id: "a", type: "circle", source: "s" }, 0.3)).toEqual([
      ["circle-opacity", 0.3],
      ["circle-stroke-opacity", 0.3],
    ]);
  });

  it("returns nothing for layer types without opacity", () => {
    expect(opacityPaint({ id: "bg", type: "hillshade", source: "s" }, 0.5)).toEqual([]);
  });
});

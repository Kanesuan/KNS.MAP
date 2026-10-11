import type { StyleSpecification } from "maplibre-gl";
import { describe, expect, it } from "vitest";
import { liteLayers } from "@/lib/basemap";

describe("liteLayers", () => {
  it("drops 3D buildings and POI symbols, keeps the rest", () => {
    const layers: StyleSpecification["layers"] = [
      { id: "bg", type: "background" },
      { id: "b3d", type: "fill-extrusion", source: "s", "source-layer": "building" },
      { id: "poi", type: "symbol", source: "s", "source-layer": "poi" },
      { id: "place", type: "symbol", source: "s", "source-layer": "place" },
      { id: "water", type: "fill", source: "s", "source-layer": "water" },
    ];
    expect(liteLayers(layers).map((l) => l.id)).toEqual(["bg", "place", "water"]);
  });
});

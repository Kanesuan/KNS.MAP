import { describe, expect, it } from "vitest";
import { LAYERS } from "@/layers/registry";
import { inspectableLayers, orderForCards } from "@/lib/inspect";

describe("inspect cards", () => {
  it("gives every layer of the brief a card", () => {
    expect(inspectableLayers(LAYERS)).toHaveLength(LAYERS.length);
  });

  it("puts visible layers first and keeps registry order otherwise", () => {
    const ids = orderForCards(LAYERS, ["rail-transit", "subsidence"]).map((l) => l.id);
    expect(ids.slice(0, 2)).toEqual(["subsidence", "rail-transit"]);
    expect(ids[2]).toBe("bkk-zoning-current");
  });
});

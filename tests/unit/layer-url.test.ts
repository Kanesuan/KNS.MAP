import { describe, expect, it } from "vitest";
import { parseVisibleLayers, serializeVisibleLayers } from "@/lib/layer-url";
import { LAYERS } from "@/layers/registry";

describe("layer url state", () => {
  it("uses the defaults when the param is missing", () => {
    expect(parseVisibleLayers("?c=13,100&z=10", LAYERS)).toEqual(["bkk-zoning-current"]);
  });

  it("means nothing on when the param is empty", () => {
    expect(parseVisibleLayers("?l=", LAYERS)).toEqual([]);
  });

  it("drops unknown ids and duplicates", () => {
    expect(parseVisibleLayers("?l=subsidence,nope,subsidence", LAYERS)).toEqual(["subsidence"]);
  });

  it("keeps only the first layer of an exclusive group", () => {
    expect(
      parseVisibleLayers("?l=bkk-zoning-draft4,bkk-zoning-current,rail-transit", LAYERS),
    ).toEqual(["bkk-zoning-draft4", "rail-transit"]);
  });

  it("round-trips and keeps other params", () => {
    const search = serializeVisibleLayers(["subsidence", "rail-transit"], "?c=13,100&z=10");
    expect(search).toContain("l=subsidence,rail-transit");
    expect(new URLSearchParams(search).get("z")).toBe("10");
    expect(parseVisibleLayers(search, LAYERS)).toEqual(["subsidence", "rail-transit"]);
  });
});

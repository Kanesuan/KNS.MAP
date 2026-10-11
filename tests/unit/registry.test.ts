import { describe, expect, it } from "vitest";
import { LAYERS } from "@/layers/registry";
import type { LayerConfig } from "@/layers/types";
import { validateRegistry } from "@/layers/validate";

const base = LAYERS.find((l) => l.id === "subsidence") as LayerConfig;
const variant = (patch: Partial<LayerConfig>): LayerConfig[] => [{ ...base, ...patch }];

describe("layer registry", () => {
  it("is valid", () => {
    expect(validateRegistry(LAYERS)).toEqual([]);
  });

  it("covers every layer of the brief", () => {
    expect(LAYERS.map((l) => l.id).sort()).toEqual(
      [
        "admin-boundary",
        "bkk-planned-roads",
        "bkk-zoning-current",
        "bkk-zoning-draft4",
        "flood-recurrence",
        "rail-transit",
        "subsidence",
      ].sort(),
    );
  });

  it("opens only the current zoning plan by default", () => {
    expect(LAYERS.filter((l) => l.defaultVisible).map((l) => l.id)).toEqual(["bkk-zoning-current"]);
  });

  it("fails a live layer whose licence is not confirmed", () => {
    const errors = validateRegistry(
      variant({ status: "live", source: { kind: "geojson", url: "/data/subsidence.geojson" } }),
      "commercial",
    );
    expect(errors.join("\n")).toMatch(/live.*commercialUse is "unverified"/);
  });

  it("in non-commercial mode, fails only unverified licences", () => {
    const live = {
      status: "live" as const,
      source: { kind: "geojson" as const, url: "/data/s.geojson" },
    };
    expect(validateRegistry(variant(live), "non-commercial").join("\n")).toMatch(/unverified/);
    expect(
      validateRegistry(
        variant({ ...live, attribution: { ...base.attribution, commercialUse: "no" } }),
        "non-commercial",
      ),
    ).toEqual([]);
    expect(
      validateRegistry(
        variant({ ...live, attribution: { ...base.attribution, commercialUse: "no" } }),
        "commercial",
      ).join("\n"),
    ).toMatch(/commercialUse is "no"/);
  });

  it("accepts a live layer with commercial use confirmed", () => {
    const errors = validateRegistry(
      variant({
        status: "live",
        source: { kind: "geojson", url: "/data/subsidence.geojson" },
        attribution: { ...base.attribution, commercialUse: "yes" },
      }),
    );
    expect(errors).toEqual([]);
  });

  it("requires sample data in a .sample.geojson file", () => {
    const errors = validateRegistry(
      variant({ source: { kind: "geojson", url: "/data/x.geojson" } }),
    );
    expect(errors.join("\n")).toMatch(/\.sample\.geojson/);
  });

  it("rejects duplicate ids, bad dates, missing org and bad opacity", () => {
    const errors = validateRegistry([
      base,
      {
        ...base,
        defaultOpacity: 2,
        attribution: { ...base.attribution, org: " ", dataDate: "10/10/2026" },
      },
    ]);
    const text = errors.join("\n");
    expect(text).toMatch(/duplicate id/);
    expect(text).toMatch(/dataDate/);
    expect(text).toMatch(/org is empty/);
    expect(text).toMatch(/defaultOpacity/);
  });

  it("rejects a style layer pointing at another source", () => {
    const errors = validateRegistry(
      variant({ style: [{ id: "x", type: "fill", source: "other" }] }),
    );
    expect(errors.join("\n")).toMatch(/must use source "subsidence"/);
  });

  it("rejects two default-visible layers in one exclusive group", () => {
    const current = LAYERS.find((l) => l.id === "bkk-zoning-current") as LayerConfig;
    const draft = LAYERS.find((l) => l.id === "bkk-zoning-draft4") as LayerConfig;
    const errors = validateRegistry([current, { ...draft, defaultVisible: true }]);
    expect(errors.join("\n")).toMatch(/exclusive group/);
  });

  it("accepts a new layer added with one registry entry", () => {
    const extra: LayerConfig = {
      ...base,
      id: "test-layer",
      source: { kind: "geojson", url: "/data/test-layer.sample.geojson" },
      style: [{ id: "test-layer-fill", type: "fill", source: "test-layer" }],
    };
    expect(validateRegistry([...LAYERS, extra])).toEqual([]);
  });
});

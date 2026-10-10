import { describe, expect, it } from "vitest";
import { parseViewState, serializeViewState } from "@/lib/url-state";

describe("url state", () => {
  it("round-trips a view", () => {
    const view = { lat: 13.75631, lng: 100.50182, zoom: 12.5 };
    expect(parseViewState(serializeViewState(view))).toEqual(view);
  });

  it("writes a readable query", () => {
    expect(serializeViewState({ lat: 13.7563, lng: 100.5018, zoom: 11 })).toBe(
      "?c=13.75630,100.50180&z=11.00",
    );
  });

  it("keeps other params", () => {
    const out = serializeViewState({ lat: 1, lng: 2, zoom: 10 }, "?layers=a,b");
    expect(new URLSearchParams(out).get("layers")).toBe("a,b");
  });

  it.each([
    "",
    "?c=13,100",
    "?z=10",
    "?c=abc,100&z=10",
    "?c=13,100&z=99",
    "?c=,100&z=10",
    "?c=91,100&z=10",
  ])("rejects %s", (search) => {
    expect(parseViewState(search)).toBeNull();
  });
});

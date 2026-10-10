import { describe, expect, it } from "vitest";
import { parseNominatimResponse } from "@/lib/geocoder";

describe("parseNominatimResponse", () => {
  it("maps valid items and drops invalid ones", () => {
    const body = [
      { lat: "13.7466", lon: "100.5348", display_name: "สยามพารากอน, กรุงเทพมหานคร" },
      { lat: "x", lon: "100", display_name: "bad number" },
      { lat: 13, lon: "100", display_name: "wrong type" },
      null,
    ];
    expect(parseNominatimResponse(body)).toEqual([
      { lat: 13.7466, lng: 100.5348, label: "สยามพารากอน, กรุงเทพมหานคร" },
    ]);
  });

  it("returns an empty list for non-arrays", () => {
    expect(parseNominatimResponse({ error: "x" })).toEqual([]);
  });
});

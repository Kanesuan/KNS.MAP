import { describe, expect, it } from "vitest";
import { parseLatLng } from "@/lib/coords";

describe("parseLatLng", () => {
  it.each([
    ["13.7563, 100.5018", { lat: 13.7563, lng: 100.5018 }],
    ["13.7563,100.5018", { lat: 13.7563, lng: 100.5018 }],
    ["  13.7563 100.5018 ", { lat: 13.7563, lng: 100.5018 }],
    ["-33.9, 151.2", { lat: -33.9, lng: 151.2 }],
  ])("parses %s", (input, expected) => {
    expect(parseLatLng(input)).toEqual(expected);
  });

  it.each(["สยาม", "13.7563", "100.5, 200", "95, 100", "13.7, 100.5, 3", ""])(
    "rejects %s",
    (input) => {
      expect(parseLatLng(input)).toBeNull();
    },
  );
});

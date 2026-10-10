import type { StyleSpecification } from "maplibre-gl";
import { describe, expect, it } from "vitest";
import { withThaiFontFaces } from "@/lib/basemap";

const style: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    { id: "bg", type: "background" },
    { id: "a", type: "symbol", source: "s", layout: { "text-font": ["Noto Sans Regular"] } },
    { id: "b", type: "symbol", source: "s", layout: { "text-font": ["Noto Sans Bold"] } },
  ],
};

describe("withThaiFontFaces", () => {
  it("adds a Thai font file for every text font in the style", () => {
    const out = withThaiFontFaces(style, "https://example.test");
    expect(out["font-faces"]).toEqual({
      "Noto Sans Regular": [
        {
          url: "https://example.test/fonts/NotoSansThai-Regular.woff2",
          "unicode-range": ["U+0E00-0E7F"],
        },
      ],
      "Noto Sans Bold": [
        {
          url: "https://example.test/fonts/NotoSansThai-Bold.woff2",
          "unicode-range": ["U+0E00-0E7F"],
        },
      ],
    });
  });

  it("keeps font faces the style already declares", () => {
    const own = { "Noto Sans Regular": "https://fonts.test/own.ttf" };
    const out = withThaiFontFaces({ ...style, "font-faces": own }, "https://example.test");
    expect(out["font-faces"]?.["Noto Sans Regular"]).toBe(own["Noto Sans Regular"]);
  });
});

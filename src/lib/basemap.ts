import type { StyleSpecification } from "maplibre-gl";

export const DEFAULT_BASEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

export function basemapStyleUrl(): string {
  return process.env.NEXT_PUBLIC_BASEMAP_STYLE_URL || DEFAULT_BASEMAP_STYLE_URL;
}

const THAI_RANGE = ["U+0E00-0E7F"];

function collectTextFonts(style: StyleSpecification): Set<string> {
  const fonts = new Set<string>();
  const visit = (value: unknown): void => {
    if (typeof value === "string") fonts.add(value);
    else if (Array.isArray(value)) value.forEach(visit);
  };
  for (const layer of style.layers) {
    if (layer.type === "symbol") visit(layer.layout?.["text-font"]);
  }
  return fonts;
}

/**
 * SDF glyph PBFs place Thai vowels and tone marks as separate glyphs, so they
 * overlap. Declaring a real font file for the Thai block lets MapLibre draw
 * each grapheme cluster with the browser's text engine instead.
 */
export function withThaiFontFaces(style: StyleSpecification, origin: string): StyleSpecification {
  const faces: Record<string, { url: string; "unicode-range": string[] }[]> = {};
  for (const font of collectTextFonts(style)) {
    const bold = /bold|semibold|heavy|black/i.test(font);
    const file = bold ? "NotoSansThai-Bold.woff2" : "NotoSansThai-Regular.woff2";
    faces[font] = [{ url: `${origin}/fonts/${file}`, "unicode-range": THAI_RANGE }];
  }
  return { ...style, "font-faces": { ...faces, ...style["font-faces"] } };
}

export async function loadBasemapStyle(url: string, origin: string): Promise<StyleSpecification> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Basemap style ${res.status}`);
  const style = (await res.json()) as StyleSpecification;
  return withThaiFontFaces(style, origin);
}

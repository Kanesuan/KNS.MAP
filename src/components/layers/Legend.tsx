import { t } from "@/i18n/th";
import type { LayerConfig } from "@/layers/types";

function Swatch({ color, shape = "fill" }: { color: string; shape?: "fill" | "line" | "point" }) {
  if (shape === "line") {
    return <span aria-hidden className="h-1 w-5 shrink-0 rounded" style={{ background: color }} />;
  }
  if (shape === "point") {
    return (
      <span
        aria-hidden
        className="size-3.5 shrink-0 rounded-full border-2 bg-white"
        style={{ borderColor: color }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="size-4 shrink-0 rounded-sm border border-black/10"
      style={{ background: color }}
    />
  );
}

export function Legend({ items }: { items: LayerConfig["legend"] }) {
  if (items.length === 0) return null;
  return (
    <ul aria-label={t("panel.legend")} className="grid grid-cols-1 gap-x-3 gap-y-1">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2 text-base md:text-sm leading-snug">
          <Swatch color={item.color} shape={item.shape} />
          <span>{t(item.label)}</span>
        </li>
      ))}
    </ul>
  );
}

import { t } from "@/i18n/th";
import type { LayerConfig } from "@/layers/types";

/** Quiet text labels for sample and draft layers. */
export function Badges({ layer }: { layer: LayerConfig }) {
  if (layer.status !== "sample" && layer.badge !== "draft") return null;
  return (
    <span className="flex flex-wrap gap-x-2 text-sm leading-tight md:text-xs">
      {layer.status === "sample" && (
        <span className="text-amber-700">{t("panel.badges.sample")}</span>
      )}
      {layer.badge === "draft" && <span className="text-sky-700">{t("panel.badges.draft")}</span>}
    </span>
  );
}

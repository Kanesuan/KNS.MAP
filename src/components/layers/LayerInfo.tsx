import { t } from "@/i18n/th";
import type { LayerConfig } from "@/layers/types";

const dateFormat = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" });

export function formatDataDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : dateFormat.format(d);
}

/** The "read more" text behind a layer's "?" button. */
export function LayerInfo({
  id,
  layer,
  exclusiveWith = [],
}: {
  id: string;
  layer: LayerConfig;
  exclusiveWith?: string[];
}) {
  const a = layer.attribution;
  return (
    <div
      id={id}
      className="space-y-1 rounded-lg bg-neutral-50 px-3 py-2 text-base leading-snug text-neutral-700 md:text-sm"
    >
      <p>{t(layer.summary)}</p>
      {exclusiveWith.length > 0 && (
        <p className="text-neutral-500">
          {t("panel.exclusive")} {exclusiveWith.join(", ")}
        </p>
      )}
      <p className="text-neutral-500">
        {t("panel.source")}: {a.org}
        <br />
        {t("panel.dataDate")} {formatDataDate(a.dataDate)} · {t("panel.license")}: {a.license}
      </p>
    </div>
  );
}

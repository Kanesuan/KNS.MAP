"use client";

import * as Slider from "@radix-ui/react-slider";
import * as Switch from "@radix-ui/react-switch";
import { useId } from "react";
import { t } from "@/i18n/th";
import type { LayerConfig } from "@/layers/types";
import type { LoadState } from "@/store/layer-store";
import { Legend } from "./Legend";

const dateFormat = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" });

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : dateFormat.format(d);
}

function Badge({ children, tone }: { children: string; tone: "sample" | "draft" }) {
  const cls =
    tone === "sample"
      ? "bg-amber-100 text-amber-900 ring-amber-300"
      : "bg-sky-100 text-sky-900 ring-sky-300";
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-base md:text-xs font-medium ring-1 ${cls}`}
    >
      {children}
    </span>
  );
}

type Props = {
  layer: LayerConfig;
  on: boolean;
  opacity: number;
  load: LoadState;
  exclusiveWith: string[];
  onToggle: (on: boolean) => void;
  onOpacity: (value: number) => void;
  onRetry: () => void;
};

export function LayerRow({
  layer,
  on,
  opacity,
  load,
  exclusiveWith,
  onToggle,
  onOpacity,
  onRetry,
}: Props) {
  const nameId = useId();
  const drawn = layer.source.kind !== "api";

  return (
    <li className="border-b border-neutral-100 last:border-0" data-testid={`layer-row-${layer.id}`}>
      <div className="flex items-start gap-3 py-2">
        <div className="min-w-0 flex-1 pt-2.5">
          <p id={nameId} className="text-base leading-snug font-medium">
            {t(layer.name)}
          </p>
          <p className="text-base md:text-sm leading-snug text-neutral-600">{t(layer.summary)}</p>
          {(layer.status === "sample" || layer.badge === "draft") && (
            <p className="mt-1 flex flex-wrap gap-1">
              {layer.status === "sample" && <Badge tone="sample">{t("panel.badges.sample")}</Badge>}
              {layer.badge === "draft" && <Badge tone="draft">{t("panel.badges.draft")}</Badge>}
            </p>
          )}
        </div>
        <label className="flex size-11 shrink-0 cursor-pointer items-center justify-center">
          <Switch.Root
            checked={on}
            onCheckedChange={onToggle}
            aria-labelledby={nameId}
            className="relative h-6 w-10 rounded-full bg-neutral-300 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 data-[state=checked]:bg-blue-600"
          >
            <Switch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[18px]" />
          </Switch.Root>
        </label>
      </div>

      {on && (
        <div className="space-y-3 pb-3">
          {load === "loading" && (
            <p role="status" className="text-base md:text-sm text-neutral-600">
              {t("panel.loading")}
            </p>
          )}
          {load === "error" && (
            <div
              role="alert"
              className="flex items-center justify-between gap-2 rounded-lg bg-red-50 px-3 py-1 text-base md:text-sm text-red-800"
            >
              <span>{t("panel.loadFailed")}</span>
              <button
                type="button"
                onClick={onRetry}
                className="min-h-11 rounded-md px-3 font-medium underline focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                {t("panel.retry")}
              </button>
            </div>
          )}
          {!drawn && <p className="text-base md:text-sm text-neutral-700">{t("panel.tapOnly")}</p>}
          {drawn && (
            <div className="flex items-center gap-3">
              <span className="shrink-0 text-base md:text-sm text-neutral-700">
                {t("panel.opacity")}
              </span>
              <Slider.Root
                value={[Math.round(opacity * 100)]}
                onValueChange={([v]) => v !== undefined && onOpacity(v / 100)}
                min={0}
                max={100}
                step={5}
                className="relative flex h-11 flex-1 touch-none items-center select-none"
              >
                <Slider.Track className="relative h-1.5 grow rounded-full bg-neutral-200">
                  <Slider.Range className="absolute h-full rounded-full bg-blue-600" />
                </Slider.Track>
                <Slider.Thumb
                  aria-label={`${t("panel.opacity")} ${t(layer.name)}`}
                  className="block size-5 rounded-full border-2 border-blue-600 bg-white shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                />
              </Slider.Root>
              <span className="w-10 shrink-0 text-right text-base md:text-sm tabular-nums">
                {Math.round(opacity * 100)}%
              </span>
            </div>
          )}
          <Legend items={layer.legend} />
          {exclusiveWith.length > 0 && (
            <p className="text-base md:text-xs text-neutral-600">
              {t("panel.exclusive")} {exclusiveWith.join(", ")}
            </p>
          )}
        </div>
      )}
      <p className="pb-2 text-base md:text-xs leading-snug text-neutral-600">
        {t("panel.source")}: {layer.attribution.org} · {t("panel.dataDate")}{" "}
        {formatDate(layer.attribution.dataDate)}
      </p>
    </li>
  );
}

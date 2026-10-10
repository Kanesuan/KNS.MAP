"use client";

import { t } from "@/i18n/th";
import type { LayerConfig } from "@/layers/types";
import type { CardResult } from "@/lib/inspect";

type Props = {
  layer: LayerConfig;
  result: CardResult;
  visible: boolean;
  onShow: () => void;
  onRetry: () => void;
};

export function ResultCard({ layer, result, visible, onShow, onRetry }: Props) {
  const drawn = layer.source.kind !== "api";
  return (
    <li
      data-testid={`result-${layer.id}`}
      data-status={result.status}
      className="rounded-xl border border-neutral-200 p-3"
    >
      <h3 className="text-base font-semibold leading-snug md:text-sm">{t(layer.name)}</h3>
      {(layer.status === "sample" || layer.badge === "draft") && (
        <p className="mt-1 flex flex-wrap gap-1">
          {layer.status === "sample" && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-sm font-medium text-amber-900 ring-1 ring-amber-300 md:text-xs">
              {t("panel.badges.sample")}
            </span>
          )}
          {layer.badge === "draft" && (
            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-sm font-medium text-sky-900 ring-1 ring-sky-300 md:text-xs">
              {t("panel.badges.draft")}
            </span>
          )}
        </p>
      )}
      <div className="mt-2 text-base leading-relaxed" aria-live="polite">
        {result.status === "loading" && <p className="text-neutral-500">{t("inspect.loading")}</p>}
        {result.status === "answer" && <p>{result.text}</p>}
        {result.status === "empty" && <p className="text-neutral-600">{t("inspect.noData")}</p>}
        {result.status === "not_ready" && (
          <p className="text-neutral-600">{t("inspect.notReady")}</p>
        )}
        {result.status === "error" && (
          <p className="flex items-center justify-between gap-2 text-red-800">
            <span>{t("inspect.failed")}</span>
            <button
              type="button"
              onClick={onRetry}
              className="min-h-11 rounded-md px-3 font-medium underline focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              {t("inspect.retry")}
            </button>
          </p>
        )}
      </div>
      {drawn && (
        <button
          type="button"
          onClick={onShow}
          disabled={visible}
          className="mt-2 min-h-11 rounded-lg border border-blue-600 px-3 text-base font-medium text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-neutral-200 disabled:text-neutral-500 md:text-sm"
        >
          {visible ? t("inspect.shownOnMap") : t("inspect.showOnMap")}
        </button>
      )}
    </li>
  );
}

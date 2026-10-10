"use client";

import { useId, useState } from "react";
import { Badges } from "@/components/layers/Badges";
import { LayerInfo } from "@/components/layers/LayerInfo";
import { InfoToggle } from "@/components/ui/InfoToggle";
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
  const infoId = useId();
  const [info, setInfo] = useState(false);
  const drawn = layer.source.kind !== "api";
  const name = t(layer.name);

  return (
    <li data-testid={`result-${layer.id}`} data-status={result.status} className="py-2">
      <div className="flex items-center">
        <div className="min-w-0 flex-1">
          <h3 className="text-base leading-snug text-neutral-500 md:text-sm">{name}</h3>
          <Badges layer={layer} />
        </div>
        <InfoToggle
          label={`${t("panel.moreInfo")} ${name}`}
          open={info}
          controls={infoId}
          onToggle={() => setInfo((v) => !v)}
        />
      </div>
      <div className="text-base leading-relaxed" aria-live="polite">
        {result.status === "loading" && <p className="text-neutral-400">{t("inspect.loading")}</p>}
        {result.status === "answer" && (
          <p className="font-medium text-neutral-900">{result.text}</p>
        )}
        {result.status === "empty" && <p className="text-neutral-500">{t("inspect.noData")}</p>}
        {result.status === "not_ready" && (
          <p className="text-neutral-500">{t("inspect.notReady")}</p>
        )}
        {result.status === "error" && (
          <p className="flex items-center justify-between gap-2 text-red-700">
            <span>{t("inspect.failed")}</span>
            <button
              type="button"
              onClick={onRetry}
              className="min-h-11 rounded-md px-2 font-medium underline focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              {t("inspect.retry")}
            </button>
          </p>
        )}
      </div>
      {info && (
        <div className="mt-2">
          <LayerInfo id={infoId} layer={layer} />
        </div>
      )}
      {drawn && (
        <button
          type="button"
          onClick={onShow}
          disabled={visible}
          className="-ml-1 min-h-11 rounded-md px-1 text-base text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:text-neutral-400 disabled:no-underline md:text-sm"
        >
          {visible ? t("inspect.shownOnMap") : t("inspect.showOnMap")}
        </button>
      )}
    </li>
  );
}

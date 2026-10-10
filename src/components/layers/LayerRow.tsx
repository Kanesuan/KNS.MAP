"use client";

import * as Slider from "@radix-ui/react-slider";
import * as Switch from "@radix-ui/react-switch";
import { useId, useState } from "react";
import { InfoToggle } from "@/components/ui/InfoToggle";
import { t } from "@/i18n/th";
import type { LayerConfig } from "@/layers/types";
import type { LoadState } from "@/store/layer-store";
import { Badges } from "./Badges";
import { LayerInfo } from "./LayerInfo";
import { Legend } from "./Legend";

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
  const infoId = useId();
  const [info, setInfo] = useState(false);
  const drawn = layer.source.kind !== "api";
  const name = t(layer.name);

  return (
    <li data-testid={`layer-row-${layer.id}`} className="py-0.5">
      <div className="flex items-center">
        <div className="min-w-0 flex-1 py-1.5">
          <p id={nameId} className="text-base leading-snug">
            {name}
          </p>
          <Badges layer={layer} />
        </div>
        <InfoToggle
          label={`${t("panel.moreInfo")} ${name}`}
          open={info}
          controls={infoId}
          onToggle={() => setInfo((v) => !v)}
        />
        <label className="flex size-11 shrink-0 cursor-pointer items-center justify-center">
          <Switch.Root
            checked={on}
            onCheckedChange={onToggle}
            aria-labelledby={nameId}
            className="relative h-6 w-10 rounded-full bg-neutral-300 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 data-[state=checked]:bg-neutral-900"
          >
            <Switch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[18px]" />
          </Switch.Root>
        </label>
      </div>

      {info && <LayerInfo id={infoId} layer={layer} exclusiveWith={exclusiveWith} />}

      {on && (
        <div className="space-y-2 pt-1 pb-3">
          {load === "loading" && (
            <p role="status" className="text-base text-neutral-500 md:text-sm">
              {t("panel.loading")}
            </p>
          )}
          {load === "error" && (
            <div
              role="alert"
              className="flex items-center justify-between gap-2 text-base text-red-700 md:text-sm"
            >
              <span>{t("panel.loadFailed")}</span>
              <button
                type="button"
                onClick={onRetry}
                className="min-h-11 rounded-md px-2 font-medium underline focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                {t("panel.retry")}
              </button>
            </div>
          )}
          {!drawn && <p className="text-base text-neutral-500 md:text-sm">{t("panel.tapOnly")}</p>}
          {drawn && (
            <Slider.Root
              value={[Math.round(opacity * 100)]}
              onValueChange={([v]) => v !== undefined && onOpacity(v / 100)}
              min={0}
              max={100}
              step={5}
              className="relative flex h-8 w-full touch-none items-center select-none"
            >
              <Slider.Track className="relative h-1 grow rounded-full bg-neutral-200">
                <Slider.Range className="absolute h-full rounded-full bg-neutral-900" />
              </Slider.Track>
              <Slider.Thumb
                aria-label={`${t("panel.opacity")} ${name}`}
                className="block size-5 rounded-full border border-neutral-300 bg-white shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              />
            </Slider.Root>
          )}
          <Legend items={layer.legend} />
        </div>
      )}
    </li>
  );
}

"use client";

import { useCallback, useEffect, useMemo } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useIsMobile } from "@/hooks/useIsMobile";
import { t } from "@/i18n/th";
import { LAYERS } from "@/layers/registry";
import type { LayerConfig } from "@/layers/types";
import { inspectableLayers, inspectLayer, orderForCards } from "@/lib/inspect";
import { useInspectStore } from "@/store/inspect-store";
import { useLayerStore } from "@/store/layer-store";
import { useUiStore } from "@/store/ui-store";
import { ResultCard } from "./ResultCard";

const INSPECTABLE = inspectableLayers(LAYERS);

function Results() {
  const point = useInspectStore((s) => s.point);
  const results = useInspectStore((s) => s.results);
  const setResult = useInspectStore((s) => s.setResult);
  const visible = useLayerStore((s) => s.visible);
  const toggle = useLayerStore((s) => s.toggle);

  // Order is fixed per point so cards don't jump when a layer is switched on.
  const ordered = useMemo(
    () => orderForCards(INSPECTABLE, useLayerStore.getState().visible),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [point?.id],
  );

  const run = useCallback(
    (layer: LayerConfig) => {
      if (!point) return;
      setResult(point.id, layer.id, { status: "loading" });
      void inspectLayer(layer, point).then((r) => setResult(point.id, layer.id, r));
    },
    [point, setResult],
  );

  useEffect(() => {
    for (const layer of INSPECTABLE) run(layer);
  }, [run]);

  if (!point) return null;
  return (
    <>
      <p className="mb-3 text-base text-neutral-600 tabular-nums md:text-sm">
        {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
      </p>
      <ul className="space-y-3" data-testid="inspect-results">
        {ordered.map((layer) => (
          <ResultCard
            key={layer.id}
            layer={layer}
            result={results[layer.id] ?? { status: "loading" }}
            visible={visible.includes(layer.id)}
            onShow={() => toggle(layer.id, true)}
            onRetry={() => run(layer)}
          />
        ))}
      </ul>
      <p className="mt-4 rounded-lg bg-neutral-100 p-3 text-base leading-relaxed text-neutral-700 md:text-sm">
        {t("inspect.disclaimer")}
      </p>
    </>
  );
}

export function InspectPanel() {
  const isMobile = useIsMobile();
  const point = useInspectStore((s) => s.point);
  const close = useInspectStore((s) => s.close);
  const sheet = useUiStore((s) => s.sheet);
  const setSheet = useUiStore((s) => s.setSheet);

  useEffect(() => {
    if (point && isMobile) setSheet("inspect");
  }, [point, isMobile, setSheet]);

  const onClose = useCallback(() => {
    close();
    if (useUiStore.getState().sheet === "inspect") setSheet(null);
  }, [close, setSheet]);

  if (!point) return null;

  if (isMobile) {
    if (sheet !== "inspect") return null;
    return (
      <BottomSheet title={t("inspect.title")} onClose={onClose} testId="inspect-sheet">
        <Results />
      </BottomSheet>
    );
  }

  return (
    <aside
      aria-labelledby="inspect-title"
      data-testid="inspect-panel"
      className="fixed top-3 right-3 z-20 flex max-h-[calc(100dvh-196px)] w-[360px] flex-col overflow-hidden rounded-xl bg-white shadow-md"
    >
      <div className="flex shrink-0 items-center justify-between pl-4">
        <h2 id="inspect-title" className="text-lg font-semibold">
          {t("inspect.title")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("inspect.close")}
          className="flex size-11 items-center justify-center focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div className="min-h-0 overflow-y-auto overscroll-contain px-4 pb-4">
        <Results />
      </div>
    </aside>
  );
}

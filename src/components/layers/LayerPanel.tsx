"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useIsMobile } from "@/hooks/useIsMobile";
import { t } from "@/i18n/th";
import { useLayerStore } from "@/store/layer-store";
import { useUiStore } from "@/store/ui-store";
import { LayerList } from "./LayerList";

function LayersIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </svg>
  );
}

export function LayerPanel() {
  const isMobile = useIsMobile();
  const initialized = useLayerStore((s) => s.initialized);
  const sheet = useUiStore((s) => s.sheet);
  const setSheet = useUiStore((s) => s.setSheet);
  const [collapsed, setCollapsed] = useState(false);

  if (!initialized) return null;

  if (isMobile) {
    if (sheet === "inspect") return null;
    return sheet === "layers" ? (
      <BottomSheet title={t("panel.title")} onClose={() => setSheet(null)} testId="layer-sheet">
        <LayerList />
      </BottomSheet>
    ) : (
      <button
        type="button"
        onClick={() => setSheet("layers")}
        aria-label={t("panel.open")}
        className="fixed bottom-8 left-3 z-20 flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-base font-medium shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <LayersIcon />
        {t("panel.title")}
      </button>
    );
  }

  return (
    <aside
      aria-labelledby="layer-panel-title"
      data-testid="layer-panel"
      className="fixed top-[68px] left-3 z-20 flex max-h-[calc(100dvh-80px)] w-80 flex-col overflow-hidden rounded-xl bg-white shadow-md"
    >
      <div className="flex shrink-0 items-center justify-between pl-4">
        <h2 id="layer-panel-title" className="flex items-center gap-2 text-lg font-semibold">
          <LayersIcon />
          {t("panel.title")}
        </h2>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-controls="layer-panel-body"
          aria-label={collapsed ? t("panel.expand") : t("panel.collapse")}
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
            className={collapsed ? "" : "rotate-180"}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      <div
        id="layer-panel-body"
        hidden={collapsed}
        className="min-h-0 overflow-y-auto overscroll-contain px-4 pb-4"
      >
        <LayerList />
      </div>
    </aside>
  );
}

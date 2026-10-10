"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type PointerEvent } from "react";
import { t } from "@/i18n/th";
import { useMapStore } from "@/store/map-store";

type Snap = "half" | "full";

function snapHeight(snap: Snap): number {
  const vh = window.innerHeight;
  return snap === "full" ? vh - 8 : Math.round(vh / 2);
}

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  testId?: string;
};

/**
 * Non-modal sheet that slides up from the bottom on mobile. Opens at half the
 * screen; drag the handle (or press it) to go full screen, drag down to close.
 */
export function BottomSheet({ title, onClose, children, testId }: Props) {
  const [snap, setSnap] = useState<Snap>("half");
  const [height, setHeight] = useState(() => snapHeight("half"));
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ startY: number; startH: number } | null>(null);
  const setSheetHeight = useMapStore((s) => s.setSheetHeight);

  useEffect(() => {
    setSheetHeight(height);
  }, [height, setSheetHeight]);
  useEffect(() => () => setSheetHeight(0), [setSheetHeight]);

  useEffect(() => {
    const onResize = () => setHeight(snapHeight(snap));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [snap]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const goTo = useCallback((next: Snap) => {
    setSnap(next);
    setHeight(snapHeight(next));
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    drag.current = { startY: e.clientY, startH: height };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return;
    const next = drag.current.startH + (drag.current.startY - e.clientY);
    setHeight(Math.max(0, Math.min(snapHeight("full"), next)));
  };
  const onPointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    const start = drag.current;
    drag.current = null;
    setDragging(false);
    if (!start) return;
    const moved = Math.abs(e.clientY - start.startY);
    if (moved < 6) {
      goTo(snap === "half" ? "full" : "half");
      return;
    }
    const half = snapHeight("half");
    if (height < half * 0.6) onClose();
    else if (height > (half + snapHeight("full")) / 2) goTo("full");
    else goTo("half");
  };

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-label={title}
      data-testid={testId}
      data-snap={snap}
      className={`fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.15)] ${dragging ? "" : "transition-[height] duration-200"}`}
      style={{ height }}
    >
      <div className="flex shrink-0 items-center justify-between px-2">
        <button
          type="button"
          aria-label={`${t("panel.dragHandle")} (${snap === "half" ? t("panel.expand") : t("panel.collapse")})`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              goTo(snap === "half" ? "full" : "half");
            }
          }}
          className="flex h-11 flex-1 touch-none items-center justify-center focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600"
          data-testid={testId ? `${testId}-handle` : undefined}
        >
          <span aria-hidden className="h-1.5 w-10 rounded-full bg-neutral-300" />
        </button>
      </div>
      <div className="flex shrink-0 items-center justify-between px-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-lg px-3 text-base font-medium text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          {t("panel.close")}
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6">{children}</div>
    </section>
  );
}

"use client";

import { useEffect, useReducer, useSyncExternalStore } from "react";
import { t } from "@/i18n/th";
import { useInspectStore } from "@/store/inspect-store";

const KEY = "land-map:tap-hint-dismissed";

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function writeDismissed(): void {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // Storage may be unavailable (private mode); the hint just comes back next visit.
  }
}

const noopSubscribe = () => () => {};

/** One-line first-visit hint. Hidden for good once dismissed or after the first tap. */
export function TapHint() {
  // Server render and first paint treat the hint as dismissed to avoid a flash.
  const dismissed = useSyncExternalStore(noopSubscribe, readDismissed, () => true);
  const [closedNow, close] = useReducer(() => true, false);
  const point = useInspectStore((s) => s.point);

  useEffect(() => {
    if (point) writeDismissed();
  }, [point]);

  if (dismissed || closedNow || point) return null;
  return (
    <div
      role="status"
      className="fixed bottom-24 left-1/2 z-20 flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-1 rounded-full bg-neutral-900/90 py-1 pr-1 pl-4 text-base text-white shadow-lg md:bottom-8"
    >
      <span>{t("inspect.hint")}</span>
      <button
        type="button"
        onClick={() => {
          writeDismissed();
          close();
        }}
        aria-label={t("inspect.dismissHint")}
        className="flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-white"
      >
        <svg
          width="18"
          height="18"
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
  );
}

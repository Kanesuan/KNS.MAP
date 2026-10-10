"use client";

/** Small "?" button that shows or hides extra text placed elsewhere (aria-controls). */
export function InfoToggle({
  label,
  open,
  controls,
  onToggle,
}: {
  label: string;
  open: boolean;
  controls: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-expanded={open}
      aria-controls={controls}
      className="group flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-blue-600"
    >
      <span
        aria-hidden
        className={`flex size-5 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
          open
            ? "border-neutral-800 bg-neutral-800 text-white"
            : "border-neutral-300 text-neutral-500 group-hover:border-neutral-500 group-hover:text-neutral-800"
        }`}
      >
        ?
      </span>
    </button>
  );
}

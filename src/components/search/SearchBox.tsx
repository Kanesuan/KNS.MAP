"use client";

import { useId, useState, type FormEvent } from "react";
import { th } from "@/i18n/th";
import { track } from "@/lib/analytics";
import { parseLatLng } from "@/lib/coords";
import type { GeocodeResult } from "@/lib/geocoder";
import { useMapStore } from "@/store/map-store";

type Status = "idle" | "searching" | "empty" | "error";

export function SearchBox() {
  const flyTo = useMapStore((s) => s.flyTo);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const listId = useId();

  const go = (r: GeocodeResult) => {
    setResults([]);
    setStatus("idle");
    flyTo({ lat: r.lat, lng: r.lng, marker: true });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const coords = parseLatLng(q);
    if (coords) {
      track({ name: "search_used", kind: "coordinates", resultCount: 1 });
      go({ ...coords, label: q });
      return;
    }
    if (q.length < 2) return;
    setStatus("searching");
    setResults([]);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as { results: GeocodeResult[] };
      track({ name: "search_used", kind: "place", resultCount: body.results.length });
      setResults(body.results);
      setStatus(body.results.length ? "idle" : "empty");
    } catch {
      setStatus("error");
    }
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    setStatus("idle");
  };

  const message =
    status === "searching"
      ? th.search.searching
      : status === "empty"
        ? th.search.noResults
        : status === "error"
          ? th.search.failed
          : null;

  return (
    <div className="fixed inset-x-0 top-0 z-30 p-2 md:top-3 md:left-3 md:right-auto md:w-80 md:p-0">
      <form
        role="search"
        onSubmit={onSubmit}
        className="flex overflow-hidden rounded-xl bg-white shadow-md"
      >
        <label htmlFor={`${listId}-input`} className="sr-only">
          {th.search.label}
        </label>
        <input
          id={`${listId}-input`}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={th.search.placeholder}
          aria-controls={results.length ? listId : undefined}
          className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-neutral-500 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            aria-label={th.search.clear}
            className="flex size-11 shrink-0 items-center justify-center text-neutral-500 hover:text-neutral-900 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600"
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
        )}
        <button
          type="submit"
          aria-label={th.search.submit}
          className="flex size-11 shrink-0 items-center justify-center bg-neutral-900 text-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-400"
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
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
        </button>
      </form>
      <div aria-live="polite">
        {message && (
          <p className="mt-2 rounded-xl bg-white px-3 py-2 text-base shadow-md">{message}</p>
        )}
      </div>
      {results.length > 0 && (
        <ul
          id={listId}
          aria-label={th.search.results}
          className="mt-2 max-h-[50dvh] overflow-y-auto rounded-xl bg-white shadow-md"
        >
          {results.map((r) => (
            <li
              key={`${r.lat},${r.lng},${r.label}`}
              className="border-b border-neutral-100 last:border-0"
            >
              <button
                type="button"
                onClick={() => go(r)}
                className="min-h-11 w-full px-3 py-2 text-left text-base hover:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600"
              >
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

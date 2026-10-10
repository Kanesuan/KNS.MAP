/** Replaces the query string without adding a history entry. */
export function replaceSearch(update: (search: string) => string): void {
  const next = update(window.location.search);
  if (next === window.location.search) return;
  window.history.replaceState(window.history.state, "", next + window.location.hash);
}

// Prints what a list of public URLs return (status, type, first bytes), so a
// source can be inspected from GitHub's runners before writing an ingest.
// Usage: node scripts/ingest/discover.mjs <url> [url ...]
for (const url of process.argv.slice(2)) {
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(30_000) });
    const type = res.headers.get("content-type") ?? "";
    const text = /json|html|xml|text/.test(type)
      ? await res.text()
      : `[${type}, ${(await res.arrayBuffer()).byteLength} bytes]`;
    console.log(`\n===== ${url}\nHTTP ${res.status} ${type}\n${text.slice(0, 6000)}`);
  } catch (err) {
    console.log(`\n===== ${url}\nERROR ${err.message}`);
  }
}

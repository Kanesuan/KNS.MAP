// Runs Lighthouse (mobile profile) against a URL and checks the brief's targets:
// Performance >= 80 and Accessibility >= 90 (docs/BRIEF.md section 7).
// Usage: node scripts/lighthouse.mjs <url> [runs=3]
// Set CHROME_PATH if Chrome is not on the default path.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const url = process.argv[2];
const runs = Number(process.argv[3] ?? 3);
if (!url) {
  console.error("usage: node scripts/lighthouse.mjs <url> [runs]");
  process.exit(1);
}
const TARGETS = { performance: 80, accessibility: 90 };
const dir = mkdtempSync(path.join(tmpdir(), "lh-"));
const results = [];
for (let i = 0; i < runs; i++) {
  const out = path.join(dir, `run${i}.json`);
  execFileSync(
    "npx",
    [
      "lighthouse",
      url,
      "--quiet",
      "--output=json",
      `--output-path=${out}`,
      "--only-categories=performance,accessibility,best-practices",
      "--chrome-flags=--headless=new --no-sandbox",
    ],
    { stdio: "ignore" },
  );
  const r = JSON.parse(readFileSync(out, "utf8"));
  const s = Object.fromEntries(
    Object.entries(r.categories).map(([k, c]) => [k, Math.round(c.score * 100)]),
  );
  results.push(s);
  console.log(
    `run ${i + 1}: ${JSON.stringify(s)} FCP ${r.audits["first-contentful-paint"].displayValue} LCP ${r.audits["largest-contentful-paint"].displayValue} TBT ${r.audits["total-blocking-time"].displayValue} SI ${r.audits["speed-index"].displayValue}`,
  );
}
const median = (k) =>
  results.map((r) => r[k]).sort((a, b) => a - b)[Math.floor(results.length / 2)];
let ok = true;
for (const [k, target] of Object.entries(TARGETS)) {
  const m = median(k);
  console.log(`${k}: median ${m} (target ${target}) ${m >= target ? "OK" : "BELOW TARGET"}`);
  if (m < target) ok = false;
}
process.exit(ok ? 0 : 1);

// Fails if a server-only secret ends up in the client bundle (.next/static).
// Run after `npm run build`. Reads the secret values from the environment or .env.local.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const NAMES = ["GISTDA_API_KEY"];
const env = { ...process.env };
if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m && !env[m[1]]) env[m[1]] = m[2];
  }
}

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) yield* files(p);
    else yield p;
  }
}

const root = ".next/static";
if (!existsSync(root)) {
  console.error("check:secrets: run `npm run build` first");
  process.exit(1);
}
const needles = NAMES.flatMap((n) => [n, env[n]].filter((v) => v && v.length >= 8));
const leaks = [];
for (const file of files(root)) {
  const text = readFileSync(file, "utf8");
  for (const needle of needles) if (text.includes(needle)) leaks.push(file);
}
if (leaks.length) {
  console.error(`check:secrets: secret found in client bundle:\n  ${[...new Set(leaks)].join("\n  ")}`);
  process.exit(1);
}
console.log(`check:secrets: no secrets in ${root} (checked ${needles.length} values)`);

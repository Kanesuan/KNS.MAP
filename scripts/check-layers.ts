// Fails (exit 1) when the layer registry is invalid, including any "live"
// layer whose licence is not confirmed for commercial use. Runs before build.
import { LAYERS } from "../src/layers/registry";
import { validateRegistry } from "../src/layers/validate";

const errors = validateRegistry(LAYERS);
if (errors.length > 0) {
  console.error(`check:layers failed with ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
const live = LAYERS.filter((l) => l.status === "live").length;
console.log(
  `check:layers: ${LAYERS.length} layers OK (${live} live, ${LAYERS.length - live} sample)`,
);

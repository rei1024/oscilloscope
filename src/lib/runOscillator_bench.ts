import { parseRLE } from "@ca-ts/rle";
import { runOscillator } from "./runOscillator";
import { parseRule } from "@ca-ts/rule";

const pattern = `#N cisfigureeightonpentadecathlon.rle
#C https://conwaylife.com/wiki/Figure_eight_on_pentadecathlon
#C https://www.conwaylife.com/patterns/cisfigureeightonpentadecathlon.rle
x = 14, y = 10, rule = B3/S23
bo6b2o$bo6b2obo$obo9bo$bo7bo$bo8bob2o$bo10b2o$bo$obo$bo$bo!`;

const start = performance.now();
runOscillator({
  cells: parseRLE(pattern).cells.map((x) => x.position),
  rule: parseRule("B3/S23"),
  maxGeneration: 10000,
});
const end = performance.now();

console.log(end - start);

// npx vite-node src/lib/runOscillator_bench.ts

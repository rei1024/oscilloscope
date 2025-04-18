import { analyzeOscillator } from "./analyzeOscillator";
import { parseRLE } from "@ca-ts/rle";
const str = `#N p60glidershuttle.rle
#C https://conwaylife.com/wiki/P60_glider_shuttle
#C https://conwaylife.com/patterns/p60glidershuttle.rle
x = 35, y = 7, rule = B3/S23
2bo4bo$2ob4ob2o$2bo4bo$16bo$17b2o8bo4bo$16b2o7b2ob4ob2o$27bo4bo!`;

const cells = parseRLE(str)
  .cells.filter((x) => x.state === 1)
  .map((x) => x.position);

const start = performance.now();
for (let i = 0; i < 50; i++) {
  const result = analyzeOscillator({
    cells,
    rule: {
      type: "outer-totalistic",
      transition: {
        birth: [3],
        survive: [2, 3],
      },
    },
    maxGeneration: 1000,
  });
}

const end = performance.now();
console.log(end - start);

// npx vite-node src/lib/analyzeOscillator_bench.ts

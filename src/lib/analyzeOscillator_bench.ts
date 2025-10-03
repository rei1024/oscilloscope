import { analyzeOscillator } from "./analyzeOscillator";
import { parseRLE } from "@ca-ts/rle";

const str = `#N p60glidershuttle.rle
#C https://conwaylife.com/wiki/P60_glider_shuttle
#C https://conwaylife.com/patterns/p60glidershuttle.rle
x = 35, y = 7, rule = B3/S23
2bo4bo$2ob4ob2o$2bo4bo$16bo$17b2o8bo4bo$16b2o7b2ob4ob2o$27bo4bo!`;

// from oscillator stamp collection 2023
const p15240 = `x = 151, y = 131, rule = B3/S23
117bo$117bobo$120b2o6b2o$106b2o12b2o4bo3bo$106b2o12b2o3bo5bo$117bobo4b
2obo3bo$117bo7bo5bo$126bo3bo$128b2o6$128b2o$128bobo5b3o$128bo6bo3bo$
134bo5bo$134bo5bo2$134bo$134b2o$134b2o$133b2o2bo$134bobo$135b2o3$132b
2o3b2o$132b2o3b2o2$134b3o$134b3o$135bo6$134b2o$134b2o9$39b2o$39b2o6$
21b2o$21b2o2$21bo$20bobo13b2o3b2o$20bobo$21bo15bo3bo$38b3o$38b3o$18b2o
bob2o$18bo5bo$19bo3bo$20b3o2$35bo5bo$34bo5b3o$34b3o3b3o2$38b2o3b2o$23b
o14b2o3b2o$24bo$22b3o4$38b2o$17b5o17bo$16bob3obo13b3o$17bo3bo14bo$18b
3o$19bo4$19b2o17bo$19b2o18bo$37b3o2$60b2o$59bobo$58b3o$58b2o$61b2o$60b
3o$47b3o$49bo$48bo11b2o$60b2o2$52bo$51bobobob2o$40b2o10b2ob2obo$39bobo
4b2o$41bo3b2o$47bo4$21b2o$19bo3bo5bo2b3o19bo$18bo5bo9bo3bo14b2o$17bo2b
o3bo8bo4bobo12bobo8bobo$24bo16b2o19bo3bo$15bo3bo3bo17b2o7b2o10bo12b2o$
14bob2o3b2o18b2o7bo2bo7bo4bo8b2o$14bo23bobo4b2o7bo7bo$4b2o7b2o23bo5bo
2bo6bo7bo3bo$3bobo39b2o7bo9bobo$3bo46bo2bo$2b2o46b2o!
`;

const cells = parseRLE(p15240)
  .cells.filter((x) => x.state === 1)
  .map((x) => x.position);

const start = performance.now();
for (let i = 0; i < 1; i++) {
  const result = analyzeOscillator({
    cells,
    rule: {
      type: "outer-totalistic",
      transition: {
        birth: [3],
        survive: [2, 3],
      },
    },
    maxGeneration: 50000,
  });
}

const end = performance.now();
console.log((end - start).toFixed(3) + " ms");

// npx vite-node src/lib/analyzeOscillator_bench.ts

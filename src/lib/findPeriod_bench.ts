import { findPeriod } from "./findPeriod";

const xs = Array(2000)
  .fill(0)
  .map((x, i) => i);

const start = performance.now();
for (let i = 0; i < 10000; i++) {
  findPeriod(xs);
}

const end = performance.now();
console.log(end - start);

// npx vite-node src/lib/findPeriod_bench.ts

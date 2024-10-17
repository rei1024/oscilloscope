import { BitGrid } from "@ca-ts/algo/bit";
import type { AnalyzeResult } from "./analyzeOscillator";
import { findPeriod } from "./findPeriod";

export function periodMap(data: AnalyzeResult) {
  const height = data.bitGridData.height ?? 0;
  const width = data.bitGridData.width ?? 0;
  const width32 = Math.ceil((data.bitGridData.width ?? 0) / 32);

  const array = Array(height)
    .fill(0)
    .map(() => 0)
    .map(() =>
      Array(width)
        .fill(0)
        .map(() => 0)
    );

  const or = new BitGrid(width32, height, data.bitGridData.or);

  const transposed: (0 | 1)[][][] = Array(height)
    .fill(0)
    .map(() => 0)
    .map(() =>
      Array(width)
        .fill(0)
        .map(() => [])
    );

  const histories = data.bitGridData.histories.map(
    (h) => new BitGrid(width32, height, h)
  );

  const historiesArray = histories.map((h) => h.getArray());

  or.forEachAlive((x, y) => {
    const states: (0 | 1)[] = [];
    for (const h of historiesArray) {
      states.push(h[y][x]);
    }
    array[y][x] = findPeriod(states);
  });

  return array;
}

export function periodMapUnique(periodMap: number[][]): number[] {
  const set = new Set(periodMap.flat());
  return [...set].sort((a, b) => a - b);
}

import type { BitGrid } from "@ca-ts/algo/bit";
import { bitGridFromData, type AnalyzeResult } from "./analyzeOscillator";
import { findPeriod } from "./findPeriod";

export function periodMap({
  width,
  height,
  or,
  histories,
}: {
  width: number;
  height: number;
  or: BitGrid;
  histories: BitGrid[];
}) {
  const array = Array(height)
    .fill(0)
    .map(() => 0)
    .map(() =>
      Array(width)
        .fill(0)
        .map(() => 0)
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

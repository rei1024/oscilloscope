import type { BitGrid } from "@ca-ts/algo/bit";
import { findPeriod } from "./findPeriod";

export function getMap({
  width,
  height,
  or,
  histories,
}: {
  width: number;
  height: number;
  or: BitGrid;
  histories: BitGrid[];
}): {
  periodMap: { data: number[][]; list: number[] };
  frequencyMap: { data: number[][]; list: number[] };
} {
  const periodArray = Array(height)
    .fill(0)
    .map(() => 0)
    .map(() =>
      Array(width)
        .fill(0)
        .map(() => 0)
    );

  const frequencyArray = Array(height)
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
      const cell = h[y][x];
      states.push(cell);
      if (cell !== 0) {
        frequencyArray[y][x]++;
      }
    }
    periodArray[y][x] = findPeriod(states);
  });

  return {
    periodMap: {
      data: periodArray,
      list: mapUnique(periodArray),
    },
    frequencyMap: {
      data: frequencyArray,
      list: mapUnique(frequencyArray),
    },
  };
}

function mapUnique(periodMap: number[][]): number[] {
  const set = new Set(periodMap.flat());
  return [...set].sort((a, b) => a - b);
}

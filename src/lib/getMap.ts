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
  periodMap: {
    data: number[][];
    list: number[];
    countMap: Map<number, number>;
  };
  frequencyMap: {
    data: number[][];
    list: number[];
    countMap: Map<number, number>;
  };
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

  const periodCountMap = getCountMap(periodArray);
  periodCountMap.delete(0);

  const frequencyCountMap = getCountMap(frequencyArray);
  frequencyCountMap.delete(0);

  return {
    periodMap: {
      data: periodArray,
      list: mapUnique(periodArray).filter((x) => x !== 0),
      countMap: periodCountMap,
    },
    frequencyMap: {
      data: frequencyArray,
      list: mapUnique(frequencyArray).filter((x) => x !== 0),
      countMap: frequencyCountMap,
    },
  };
}

function mapUnique(map: number[][]): number[] {
  const set = new Set(map.flat());
  return [...set].sort((a, b) => a - b);
}

function getCountMap(map: number[][]): Map<number, number> {
  const countMap = new Map<number, number>();
  for (const row of map) {
    for (const x of row) {
      const currentCount = countMap.get(x);
      if (currentCount !== undefined) {
        countMap.set(x, currentCount + 1);
      } else {
        countMap.set(x, 1);
      }
    }
  }

  return countMap;
}

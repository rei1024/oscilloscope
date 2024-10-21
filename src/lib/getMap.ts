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
  heatMap: {
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

  const heatArray = Array(height)
    .fill(0)
    .map(() => 0)
    .map(() =>
      Array(width)
        .fill(0)
        .map(() => -1)
    );

  const historiesArray = histories.map((h) => h.getArray());

  or.forEachAlive((x, y) => {
    const states: (0 | 1)[] = [];
    let heat = 0;
    let prevCell = historiesArray[0]?.[y][x];
    for (const h of historiesArray) {
      const cell = h[y][x];
      if (prevCell !== undefined && prevCell !== cell) {
        heat++;
      }
      prevCell = cell;
      states.push(cell);
      if (cell !== 0) {
        frequencyArray[y][x]++;
      }
    }

    if (
      historiesArray.length !== 0 &&
      historiesArray[0][y][x] !==
        historiesArray[historiesArray.length - 1][y][x]
    ) {
      heat++;
    }
    heatArray[y][x] = heat;
    periodArray[y][x] = findPeriod(states);
  });

  const periodCountMap = getCountMap(periodArray);
  periodCountMap.delete(0);

  const frequencyCountMap = getCountMap(frequencyArray);
  frequencyCountMap.delete(0);

  const heatCountMap = getCountMap(heatArray);
  heatCountMap.delete(-1);

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
    heatMap: {
      data: heatArray,
      list: mapUnique(heatArray).filter((x) => x !== -1),
      countMap: heatCountMap,
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

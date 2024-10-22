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

  const firstBitGrid = histories[0];
  if (firstBitGrid === undefined) {
    throw new Error("no history");
  }
  const firstBitGridUint32Array = firstBitGrid.asInternalUint32Array();
  const orUint32Array = or.asInternalUint32Array();

  {
    function getAlive(array: Uint32Array, offset: number, u: number): 0 | 1 {
      const value = array[offset]!;
      const alive = (value & (1 << (BITS_MINUS_1 - u))) !== 0 ? 1 : 0;
      return alive;
    }

    const width = firstBitGrid.getWidth32();
    const height = firstBitGrid.getHeight();
    const BITS = 32;
    const BITS_MINUS_1 = BITS - 1;
    for (let i = 0; i < height; i++) {
      const rowIndex = i * width;
      for (let j = 0; j < width; j++) {
        const offset = rowIndex + j;
        const BITS_J = j * BITS;
        for (let u = 0; u < BITS; u++) {
          if (getAlive(orUint32Array, offset, u) === 0) {
            continue;
          }

          const x = BITS_J + u;
          const y = i;

          const states: (0 | 1)[] = [];
          let heat = 0;
          const firstCell = getAlive(firstBitGridUint32Array, offset, u);
          let prevCell = firstCell;
          for (const h of histories) {
            const array = h.asInternalUint32Array();
            const cell = getAlive(array, offset, u);
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
            histories.length !== 0 &&
            firstCell !==
              getAlive(
                histories[histories.length - 1].asInternalUint32Array(),
                offset,
                u
              )
          ) {
            heat++;
          }
          heatArray[y][x] = heat;
          periodArray[y][x] = findPeriod(states);
        }
      }
    }
  }

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

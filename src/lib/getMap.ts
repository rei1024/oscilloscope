import type { BitGrid } from "@ca-ts/algo/bit";
import { findPeriodUint8 } from "./findPeriod";
import { BITS, BITS_MINUS_1 } from "./const";
import { max, min } from "./collection";

// reduce allocation
let statesAlloc = new Uint8Array();

export type MapData<T> = {
  readonly data: ReadonlyArray<ReadonlyArray<T>>;
  /**
   * index to a value
   */
  readonly list: T[];
  /**
   * -1 for background cell
   */
  readonly indexData: number[][];
  readonly valueToIndexMap: ReadonlyMap<T, number>;
  readonly countMap: ReadonlyMap<T, number>;
};

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
  periodMap: MapData<number>;
  frequencyMap: MapData<number>;
  heatMap: MapData<number>;
  heatInfo: {
    max: number;
    min: number;
  };
} {
  const periodArray = Array(height)
    .fill(0)
    .map(() => 0)
    .map(() =>
      Array(width)
        .fill(0)
        .map(() => 0),
    );

  const frequencyArray = Array(height)
    .fill(0)
    .map(() => 0)
    .map(() =>
      Array(width)
        .fill(0)
        .map(() => 0),
    );

  const heatArray = Array(height)
    .fill(0)
    .map(() => 0)
    .map(() =>
      Array(width)
        .fill(0)
        .map(() => -1),
    );

  // indexed by generations
  const heatByGeneration: number[] = Array(histories.length)
    .fill(0)
    .map(() => 0);

  const firstBitGrid = histories[0];
  if (firstBitGrid === undefined) {
    throw new Error("no history");
  }
  const firstBitGridUint32Array = firstBitGrid.asInternalUint32Array();
  const orUint32Array = or.asInternalUint32Array();

  {
    const width = firstBitGrid.getWidth32();
    const height = firstBitGrid.getHeight();

    // reuse array
    statesAlloc = new Uint8Array(histories.length);

    const lenHistories = histories.length;

    for (let i = 0; i < height; i++) {
      const rowIndex = i * width;
      const y = i;

      const heatArrayRow = heatArray[y];
      const periodArrayRow = periodArray[y];
      const frequencyArrayRow = frequencyArray[y];

      for (let j = 0; j < width; j++) {
        const offset = rowIndex + j;
        // skip if empty
        if (orUint32Array[offset] === 0) {
          continue;
        }
        const BITS_J = j * BITS;
        for (let u = 0; u < BITS; u++) {
          // skip if dead
          if (getAlive(orUint32Array, offset, u) === 0) {
            continue;
          }

          const x = BITS_J + u;

          let heat = 0;
          const firstCell = getAlive(firstBitGridUint32Array, offset, u);
          let prevCell = firstCell;
          let frequency = 0;
          for (let index = 0; index < lenHistories; index++) {
            const array = histories[index].asInternalUint32Array();
            const cell = getAlive(array, offset, u);
            if (/* prevCell !== undefined && */ prevCell !== cell) {
              heat++;
              heatByGeneration[index]++;
            }
            prevCell = cell;
            statesAlloc[index] = cell;

            if (cell !== 0) {
              frequency++;
            }
          }

          if (
            firstCell !==
            getAlive(
              histories[histories.length - 1]!.asInternalUint32Array(),
              offset,
              u,
            )
          ) {
            heat++;
            heatByGeneration[0]++;
          }

          const periodOfCell = findPeriodUint8(statesAlloc);
          heatArrayRow[x] = heat;
          periodArrayRow[x] = periodOfCell;
          frequencyArrayRow[x] = frequency;
        }
      }
    }
  }

  return {
    periodMap: getMapData(periodArray, 0),
    frequencyMap: getMapData(frequencyArray, 0),
    heatMap: getMapData(heatArray, -1),
    heatInfo: {
      min: min(heatByGeneration),
      max: max(heatByGeneration),
    },
  };
}

export function getAlive(array: Uint32Array, offset: number, u: number): 0 | 1 {
  const value = array[offset]!;
  const alive = (value & (1 << (BITS_MINUS_1 - u))) !== 0 ? 1 : 0;
  return alive;
}

export function getMapData<T>(
  data: ReadonlyArray<ReadonlyArray<T>>,
  background: T,
): MapData<T> {
  const countMap = getCountMap(data);
  countMap.delete(background);

  const list = [...countMap.keys()].sort((a, b) =>
    a > b ? 1 : a === b ? 0 : -1,
  );

  const valueToIndexMap = new Map<T, number>();

  for (const [i, value] of list.entries()) {
    valueToIndexMap.set(value, i);
  }

  const indexData = data.map((row) =>
    row.map((value) => valueToIndexMap.get(value) ?? -1),
  );

  return {
    data,
    valueToIndexMap,
    indexData,
    list,
    countMap,
  };
}

export function getCountMap<T>(
  map: ReadonlyArray<ReadonlyArray<T>>,
): Map<T, number> {
  const countMap = new Map<T, number>();
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

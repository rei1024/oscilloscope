import type { BitGrid } from "@ca-ts/algo/bit";
import { findPeriodUint8 } from "./findPeriod";
import { BITS, BITS_MINUS_1 } from "./const";
import { rotateLeftBigInt } from "../util/rotate";
import { max, min } from "./collection";

// reduce allocation
let statesAlloc = new Uint8Array();

export function getMap({
  width,
  height,
  or,
  histories,
  withSignatureMap,
}: {
  width: number;
  height: number;
  or: BitGrid;
  histories: BitGrid[];
  withSignatureMap: boolean;
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
  signatureMap: {
    data: bigint[][];
    list: bigint[];
    countMap: Map<bigint, number>;
  } | null;
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

  const signatureArray = Array(height)
    .fill(0)
    .map(() => 0)
    .map(() =>
      Array(width)
        .fill(0)
        .map(() => 0n),
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

    // Use a Set for fast O(1) checking of unique signatures
    const signatureSet = new Set<bigint>();

    const lenHistories = histories.length;

    for (let i = 0; i < height; i++) {
      const rowIndex = i * width;
      const y = i;

      const heatArrayRow = heatArray[y];
      const periodArrayRow = periodArray[y];
      const frequencyArrayRow = frequencyArray[y];
      const signatureArrayRow = signatureArray[y];

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
          let signature = 0n;
          for (let index = 0; index < lenHistories; index++) {
            const array = histories[index].asInternalUint32Array();
            const cell = getAlive(array, offset, u);
            if (/* prevCell !== undefined && */ prevCell !== cell) {
              heat++;
              heatByGeneration[index]++;
            }
            prevCell = cell;
            statesAlloc[index] = cell;
            if (withSignatureMap) {
              signature <<= 1n;
            }

            if (cell !== 0) {
              frequency++;
              if (withSignatureMap) {
                signature |= 1n;
              }
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

          if (withSignatureMap) {
            const canonicalSignature = getCanonicalSignature(
              signature,
              lenHistories,
              periodOfCell,
            );

            // Use the canonical form for storage and uniqueness check
            signatureArrayRow[x] = canonicalSignature;
            signatureSet.add(canonicalSignature);
          }
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

  const signatureMap = withSignatureMap
    ? getCountMap(signatureArray)
    : new Map<bigint, number>();
  signatureMap.delete(0n);

  return {
    periodMap: {
      data: periodArray,
      list: [...periodCountMap.keys()].sort((a, b) => a - b),
      countMap: periodCountMap,
    },
    frequencyMap: {
      data: frequencyArray,
      list: [...frequencyCountMap.keys()].sort((a, b) => a - b),
      countMap: frequencyCountMap,
    },
    heatMap: {
      data: heatArray,
      list: [...heatCountMap.keys()].sort((a, b) => a - b),
      countMap: heatCountMap,
    },
    signatureMap: withSignatureMap
      ? {
          data: signatureArray,
          list: [...signatureMap.keys()].sort((a, b) =>
            a > b ? 1 : a === b ? 0 : -1,
          ),
          countMap: signatureMap,
        }
      : null,
    heatInfo: {
      min: min(heatByGeneration),
      max: max(heatByGeneration),
    },
  };
}

function getAlive(array: Uint32Array, offset: number, u: number): 0 | 1 {
  const value = array[offset]!;
  const alive = (value & (1 << (BITS_MINUS_1 - u))) !== 0 ? 1 : 0;
  return alive;
}

function getCountMap<T>(map: T[][]): Map<T, number> {
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

function getCanonicalSignature(
  signature: bigint,
  lenHistories: number,
  periodOfCell: number,
): bigint {
  let canonical = signature;
  const len = BigInt(lenHistories);

  // We only need to check shifts up to the true period P (since shift P = shift 0).
  const maxShift = Math.min(periodOfCell, lenHistories);

  for (let shift = 1; shift < maxShift; shift++) {
    const rotated = rotateLeftBigInt(signature, len, BigInt(shift));
    if (rotated < canonical) {
      canonical = rotated;
    }
  }
  return canonical;
}

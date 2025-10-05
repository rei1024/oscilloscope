import type { BitGrid } from "@ca-ts/algo/bit";
import { BITS } from "./const";
import { rotateLeftBigInt } from "../util/rotate";
import { getAlive, getMapData, type MapData } from "./getMap";

export function getSignatureMap({
  width,
  height,
  or,
  histories,
  periodMapArray,
}: {
  width: number;
  height: number;
  or: BitGrid;
  histories: BitGrid[];
  periodMapArray: ReadonlyArray<ReadonlyArray<number>>;
}): {
  signatureMap: MapData<bigint>;
  signatureTimeMilliseconds: number;
} {
  const startTime = performance.now();
  const signatureArray = Array(height)
    .fill(0)
    .map(() => 0)
    .map(() =>
      Array(width)
        .fill(0)
        .map(() => 0n),
    );

  const firstBitGrid = histories[0];
  if (firstBitGrid === undefined) {
    throw new Error("no history");
  }
  const orUint32Array = or.asInternalUint32Array();

  {
    const width = firstBitGrid.getWidth32();
    const height = firstBitGrid.getHeight();

    const lenHistories = histories.length;

    for (let i = 0; i < height; i++) {
      const rowIndex = i * width;
      const y = i;
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

          let signature = 0n;
          for (let index = 0; index < lenHistories; index++) {
            const array = histories[index].asInternalUint32Array();
            const cell = getAlive(array, offset, u);

            signature <<= 1n;

            if (cell !== 0) {
              signature |= 1n;
            }
          }

          const periodOfCell = periodMapArray[y][x];

          const canonicalSignature = getCanonicalSignature(
            signature,
            lenHistories,
            periodOfCell,
          );

          // Use the canonical form for storage and uniqueness check
          signatureArrayRow[x] = canonicalSignature;
        }
      }
    }
  }

  const endTime = performance.now();

  return {
    signatureMap: getMapData(signatureArray, 0n),
    signatureTimeMilliseconds: endTime - startTime,
  };
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

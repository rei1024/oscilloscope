import { average, max, median, min } from "./collection";
import { rectToSize } from "./rect";
import { BitGrid } from "@ca-ts/algo/bit";
import { WorldSizeError, WorldWithHistory } from "./WorldWithHistory";

function getOrAndGrid(histories: BitGrid[]) {
  if (histories.length === 0) {
    throw Error("Error");
  }

  const orGrid = histories[0].clone();
  orGrid.clear();
  // orは空白から開始

  const andGrid = histories[0].clone();
  // andは1つ目の状態

  for (const bitGird of histories) {
    orGrid.bitOr(bitGird);
    andGrid.bitAnd(bitGird);
  }

  return {
    or: orGrid,
    and: andGrid,
  };
}

export type AnalyzeResult = {
  period: number;
  population: {
    max: number;
    min: number;
    avg: string;
    median: number;
  };
  boundingBox: {
    sizeX: number;
    sizeY: number;
  };
  stator: number;
  rotor: number;
  volatility: string;
  bitGridData: {
    histories: Uint32Array[];
    width: number | null;
    height: number | null;
    minX: number;
    minY: number;
    or: Uint32Array;
    and: Uint32Array;
  };
};

export function analyzeOscillator(
  cells: { x: number; y: number }[],
  transition: { birth: number[]; survive: number[] },
  { maxGeneration }: { maxGeneration: number }
): AnalyzeResult {
  let bufferSize = 32;
  for (let i = 0; i < 5; i++) {
    try {
      const world = new WorldWithHistory({ cells, bufferSize, transition });
      world.run({ forceStop: () => world.getGen() >= maxGeneration });

      const period = world.getGen();
      const populations = world.histories.map((h) => h.bitGrid.getPopulation());
      const { or, and } = getOrAndGrid(world.histories.map((h) => h.bitGrid));
      const stator = and.getPopulation();
      const allCount = or.getPopulation();
      const rotor = allCount - stator;
      const boundingBox = or.getBoundingBox();
      return {
        period,
        population: {
          max: max(populations),
          min: min(populations),
          avg: average(populations).toFixed(2),
          median: median(populations),
        },
        boundingBox: rectToSize(boundingBox),
        stator: stator,
        rotor: allCount - stator,
        volatility: (rotor / (stator + rotor)).toFixed(2),
        bitGridData: {
          histories: world.histories.map((a) =>
            a.bitGrid.asInternalUint32Array()
          ),
          width: world.histories[0]?.bitGrid.getWidth() ?? null,
          height: world.histories[0]?.bitGrid.getHeight() ?? null,
          minX: boundingBox.minX,
          minY: boundingBox.minY,
          or: or.asInternalUint32Array(),
          and: or.asInternalUint32Array(),
        },
      };
    } catch (error) {
      if (error instanceof WorldSizeError) {
        bufferSize += 32;
      } else {
        throw error;
      }
    }
  }

  throw new Error("Error: analyzeOscillator");
}

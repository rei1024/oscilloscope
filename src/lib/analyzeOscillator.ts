import { average, max, median, min } from "./collection";
import { rectToSize } from "./rect";
import { BitGrid } from "@ca-ts/algo/bit";
import { runOscillator, type RunOscillatorConfig } from "./runOscillator";
import { getMap } from "./getMap";

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

type BitGridData = {
  uint32: Uint32Array;
  width32: number;
  height: number;
};

export type AnalyzeResult = {
  period: number;
  population: {
    /** Maximum population */
    max: number;
    /** Minimum population */
    min: number;
    /** Average population */
    avg: string;
    /** Median of population */
    median: number;
  };
  /**
   * Bounding box
   */
  boundingBox: {
    sizeX: number;
    sizeY: number;
  };
  /**
   * Number of stators
   */
  stator: number;
  /**
   * Number of rotors
   */
  rotor: number;
  /**
   * Oscillator valatility
   */
  volatility: string;
  histories: BitGridData[];
  bitGridData: {
    width: number;
    height: number;
    minX: number;
    minY: number;
    or: BitGridData;
    and: BitGridData;
  };
  /**
   * [Period map](https://conwaylife.com/wiki/Map#Period_map)
   */
  periodMap: {
    /**
     * Period of each cells
     */
    data: number[][];
    list: number[];
  };
  /**
   * [Frequency map](https://conwaylife.com/wiki/Map#Frequency_map)
   */
  frequencyMap: {
    data: number[][];
    list: number[];
  };
};

export function bitGridToData(bitGrid: BitGrid): BitGridData {
  return {
    uint32: bitGrid.asInternalUint32Array(),
    width32: bitGrid.getWidth32(),
    height: bitGrid.getHeight(),
  };
}

export function bitGridFromData(bitGridData: BitGridData): BitGrid {
  return new BitGrid(
    bitGridData.width32,
    bitGridData.height,
    bitGridData.uint32
  );
}

export function analyzeOscillator(
  runConfig: RunOscillatorConfig
): AnalyzeResult {
  const { world } = runOscillator(runConfig);

  const period = world.getGen();
  const populations = world.histories.map((h) => h.bitGrid.getPopulation());
  const { or, and } = getOrAndGrid(world.histories.map((h) => h.bitGrid));
  const stator = and.getPopulation();
  const allCount = or.getPopulation();
  const rotor = allCount - stator;
  const boundingBox = or.getBoundingBox();

  const width = world.histories[0]?.bitGrid.getWidth() ?? 0;
  const height = world.histories[0]?.bitGrid.getHeight() ?? 0;

  const { periodMap, frequencyMap } = getMap({
    width,
    height,
    or,
    histories: world.histories.map((x) => x.bitGrid),
  });

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
    volatility: (rotor / (stator + rotor)).toFixed(3),
    histories: world.histories.map((a) => bitGridToData(a.bitGrid)),
    bitGridData: {
      or: bitGridToData(or),
      and: bitGridToData(and),
      width,
      height,
      minX: boundingBox.minX,
      minY: boundingBox.minY,
    },
    periodMap,
    frequencyMap,
  };
}

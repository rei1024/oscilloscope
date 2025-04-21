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
  /**
   * Period
   */
  period: number;
  population: {
    /** Maximum population */
    max: number;
    /** Minimum population */
    min: number;
    /** Average population */
    avg: number;
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
  volatility: number;
  /**
   * Oscillator strict valatility
   */
  strictVolatility: number;
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
   * [Heat](https://conwaylife.com/wiki/Heat)
   */
  heat: number;
  /**
   * [Temperature](https://conwaylife.com/wiki/Temperature)
   */
  temperature: number;
  /**
   * [Period map](https://conwaylife.com/wiki/Map#Period_map)
   */
  periodMap: {
    /**
     * Period of each cells
     *
     * 0 for the empty cell
     */
    data: number[][];
    list: number[];
    countMap: Map<number, number>;
  };
  /**
   * [Frequency map](https://conwaylife.com/wiki/Map#Frequency_map)
   */
  frequencyMap: {
    /**
     * 0 for the empty cell
     */
    data: number[][];
    list: number[];
    countMap: Map<number, number>;
  };
  heatMap: {
    /**
     * -1 for the empty cell
     */
    data: number[][];
    list: number[];
    countMap: Map<number, number>;
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
    bitGridData.uint32,
  );
}

export function analyzeOscillator(
  runConfig: RunOscillatorConfig,
): AnalyzeResult {
  const { world } = runOscillator(runConfig);

  const period = world.getGen();
  const historiesBitGrid = world.histories.map((h) => h.bitGrid);
  const populations = historiesBitGrid.map((bitGrid) =>
    bitGrid.getPopulation(),
  );
  const { or, and } = getOrAndGrid(historiesBitGrid);
  const stator = and.getPopulation();
  const allCount = or.getPopulation();
  const rotor = allCount - stator;
  const boundingBox = or.getBoundingBox();

  const width = world.histories[0]?.bitGrid.getWidth() ?? 0;
  const height = world.histories[0]?.bitGrid.getHeight() ?? 0;

  const { periodMap, frequencyMap, heatMap } = getMap({
    width,
    height,
    or,
    histories: historiesBitGrid,
  });

  const heat =
    heatMap.data.flat().reduce((acc, x) => (x === -1 ? acc : acc + x), 0) /
    period;

  return {
    period,
    population: {
      max: max(populations),
      min: min(populations),
      avg: average(populations),
      median: median(populations),
    },
    boundingBox: rectToSize(boundingBox),
    stator: stator,
    rotor: allCount - stator,
    volatility: rotor / (stator + rotor),
    strictVolatility: (periodMap.countMap.get(period) ?? 0) / allCount,
    histories: historiesBitGrid.map((bitGrid) => bitGridToData(bitGrid)),
    bitGridData: {
      or: bitGridToData(or),
      and: bitGridToData(and),
      width,
      height,
      minX: boundingBox.minX,
      minY: boundingBox.minY,
    },
    heat,
    temperature: heat / allCount,
    periodMap,
    frequencyMap,
    heatMap,
  };
}

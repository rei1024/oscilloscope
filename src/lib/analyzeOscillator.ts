import { average, max, median, min } from "./collection";
import { rectToArea, rectToSize } from "./rect";
import { BitGrid } from "@ca-ts/algo/bit";
import { runOscillator, type RunOscillatorConfig } from "./runOscillator";
import { getMap, type MapData } from "./getMap";

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

export type BitGridData = {
  uint32: Uint32Array;
  width32: number;
  height: number;
};

export type AnalyzeResult = {
  /**
   * is a spaceship
   */
  isSpaceship: boolean;
  /**
   * Speed of a spaceship
   */
  speed: {
    /**
     * may be negative
     */
    dx: number;
    dy: number;
  };
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
   * The bounding box that encloses all phases
   */
  boundingBoxMovingEncloses: {
    sizeX: number;
    sizeY: number;
  };
  boundingBoxMinArea: {
    // FIXME: different from LifeViewer?
    tick: number;
    size: {
      sizeX: number;
      sizeY: number;
    };
  };
  boundingBoxMaxArea: {
    tick: number;
    size: {
      sizeX: number;
      sizeY: number;
    };
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
  heatMin: number;
  heatMax: number;
  /**
   * [Temperature](https://conwaylife.com/wiki/Temperature)
   */
  temperature: number;
  /**
   * Rotor temperature
   */
  rotorTemperature: number;
  /**
   * [Period map](https://conwaylife.com/wiki/Map#Period_map)
   *
   * 0 for the empty cell
   */
  periodMap: MapData<number>;
  /**
   * [Frequency map](https://conwaylife.com/wiki/Map#Frequency_map)
   *
   * 0 for the empty cell
   */
  frequencyMap: MapData<number>;
  /**
   * Heat map
   *
   *  -1 for the empty cell
   */
  heatMap: MapData<number>;
  /**
   * For omnifrequency
   *
   * [The Omnifrequency Project | Forum](https://conwaylife.com/forums/viewtopic.php?f=2&t=7026)
   */
  missingFrequencies: number[];
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

function getSpeed(
  firstBitGrid: BitGrid,
  lastBitGrid: BitGrid,
): { dx: number; dy: number } {
  const { x: x0, y: y0 } = firstBitGrid.getTopRowLeftCellPosition()!;
  const { x: x1, y: y1 } = lastBitGrid.getTopRowLeftCellPosition()!;

  return {
    dx: x1 - x0,
    dy: y1 - y0,
  };
}

export type AnalyzeOscillatorConfig = {};

/**
 * Analyze an oscillator or a spaceship.
 */
export function analyzeOscillator(
  runConfig: RunOscillatorConfig,
  analyzeConfig?: AnalyzeOscillatorConfig,
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

  const speed = getSpeed(historiesBitGrid[0]!, world.getLastBitGrid()!);

  const isSpaceship = speed.dx !== 0 || speed.dy !== 0;

  const width = historiesBitGrid[0]!.getWidth();
  const height = historiesBitGrid[0]!.getHeight();

  const { periodMap, frequencyMap, heatMap, heatInfo } = getMap({
    width,
    height,
    or,
    histories: historiesBitGrid,
  });

  const heat =
    heatMap.data.flat().reduce((acc, x) => (x === -1 ? acc : acc + x), 0) /
    period;

  let minArea = Infinity;
  let minBoxInfo: {
    tick: number;
    size: { sizeX: number; sizeY: number };
  } | null = null;
  let maxBoxInfo: {
    tick: number;
    size: { sizeX: number; sizeY: number };
  } | null = null;
  let maxArea = -Infinity;
  let maxSizeX = 0;
  let maxSizeY = 0;
  for (const [i, grid] of historiesBitGrid.entries()) {
    const boundingBoxPhase = grid.getBoundingBox();
    const size = rectToSize(boundingBoxPhase);
    if (maxSizeX < size.sizeX) {
      maxSizeX = size.sizeX;
    }
    if (maxSizeY < size.sizeY) {
      maxSizeY = size.sizeY;
    }
    const area = rectToArea(boundingBoxPhase);

    if (area < minArea) {
      minBoxInfo = {
        tick: i,
        size,
      };
      minArea = area;
    }
    if (area > maxArea) {
      maxBoxInfo = {
        tick: i,
        size,
      };
      maxArea = area;
    }
  }

  return {
    isSpaceship,
    speed,
    period,
    population: {
      max: max(populations),
      min: min(populations),
      avg: average(populations),
      median: median(populations),
    },
    boundingBox: rectToSize(boundingBox),
    boundingBoxMovingEncloses: {
      sizeX: maxSizeX,
      sizeY: maxSizeY,
    },
    boundingBoxMaxArea: maxBoxInfo!,
    boundingBoxMinArea: minBoxInfo!,
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
    heatMax: heatInfo.max,
    heatMin: heatInfo.min,
    temperature: heat / allCount,
    rotorTemperature: heat / rotor,
    periodMap,
    frequencyMap,
    heatMap,
    missingFrequencies: getMissingFrequencies(frequencyMap.list, period),
  };
}

function getMissingFrequencies(
  frequencyList: number[],
  period: number,
): number[] {
  if (frequencyList.length === period) {
    return [];
  }

  const set = new Set(frequencyList);

  const missingFrequencies = Array(period)
    .fill(0)
    .map((_, i) => i + 1)
    .filter((f) => !set.has(f));

  return missingFrequencies;
}

import { describe, it, expect } from "vitest";
import { analyzeOscillator } from "./analyzeOscillator";
import { parseRLE } from "@ca-ts/rle";
import { CACellList } from "@ca-ts/pattern";

describe("analyzeOscillator", () => {
  it("analyze blinker", () => {
    const result = analyzeOscillator({
      cells: parseRLE(`ooo`)
        .cells.filter((x) => x.state === 1)
        .map((x) => x.position),
      rule: {
        type: "outer-totalistic",
        transition: {
          birth: [3],
          survive: [2, 3],
        },
      },
      maxGeneration: 1000,
    });

    expect(result.period).toEqual(2);
    expect(result.volatility).toEqual(0.8);
    expect(result.stator).toEqual(1);
    expect(result.rotor).toEqual(4);
    expect(result.strictVolatility).toEqual(0.8);
    expect(result.boundingBox).toEqual({ sizeX: 3, sizeY: 3 });
    expect(result.population).toEqual({
      min: 3,
      max: 3,
      avg: 3,
      median: 3,
    });

    expect(result.heat).toEqual(4);
    expect(result.temperature).toEqual(0.8);

    // HACK
    expect(
      CACellList.from2dArray(result.periodMap.data).to2dArray()?.array,
    ).toEqual([
      [0, 2, 0],
      [2, 1, 2],
      [0, 2, 0],
    ]);

    expect(
      CACellList.from2dArray(result.frequencyMap.data).to2dArray()?.array,
    ).toEqual([
      [0, 1, 0],
      [1, 2, 1],
      [0, 1, 0],
    ]);

    expect(
      result.heatMap.data
        .filter((row) => !row.every((c) => c === -1))
        .map((row) => row.slice(15, 18)),
    ).toEqual([
      [-1, 2, -1],
      [2, 0, 2],
      [-1, 2, -1],
    ]);
  });

  it("analyze Kok's galaxy", () => {
    const result = analyzeOscillator({
      cells: parseRLE(`x = 9, y = 9, rule = 23/3
2bo2bobob$2obob3ob$bo6bo$2o5bob2$bo5b2o$o6bob$b3obob2o$bobo2bo!`)
        .cells.filter((x) => x.state === 1)
        .map((x) => x.position),
      rule: {
        type: "outer-totalistic",
        transition: {
          birth: [3],
          survive: [2, 3],
        },
      },
      maxGeneration: 1000,
    });

    expect(result.period).toEqual(8);
    expect(result.volatility).toEqual(1);
    expect(result.stator).toEqual(0);
    expect(result.rotor).toEqual(116);
    expect(result.strictVolatility).toEqual(1);
    expect(result.boundingBox).toEqual({ sizeX: 13, sizeY: 13 });
    expect(result.population).toEqual({
      min: 28,
      max: 64,
      avg: 41,
      median: 38,
    });

    expect(result.heat).toEqual(39);
    expect(result.temperature.toFixed(2)).toEqual("0.34");
  });

  it("analyze p60 shuttle", () => {
    const str = `#N p60glidershuttle.rle
#C https://conwaylife.com/wiki/P60_glider_shuttle
#C https://conwaylife.com/patterns/p60glidershuttle.rle
x = 35, y = 7, rule = B3/S23
2bo4bo$2ob4ob2o$2bo4bo$16bo$17b2o8bo4bo$16b2o7b2ob4ob2o$27bo4bo!`;

    const result = analyzeOscillator({
      cells: parseRLE(str)
        .cells.filter((x) => x.state === 1)
        .map((x) => x.position),
      rule: {
        type: "outer-totalistic",
        transition: {
          birth: [3],
          survive: [2, 3],
        },
      },
      maxGeneration: 1000,
    });

    expect(result.period).toEqual(60);
    expect(result.volatility).toEqual(1);
    expect(result.strictVolatility.toFixed(2)).toEqual("0.30");
    expect(result.boundingBox).toEqual({ sizeX: 41, sizeY: 13 });
    expect(result.population).toEqual({
      min: 29,
      max: 85,
      avg: 47,
      median: 45,
    });

    expect(result.heat.toFixed(2)).toEqual("49.07");
    expect(result.temperature.toFixed(2)).toEqual("0.22");
  });
});

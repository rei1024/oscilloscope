import { describe, it, expect } from "vitest";
import { analyzeOscillator } from "./analyzeOscillator";
import { parseRLE } from "@ca-ts/rle";
import { CACellList } from "@ca-ts/pattern";
import { parseRule } from "@ca-ts/rule";

const conwayLife = {
  type: "outer-totalistic" as const,
  transition: {
    birth: [3],
    survive: [2, 3],
  },
};

function rleToCells(rle: string) {
  return parseRLE(rle)
    .cells.filter((x) => x.state === 1)
    .map((x) => x.position);
}

describe("analyzeOscillator", () => {
  it("analyze block", () => {
    const result = analyzeOscillator({
      cells: rleToCells(`2o$2o`),
      rule: conwayLife,
      maxGeneration: 1,
    });

    expect(result.period).toEqual(1);
    expect(result.volatility).toEqual(0);
    expect(result.stator).toEqual(4);
    expect(result.rotor).toEqual(0);
    expect(result.strictVolatility).toEqual(1);
    expect(result.boundingBox).toEqual({ sizeX: 2, sizeY: 2 });
    expect(result.population).toEqual({
      min: 4,
      max: 4,
      avg: 4,
      median: 4,
    });

    expect(result.heat).toEqual(0);
    expect(result.temperature).toEqual(0);
  });

  it("analyze blinker", () => {
    const result = analyzeOscillator({
      cells: rleToCells(`ooo`),
      rule: conwayLife,
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
    expect(result.rotorTemperature).toEqual(1);

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

    expect(
      CACellList.from2dArray(
        result.signatureMap!.data.map((row) => row.map((x) => Number(x))),
      ).to2dArray()?.array,
    ).toEqual([
      [0, 1, 0],
      [1, 3, 1],
      [0, 1, 0],
    ]);
  });

  it("analyze signature", () => {
    const str = `x = 7, y = 7, rule = B3/S23
  3b2o$bobo$o5bo$bo3b2o2$3bobo$4bo!
  `;
    const result = analyzeOscillator({
      cells: rleToCells(str),
      rule: conwayLife,
      maxGeneration: 1000,
    });
    expect(
      CACellList.from2dArray(
        result.signatureMap!.data.map((row) => row.map((x) => Number(x))),
      ).to2dArray()?.array,
    ).toEqual([
      [0, 0, 0, 3, 0, 0, 0, 0],
      [0, 0, 3, 7, 7, 0, 0, 0],
      [0, 3, 5, 7, 1, 0, 0, 0],
      [3, 7, 7, 0, 0, 1, 7, 0],
      [0, 7, 1, 0, 0, 7, 7, 3],
      [0, 0, 0, 1, 7, 5, 3, 0],
      [0, 0, 0, 7, 7, 3, 0, 0],
      [0, 0, 0, 0, 3, 0, 0, 0],
    ]);
  });

  it("analyze Kok's galaxy", () => {
    const result = analyzeOscillator({
      cells: rleToCells(`x = 9, y = 9, rule = 23/3
2bo2bobob$2obob3ob$bo6bo$2o5bob2$bo5b2o$o6bob$b3obob2o$bobo2bo!`),
      rule: conwayLife,
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
    expect(result.heatMax).toEqual(84);
    expect(result.heatMin).toEqual(16);
    expect(result.temperature.toFixed(2)).toEqual("0.34");
    expect(result.rotorTemperature.toFixed(2)).toEqual("0.34");
  });

  it("analyze p60 shuttle", () => {
    const str = `#N p60glidershuttle.rle
#C https://conwaylife.com/wiki/P60_glider_shuttle
#C https://conwaylife.com/patterns/p60glidershuttle.rle
x = 35, y = 7, rule = B3/S23
2bo4bo$2ob4ob2o$2bo4bo$16bo$17b2o8bo4bo$16b2o7b2ob4ob2o$27bo4bo!`;

    const result = analyzeOscillator({
      cells: rleToCells(str),
      rule: conwayLife,
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

  it("analyze Cribbage", () => {
    const str = `#N Cribbage
#O Mitchell Riley
#C Discovered on July 14, 2023
#C This was the first period-19 oscillator to be found.
#C https://conwaylife.com/wiki/Cribbage
x = 32, y = 21, rule = B3/S23
4b2o$4bo$b2obo10bo$bo2b2o9b3o$3bo2bo11bo$bob3obo9b2o$obo4bo$o2b3o15bo$
b2o2bo5bo8b2o7b2o$3b2o6bo16bobo$3bo7bo8bo7bo$bobo16bo6b2o$b2o7b2o8bo5b
o2b2o$10bo15b3o2bo$24bo4bobo$13b2o9bob3obo$13bo11bo2bo$14b3o9b2o2bo$
16bo10bob2o$27bo$26b2o!`;

    const result = analyzeOscillator({
      cells: rleToCells(str),
      rule: conwayLife,
      maxGeneration: 1000,
    });

    expect(result.period).toEqual(19);
    expect(result.volatility.toFixed(2)).toEqual("0.72");
    expect(result.strictVolatility.toFixed(2)).toEqual("0.72");
    expect(result.boundingBox).toEqual({ sizeX: 32, sizeY: 21 });
    expect(result.heat.toFixed(1)).toEqual("33.5");
    expect(result.heatMin).toEqual(4);
    expect(result.heatMax).toEqual(66);
  });

  // from https://conwaylife.com/forums/viewtopic.php?p=196346#p196346
  it("analyze p661", () => {
    const str = `x = 63, y = 63, rule = B356/S23
28bo5bo$26bob2o3b2obo$26b2obo3bob2o$25bo11bo22$3bo55bo$b2o57b2o$2bo57b
o$2o59b2o$b2o57b2o4$b2o57b2o$2o59b2o$2bo57bo$b2o57b2o$3bo55bo22$25bo
11bo$26b2obo3bob2o$26bob2o3b2obo$28bo5bo!`;
    const result = analyzeOscillator({
      cells: rleToCells(str),
      rule: {
        type: "outer-totalistic" as const,
        transition: {
          birth: [3, 5, 6],
          survive: [2, 3],
        },
      },
      maxGeneration: 1000,
    });

    expect(result.period).toEqual(661);
    expect(result.isSpaceship).toEqual(false);
    expect(result.volatility.toFixed(3)).toEqual("1.000");
    expect(result.boundingBox).toEqual({ sizeX: 99, sizeY: 99 });
  });

  it("analyze Sir Robin", () => {
    const str = `#N Sir Robin
#O Adam P. Goucher, Tom Rokicki; 2018
#C The first elementary knightship to be found in Conway's Game of Life.
#C https://conwaylife.com/wiki/Sir_Robin
x = 31, y = 79, rule = B3/S23
4b2o$4bo2bo$4bo3bo$6b3o$2b2o6b4o$2bob2o4b4o$bo4bo6b3o$2b4o4b2o3bo$o9b
2o$bo3bo$6b3o2b2o2bo$2b2o7bo4bo$13bob2o$10b2o6bo$11b2ob3obo$10b2o3bo2b
o$10bobo2b2o$10bo2bobobo$10b3o6bo$11bobobo3bo$14b2obobo$11bo6b3o2$11bo
9bo$11bo3bo6bo$12bo5b5o$12b3o$16b2o$13b3o2bo$11bob3obo$10bo3bo2bo$11bo
4b2ob3o$13b4obo4b2o$13bob4o4b2o$19bo$20bo2b2o$20b2o$21b5o$25b2o$19b3o
6bo$20bobo3bobo$19bo3bo3bo$19bo3b2o$18bo6bob3o$19b2o3bo3b2o$20b4o2bo2b
o$22b2o3bo$21bo$21b2obo$20bo$19b5o$19bo4bo$18b3ob3o$18bob5o$18bo$20bo$
16bo4b4o$20b4ob2o$17b3o4bo$24bobo$28bo$24bo2b2o$25b3o$22b2o$21b3o5bo$
24b2o2bobo$21bo2b3obobo$22b2obo2bo$24bobo2b2o$26b2o$22b3o4bo$22b3o4bo$
23b2o3b3o$24b2ob2o$25b2o$25bo2$24b2o$26bo!`;
    const result = analyzeOscillator({
      cells: rleToCells(str),
      rule: conwayLife,
      maxGeneration: 10,
    });

    expect(result.period).toEqual(6);
    expect(result.isSpaceship).toEqual(true);
    expect(result.speed).toEqual({ dx: -1, dy: -2 });
    expect(result.boundingBoxMovingEncloses).toEqual({ sizeX: 31, sizeY: 79 });
    expect(result.boundingBoxMaxArea.size).toEqual({ sizeX: 31, sizeY: 79 });
    expect(result.boundingBoxMinArea.size).toEqual({ sizeX: 30, sizeY: 79 });
  });

  it(`analyze RRO`, () => {
    // https://conwaylife.com/forums/viewtopic.php?p=61192#p61192
    const ruleString = `B2ce3aejk4aqrtw5-acr6cen78/S12an3cjqy4-ey5akqry6ekn7e8`;
    const str = `x = 3, y = 2, rule = B2ce3aejk4aqrtw5-acr6cen78/S12an3cjqy4-ey5akqry6ekn7e8
2o$obo!`;
    const rule = parseRule(ruleString);
    if (rule.type !== "int") {
      throw new Error("rule");
    }
    const result = analyzeOscillator({
      cells: rleToCells(str),
      rule,
      maxGeneration: 32,
    });

    expect(result.period).toEqual(32);
    expect(result.volatility).toEqual(1);
    expect(result.strictVolatility).toEqual(1);
    expect(result.stator).toEqual(0);
    expect(result.rotor).toEqual(44);

    expect(result.boundingBox).toEqual({ sizeX: 7, sizeY: 7 });
    expect(result.boundingBoxMinArea.size).toEqual({ sizeX: 3, sizeY: 2 });
    expect(result.boundingBoxMaxArea.size).toEqual({ sizeX: 3, sizeY: 6 });
    expect(result.boundingBoxMovingEncloses).toEqual({
      sizeX: 6,
      sizeY: 6,
    });
  });
});

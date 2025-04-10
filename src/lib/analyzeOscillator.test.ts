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
});

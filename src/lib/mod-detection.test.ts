import { describe, it, expect } from "vitest";
import { BitGrid } from "@ca-ts/algo/bit";
import { parseRLE } from "@ca-ts/rle";
import { isSameWithSymm, detectMod } from "./mod-detection";
import { runOscillator } from "./runOscillator";

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

describe("mod-detection", () => {
  describe("isSameWithSymm", () => {
    it("returns true for identical grids", () => {
      const grid1 = BitGrid.make({ width: 32, height: 32 });
      grid1.set(5, 5);
      grid1.set(6, 5);
      grid1.set(7, 5);

      const grid2 = grid1.clone();
      expect(isSameWithSymm(grid1, grid2)).toBe(true);
    });

    it("returns true for rotated grids", () => {
      const grid1 = BitGrid.make({ width: 32, height: 32 });
      // Horizontal bar
      grid1.set(10, 10);
      grid1.set(11, 10);
      grid1.set(12, 10);

      const grid2 = BitGrid.make({ width: 32, height: 32 });
      // Vertical bar
      grid2.set(15, 14);
      grid2.set(15, 15);
      grid2.set(15, 16);

      expect(isSameWithSymm(grid1, grid2)).toBe(true);
    });

    it("returns true for reflected grids", () => {
      const grid1 = BitGrid.make({ width: 32, height: 32 });
      // Glider at gen 0
      grid1.set(1, 0);
      grid1.set(2, 1);
      grid1.set(0, 2);
      grid1.set(1, 2);
      grid1.set(2, 2);

      const grid2 = BitGrid.make({ width: 32, height: 32 });
      // Glider reflected diagonally
      grid2.set(0, 1);
      grid2.set(1, 2);
      grid2.set(2, 0);
      grid2.set(2, 1);
      grid2.set(2, 2);

      expect(isSameWithSymm(grid1, grid2)).toBe(true);
    });

    it("returns false for non-symmetric grids", () => {
      const grid1 = BitGrid.make({ width: 32, height: 32 });
      grid1.set(5, 5);
      grid1.set(6, 5);

      const grid2 = BitGrid.make({ width: 32, height: 32 });
      grid2.set(5, 5);
      grid2.set(6, 5);
      grid2.set(7, 5);

      expect(isSameWithSymm(grid1, grid2)).toBe(false);
    });
  });

  describe("detectMod", () => {
    it("detects mod 1 for still life (Block)", () => {
      const { world } = runOscillator({
        cells: rleToCells("2o$2o"),
        rule: conwayLife,
        maxGeneration: 10,
      });
      const histories = world.histories.map((h) => h.bitGrid);
      expect(detectMod(histories)).toEqual(1);
    });

    it("detects mod 1 for Blinker (period 2, mod 1)", () => {
      const { world } = runOscillator({
        cells: rleToCells("3o"),
        rule: conwayLife,
        maxGeneration: 10,
      });
      const histories = world.histories.map((h) => h.bitGrid);
      expect(world.getGen()).toEqual(2);
      expect(detectMod(histories)).toEqual(1);
    });

    it("detects mod 2 for LWSS (period 4, mod 2)", () => {
      const { world } = runOscillator({
        cells: rleToCells("bo2bo$o4b$o3bo$4o!"),
        rule: conwayLife,
        maxGeneration: 1000,
      });
      const histories = world.histories.map((h) => h.bitGrid);
      expect(world.getGen()).toEqual(4);
      expect(detectMod(histories)).toEqual(2);
    });

    it("detects mod 2 for Glider (period 4, mod 2)", () => {
      const { world } = runOscillator({
        cells: rleToCells("bob$2bo$3o!"),
        rule: conwayLife,
        maxGeneration: 10,
      });
      const histories = world.histories.map((h) => h.bitGrid);
      expect(world.getGen()).toEqual(4);
      expect(detectMod(histories)).toEqual(2);
    });

    it("detects mod 8 for Kok's galaxy (period 8, mod 8)", () => {
      const str = `x = 9, y = 9, rule = 23/3
2bo2bobob$2obob3ob$bo6bo$2o5bob2$bo5b2o$o6bob$b3obob2o$bobo2bo!`;
      const { world } = runOscillator({
        cells: rleToCells(str),
        rule: conwayLife,
        maxGeneration: 100,
      });
      const histories = world.histories.map((h) => h.bitGrid);
      expect(world.getGen()).toEqual(8);
      expect(detectMod(histories)).toEqual(8);
    });

    it("detects mod 15 for Pentadecathlon (period 15, mod 15)", () => {
      const str = `x = 10, y = 3, rule = B3/S23
2bo4bo$2ob4ob2o$2bo4bo!`;
      const { world } = runOscillator({
        cells: rleToCells(str),
        rule: conwayLife,
        maxGeneration: 100,
      });
      const histories = world.histories.map((h) => h.bitGrid);
      expect(world.getGen()).toEqual(15);
      expect(detectMod(histories)).toEqual(15);
    });
  });
});

import { BitGrid, BitWorld } from "@ca-ts/algo/bit";
import { setCellsToBitGrid } from "./setCellsToBitGrid.ts";
import { CACellList } from "@ca-ts/pattern";
import type { INTRule, MAPRule, OuterTotalisticRule } from "@ca-ts/rule";

export class WorldSizeError extends Error {
  constructor() {
    super("not enough size");
  }
}

interface HistoryEntry {
  gen: number;
  bitGrid: BitGrid;
}

export class WorldWithHistory {
  private bitWorld: BitWorld;
  private gen = 0;
  private initialBitGrid: BitGrid;
  public histories: HistoryEntry[] = [];
  public bufferSize: number;

  constructor({
    cells,
    bufferSize,
    rule,
  }: {
    cells: { x: number; y: number }[];
    rule: OuterTotalisticRule | INTRule | MAPRule;
    bufferSize?: number;
  }) {
    this.bufferSize = bufferSize ?? 32;

    const cellList = CACellList.fromCells(
      cells.map((c) => ({ position: c, state: 1 })),
    );

    const boundingRect = cellList.boundingRect;

    if (boundingRect == undefined) {
      throw new Error("Invalid cells");
    }
    this.bitWorld = BitWorld.make({
      width: boundingRect.width + this.bufferSize,
      height: boundingRect.height + this.bufferSize,
    });
    if (rule.type === "outer-totalistic") {
      this.bitWorld.setRule(rule.transition);
    } else if (rule.type === "int") {
      this.bitWorld.setINTRule(rule.transition);
    } else if (rule.type === "map") {
      this.bitWorld.setMAPRule(rule.data);
    } else {
      rule satisfies never;
    }

    setCellsToBitGrid(this.bitWorld.bitGrid, cellList);

    this.initialBitGrid = this.bitWorld.bitGrid.clone();
    this.pushHistory();
  }

  private pushHistory() {
    this.histories.push({
      gen: this.gen,
      bitGrid: this.bitWorld.bitGrid.clone(),
    });
  }

  run({ forceStop }: { forceStop?: () => boolean } = {}):
    | "forced-stop"
    | undefined {
    while (true) {
      const res = this.runStep();
      if (res === "end") {
        break;
      }
      if (forceStop && forceStop()) {
        return "forced-stop";
      }
    }
  }

  runStep(): "end" | "continue" {
    const bitWorld = this.bitWorld;

    if (bitWorld.hasAliveCellAtBorder()) {
      throw new WorldSizeError();
    }

    this.gen++;
    bitWorld.next();

    if (bitWorld.bitGrid.equal(this.initialBitGrid)) {
      return "end";
    }

    this.pushHistory();

    return "continue";
  }

  getGen() {
    return this.gen;
  }
}

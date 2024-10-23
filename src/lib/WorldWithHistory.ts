import { BitGrid, BitWorld } from "@ca-ts/algo/bit";
import { boundingBox, setCellsToBitGrid } from "./setCellsToBitGrid.ts";

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
    rule:
      | {
          transition: { birth: number[]; survive: number[] };
        }
      | {
          intTransition: { birth: string[]; survive: string[] };
        };
    bufferSize?: number;
  }) {
    this.bufferSize = bufferSize ?? 32;

    const { sizeX, sizeY } = boundingBox(cells);
    this.bitWorld = BitWorld.make({
      width: sizeX + this.bufferSize,
      height: sizeY + this.bufferSize,
    });
    if ("transition" in rule && rule.transition !== undefined) {
      this.bitWorld.setRule(rule.transition);
    } else if ("intTransition" in rule && rule.intTransition !== undefined) {
      this.bitWorld.setINTRule(rule.intTransition);
    }

    setCellsToBitGrid(this.bitWorld.bitGrid, cells, { sizeX, sizeY });

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
    this.gen++;
    this.bitWorld.next();

    if (this.bitWorld.bitGrid.equal(this.initialBitGrid)) {
      return "end";
    }

    this.pushHistory();

    if (this.bitWorld.hasAliveCellAtBorder()) {
      throw new WorldSizeError();
    }

    return "continue";
  }

  getGen() {
    return this.gen;
  }
}

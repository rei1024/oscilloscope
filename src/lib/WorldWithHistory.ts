import { BitGrid, BitWorld } from "@ca-ts/algo/bit";
import { setCellsToBitGrid } from "./setCellsToBitGrid.ts";
import { CACellList } from "@ca-ts/pattern";
import type { INTRule, MAPRule, OuterTotalisticRule } from "@ca-ts/rule";

interface HistoryEntry {
  gen: number;
  bitGrid: BitGrid;
}

export class WorldWithHistory {
  private bitWorld: BitWorld;
  private gen = 0;
  private initialBitGrid: BitGrid;
  public histories: HistoryEntry[] = [];
  private lastBitGrid: BitGrid | undefined;

  constructor({
    cells,
    rule,
  }: {
    cells: { x: number; y: number }[];
    rule: OuterTotalisticRule | INTRule | MAPRule;
  }) {
    const cellList = CACellList.fromCells(
      cells.map((c) => ({ position: c, state: 1 })),
    );

    const boundingRect = cellList.boundingRect;

    if (boundingRect == undefined) {
      throw new Error("Invalid cells");
    }
    this.bitWorld = BitWorld.make({
      width: boundingRect.width + 16,
      height: boundingRect.height + 16,
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

  private expandIfNeeded() {
    const bitWorld = this.bitWorld;

    if (!bitWorld.hasAliveCellAtBorder()) {
      // No need to expand
      return;
    }

    const border = bitWorld.bitGrid.borderAlive();

    const BUFFER_SIZE = 32;

    let expandX = 0;
    let expandY = 0;
    let offsetX = 0;
    let offsetY = 0;
    if (border.left) {
      expandX += BUFFER_SIZE;
      offsetX += BUFFER_SIZE;
    }
    if (border.right) {
      expandX += BUFFER_SIZE;
    }
    if (border.top) {
      expandY += BUFFER_SIZE;
      offsetY += BUFFER_SIZE;
    }
    if (border.bottom) {
      expandY += BUFFER_SIZE;
    }
    if (expandX > 0 || expandY > 0) {
      const config = {
        expand: { x: expandX, y: expandY },
        offset: { x: offsetX, y: offsetY },
      };
      const newBitGrid = bitWorld.bitGrid.expanded(config);

      bitWorld.setBitGrid(newBitGrid);
      this.initialBitGrid = this.initialBitGrid.expanded(config);
      this.histories = this.histories.map((h) => ({
        ...h,
        bitGrid: h.bitGrid.expanded(config),
      }));
    }
  }

  runStep(): "end" | "continue" {
    const bitWorld = this.bitWorld;
    this.expandIfNeeded();
    this.gen++;
    bitWorld.next();

    if (bitWorld.bitGrid.isSamePatternIgnoreTranslation(this.initialBitGrid)) {
      this.lastBitGrid = bitWorld.bitGrid.clone();
      return "end";
    }

    this.pushHistory();

    return "continue";
  }

  getGen() {
    return this.gen;
  }

  getLastBitGrid() {
    return this.lastBitGrid;
  }
}

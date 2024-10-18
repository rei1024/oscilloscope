import { BitGrid } from "@ca-ts/algo/bit";
import { bitGridFromData, type AnalyzeResult } from "./lib/analyzeOscillator";

const cellSize = 10;
const innerCellSize = 6;

const safeArea = 1;

export class App {
  private data: AnalyzeResult | null = null;
  private histories: BitGrid[] | null = null;
  private ctx: CanvasRenderingContext2D;
  private gen = 0;
  constructor(private $canvas: HTMLCanvasElement) {
    const ctx = this.$canvas.getContext("2d");
    if (ctx == null) {
      throw Error("Context");
    }
    this.ctx = ctx;

    const update = () => {
      this.render();
      requestAnimationFrame(update);
    };

    update();
  }

  render() {
    if (this.histories == null || this.data == null) {
      return;
    }

    const ctx = this.ctx;
    if (ctx.reset) {
      ctx.reset();
    } else {
      ctx.resetTransform();
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    const dx = this.data.bitGridData.minX;
    const dy = this.data.bitGridData.minY;

    const periodNum = this.data.periodMap.periodList.length;
    for (const [y, row] of this.data.periodMap.data.entries()) {
      for (const [x, p] of row.entries()) {
        if (p >= 1) {
          ctx.beginPath();
          const index =
            this.data.periodMap.periodList?.findIndex((t) => t === p) ?? 0;
          ctx.fillStyle = `oklch(100% 0.3 ${(index * 360) / periodNum})`;
          ctx.rect(
            (x - dx + safeArea) * cellSize,
            (y - dy + safeArea) * cellSize,
            cellSize,
            cellSize
          );
          ctx.fill();
        }
      }
    }
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = "black";
    this.histories[this.gen].forEachAlive((x, y) => {
      ctx.rect(
        (x - dx + safeArea) * cellSize + (cellSize - innerCellSize) / 2,
        (y - dy + safeArea) * cellSize + (cellSize - innerCellSize) / 2,
        innerCellSize,
        innerCellSize
      );
    });
    ctx.fill();
    this.gen = (this.gen + 1) % this.histories.length;
  }

  setup(data: AnalyzeResult) {
    const $canvas = this.$canvas;
    $canvas.width = (data.boundingBox.sizeX + safeArea * 2) * cellSize;
    $canvas.height = (data.boundingBox.sizeY + safeArea * 2) * cellSize;
    if ($canvas.width / 2 > $canvas.height) {
      $canvas.style.width = "100%";
      $canvas.style.height = "";
    } else {
      $canvas.style.width = "";
      $canvas.style.height = "400px";
    }

    this.data = data;
    this.histories = data.histories.map((h) => bitGridFromData(h));
    this.gen = 0;
  }
}

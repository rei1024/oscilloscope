import { BitGrid } from "@ca-ts/algo/bit";
import type { AnalyzeResult } from "./lib/analyzeOscillator";
import { periodMap, periodMapUnique } from "./lib/periodmap";
const cellSize = 10;
const safeArea = 1;

export class App {
  private data: AnalyzeResult | null = null;
  private histories: BitGrid[] | null = null;
  private periodMap: number[][] | null = null;
  private periods: number[] | null = null;
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
    ctx.reset && ctx.reset();

    const dx = this.data.bitGridData.minX;
    const dy = this.data.bitGridData.minY;

    const colors = [
      "#fca5a5",
      "#fed7aa",
      "#fde68a",
      "#d9f99d",
      "#6ee7b7",
      "#a5f3fc",
      "#bae6fd",
    ];
    // console.log(this.periods);
    for (const [y, row] of this.periodMap?.entries() ?? []) {
      for (const [x, p] of row.entries()) {
        // ctx.beginPath();
        // ctx.fillText(
        //   p.toString(),
        //   (x - dx + safeArea) * cellSize,
        //   (y - dy + safeArea) * cellSize,
        //   3
        // );
        // ctx.fill();
        if (p >= 2) {
          ctx.beginPath();
          ctx.fillStyle = colors[this.periods?.findIndex((t) => t === p)];
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
        (x - dx + safeArea) * cellSize,
        (y - dy + safeArea) * cellSize,
        cellSize,
        cellSize
      );
    });
    ctx.fill();
    this.gen = (this.gen + 1) % this.histories.length;
  }

  setup(data: AnalyzeResult) {
    const $canvas = this.$canvas;
    const bitGridData = data.bitGridData;
    $canvas.width = (data.boundingBox.sizeX + safeArea * 2) * cellSize;
    $canvas.height = (data.boundingBox.sizeY + safeArea * 2) * cellSize;
    if ($canvas.width / 2 > $canvas.height) {
      $canvas.style.width = "100%";
      $canvas.style.height = "";
    } else {
      $canvas.style.width = "";
      $canvas.style.height = "400px";
    }

    const width32 = Math.ceil((bitGridData.width ?? 0) / 32);
    const height = bitGridData.height ?? 0;
    this.data = data;
    this.histories = bitGridData.histories.map(
      (h) => new BitGrid(width32, height, h)
    );
    this.gen = 0;
    this.periodMap = periodMap(data);
    this.periods = periodMapUnique(this.periodMap);
  }
}

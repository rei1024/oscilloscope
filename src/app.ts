import { BitGrid } from "@ca-ts/algo/bit";
import type { AnalyzeResult } from "./lib/analyzeOscillator";
const cellSize = 10;
export class App {
  histories: BitGrid[] | null = null;
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
    if (this.histories == null) {
      return;
    }

    const ctx = this.ctx;
    ctx.reset && ctx.reset();
    ctx.beginPath();
    this.histories[this.gen].forEachAlive((x, y) => {
      ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize);
    });
    ctx.fill();
    this.gen = (this.gen + 1) % this.histories.length;
  }

  setup(data: AnalyzeResult) {
    const $canvas = this.$canvas;
    const bitGridData = data.bitGridData;
    $canvas.width = (bitGridData.width ?? 0) * cellSize;
    $canvas.height = (bitGridData.height ?? 0) * cellSize;
    $canvas.style.width = "100%";
    const width32 = Math.ceil((bitGridData.width ?? 0) / 32);
    const height = bitGridData.height ?? 0;

    this.histories = bitGridData.histories.map(
      (h) => new BitGrid(width32, height, h)
    );
    this.gen = 0;
  }
}

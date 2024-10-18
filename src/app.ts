import { BitGrid } from "@ca-ts/algo/bit";
import { bitGridFromData, type AnalyzeResult } from "./lib/analyzeOscillator";
import { Valve } from "./ui/valve";
import { $animFrequency, $animFrequencyLabel } from "./bind";
import { setPeriodColorTable } from "./ui/periodColorTable";

const cellSize = 10;
const innerCellSize = 6;

const safeArea = 1;

const frequencyList = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200,
  300, 400, 500,
];

export function periodToColor(periodList: number[], period: number) {
  const index = periodList.findIndex((t) => t === period) ?? 0;
  // 80% 0.1
  return `oklch(95% 0.35 ${(index * 360) / periodList.length})`;
  // return `lch(70% 70 ${(index * 360) / periodList.length})`;
}

export class App {
  private data: AnalyzeResult | null = null;
  private histories: BitGrid[] | null = null;
  private ctx: CanvasRenderingContext2D;
  private gen = 0;
  private valve: Valve;
  private periodRows: HTMLTableRowElement[] = [];
  constructor(private $canvas: HTMLCanvasElement) {
    const ctx = this.$canvas.getContext("2d", { colorSpace: "display-p3" });
    if (ctx == null) {
      throw Error("Context");
    }
    this.ctx = ctx;

    this.valve = new Valve(
      (num) => {
        if (!this.histories || num <= 0) {
          return;
        }
        this.gen = (this.gen + num) % this.histories.length;
      },
      { frequency: 20 }
    );
    this.valve.disabled = false;

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

    const periodList = this.data.periodMap.periodList;
    for (const [y, row] of this.data.periodMap.data.entries()) {
      for (const [x, p] of row.entries()) {
        if (p >= 1) {
          ctx.beginPath();
          ctx.fillStyle = periodToColor(periodList, p);
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
    const innerBorder = (cellSize - innerCellSize) / 2;
    this.histories[this.gen].forEachAlive((x, y) => {
      ctx.rect(
        (x - dx + safeArea) * cellSize + innerBorder,
        (y - dy + safeArea) * cellSize + innerBorder,
        innerCellSize,
        innerCellSize
      );
    });
    ctx.fill();

    $animFrequencyLabel.textContent =
      this.valve.frequency.toLocaleString() + "Hz";
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
    $animFrequency.style.display = "inline";

    this.data = data;
    this.histories = data.histories.map((h) => bitGridFromData(h));
    this.gen = 0;

    $animFrequency.min = (0).toString();
    $animFrequency.max = (frequencyList.length - 1).toString();
    $animFrequency.value = (
      data.histories.length <= 3
        ? frequencyList.filter((x) => x <= 3).length - 1
        : data.histories.length <= 10
        ? frequencyList.filter((x) => x <= 10).length - 1
        : "10"
    ).toString();

    this.updateFrequency();

    this.periodRows = setPeriodColorTable(data);
  }

  updateFrequency() {
    this.valve.frequency = frequencyList[Number($animFrequency.value)];
  }

  renderPeriodTableHighlight(pixelPosition: { x: number; y: number }) {
    if (!this.data?.periodMap) {
      return;
    }
    const dx = this.data.bitGridData.minX;
    const dy = this.data.bitGridData.minY;
    const x =
      -safeArea +
      dx +
      Math.floor(
        (pixelPosition.x / this.$canvas.clientWidth) *
          (this.data.boundingBox.sizeX + safeArea * 2)
      );
    const y =
      -safeArea +
      dy +
      Math.floor(
        (pixelPosition.y / this.$canvas.clientHeight) *
          (this.data.boundingBox.sizeY + safeArea * 2)
      );

    const period = this.data.periodMap.data[y][x];
    const index = this.data.periodMap.periodList
      .filter((x) => x !== 0)
      .findIndex((x) => x === period);
    console.log(x, y, index, this.periodRows);
    for (const row of this.periodRows) {
      row.style.backgroundColor = "";
    }
    if (index !== -1) {
      this.periodRows[index].style.backgroundColor = "#0000FF22";
    }
  }
}

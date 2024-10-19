import { BitGrid } from "@ca-ts/algo/bit";
import { bitGridFromData, type AnalyzeResult } from "./lib/analyzeOscillator";
import { Valve } from "./ui/valve";
import {
  $animFrequency,
  $animFrequencyLabel,
  $dataBox,
  $generation,
  $hoverInfo,
  $mapBox,
  $showAnimationCheckbox,
  $showGridCheckbox,
} from "./bind";
import { setColorTable } from "./ui/colorTable";

const cellSize = 10;
const innerCellSize = 6;
const innerCellOffset = (cellSize - innerCellSize) / 2;
const gridWidth = 1;

const safeArea = 1;

const frequencyList = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200,
  300, 400, 500,
];

export function dataToColor(list: number[], data: number) {
  const index = list.findIndex((t) => t === data) ?? 0;
  // 80% 0.1
  return `oklch(92% 0.35 ${(index * 360) / list.length})`;
  // return `lch(70% 70 ${(index * 360) / list.length})`;
  // return `hsl(${(index * 360) / list.length} 100% 70%)`;
}

export class App {
  private data: AnalyzeResult | null = null;
  private histories: BitGrid[] | null = null;
  private ctx: CanvasRenderingContext2D;
  private gen = 0;
  private valve: Valve;
  private colorTableRows: HTMLTableRowElement[] = [];
  private mapType: "period" | "frequency" = "period";

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
    $animFrequencyLabel.textContent =
      this.valve.frequency.toLocaleString() + "Hz";

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

    // Background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Map
    const dx = this.data.bitGridData.minX;
    const dy = this.data.bitGridData.minY;

    const mapData = this.getMapData();
    const list = mapData.list;
    for (const [y, row] of mapData.data.entries()) {
      for (const [x, p] of row.entries()) {
        if (p >= 1) {
          ctx.beginPath();
          ctx.fillStyle = dataToColor(list, p);
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

    if ($showAnimationCheckbox.checked) {
      $animFrequency.style.display = "";
      $animFrequencyLabel.style.display = "";
      // Alive Cells
      ctx.beginPath();
      ctx.fillStyle = "black";
      this.histories[this.gen].forEachAlive((x, y) => {
        ctx.rect(
          (x - dx + safeArea) * cellSize + innerCellOffset,
          (y - dy + safeArea) * cellSize + innerCellOffset,
          innerCellSize,
          innerCellSize
        );
      });
      ctx.fill();

      $generation.textContent =
        "generation = " +
        this.gen
          .toString()
          .padStart(this.histories.length.toString().length, " ") +
        "/" +
        this.histories.length;
    } else {
      $animFrequency.style.display = "none";
      $animFrequencyLabel.style.display = "none";
      $generation.textContent = "";
    }

    // Grid
    const yMax = this.data.boundingBox.sizeY + safeArea * 2;
    const xMax = this.data.boundingBox.sizeX + safeArea * 2;
    if ($showGridCheckbox.checked) {
      ctx.beginPath();
      for (let y = 0; y < yMax; y++) {
        const posY = y * cellSize;
        for (let x = 0; x < xMax; x++) {
          const posX = x * cellSize;
          ctx.strokeStyle = "#dddddd";
          ctx.strokeRect(
            posX + gridWidth / 2,
            posY + gridWidth / 2,
            cellSize - gridWidth,
            cellSize - gridWidth
          );
        }
      }
      ctx.fill();
    }
  }

  setup(data: AnalyzeResult) {
    $mapBox.style.display = "";
    $dataBox.style.display = "";

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
    $animFrequencyLabel.textContent =
      this.valve.frequency.toLocaleString() + "Hz";

    this.updateFrequency();

    this.colorTableRows = setColorTable(this.getMapData(), this.mapType);
  }

  private getMapData() {
    if (this.data == null) {
      throw null;
    }
    return this.mapType === "frequency"
      ? this.data.frequencyMap
      : this.data.periodMap;
  }

  updateFrequency() {
    this.valve.frequency = frequencyList[Number($animFrequency.value)];
  }

  private getMapIndexAt(pixelPosition: {
    x: number;
    y: number;
  }): { cellData: number; index: number } | undefined {
    if (!this.data) {
      return undefined;
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

    const mapData = this.getMapData();
    const cellData = mapData.data[y][x];
    const index = mapData.list
      .filter((x) => x !== 0)
      .findIndex((x) => x === cellData);
    if (index === -1) {
      return undefined;
    }
    return { cellData, index };
  }

  renderColorTableHighlight(pixelPosition: { x: number; y: number }) {
    for (const row of this.colorTableRows) {
      row.style.backgroundColor = "";
    }

    const pointData = this.getMapIndexAt(pixelPosition);
    if (pointData !== undefined) {
      this.colorTableRows[pointData.index].style.backgroundColor = "#0000FF22";

      $hoverInfo.textContent =
        "  " +
        (this.mapType === "period" ? "period" : "frequency") +
        " = " +
        pointData.cellData;
    } else {
      $hoverInfo.textContent = " "; // 崩れないように
    }
  }

  updateMapType(mapType: "period" | "frequency") {
    this.mapType = mapType;
    this.colorTableRows = setColorTable(this.getMapData(), this.mapType);
  }
}

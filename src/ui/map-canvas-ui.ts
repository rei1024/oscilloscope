import type { BitGrid } from "@ca-ts/algo/bit";
import {
  $darkModeCheckbox,
  $showAnimationCheckbox,
  $showGridCheckbox,
} from "../bind";
import type { AnalyzeResult } from "../lib/analyzeOscillator";
import type { MapType } from "./core";
import type { MapData } from "../lib/getMap";
import type { ColorMap } from "../make-color";

const safeArea = 2;
const cellSize = 10;
const innerCellSize = 6;
const innerCellOffset = (cellSize - innerCellSize) / 2;
const gridWidth = 1;

/**
 * iOS limits canvas size to 8192
 *
 * must less than `Math.floor(8192 / cellSize) - safeArea * 2`
 */
const MAX_NORMAL_SIZE = 512;

function getIsDot(data: AnalyzeResult) {
  return (
    data.boundingBox.sizeX > MAX_NORMAL_SIZE ||
    data.boundingBox.sizeY > MAX_NORMAL_SIZE
  );
}

export class MapCanvasUI {
  private $canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor($canvas: HTMLCanvasElement) {
    this.$canvas = $canvas;
    const ctx = this.$canvas.getContext("2d", { colorSpace: "display-p3" });
    if (ctx == null) {
      throw Error("Context");
    }
    this.ctx = ctx;
  }

  setup({ data }: { data: AnalyzeResult }) {
    const isDot = getIsDot(data);

    const cellPixel = isDot ? 1 : cellSize;

    const $canvas = this.$canvas;
    $canvas.width = (data.boundingBox.sizeX + safeArea * 2) * cellPixel;
    $canvas.height = (data.boundingBox.sizeY + safeArea * 2) * cellPixel;
    if ($canvas.width / 2 > $canvas.height) {
      $canvas.style.width = "100%";
      $canvas.style.height = "";
    } else {
      $canvas.style.width = "";
      $canvas.style.height = "400px";
    }
  }

  render({
    data,
    mapData,
    colorMap,
    histories,
    gen,
  }: {
    data: AnalyzeResult;
    mapData: MapData<unknown>;
    colorMap: ColorMap<unknown>;
    histories: BitGrid[];
    gen: number;
  }) {
    const ctx = this.ctx;
    if (ctx.reset) {
      ctx.reset();
    } else {
      ctx.resetTransform();
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    const isDarkMode = $darkModeCheckbox.checked;

    // Background
    ctx.fillStyle = isDarkMode ? "black" : "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Map
    const dx = data.bitGridData.minX;
    const dy = data.bitGridData.minY;

    const isDot = getIsDot(data);

    $showGridCheckbox.disabled = isDot;

    const sizePixel = isDot ? 1 : cellSize;

    const colorList = colorMap.colorList;

    for (const [y, row] of mapData.indexData.entries()) {
      for (const [x, index] of row.entries()) {
        if (index !== -1) {
          ctx.beginPath();
          ctx.fillStyle = colorList[index];
          ctx.rect(
            (x - dx + safeArea) * sizePixel,
            (y - dy + safeArea) * sizePixel,
            sizePixel,
            sizePixel,
          );
          ctx.fill();
        }
      }
    }

    if ($showAnimationCheckbox.checked) {
      const innerCellOffsetPixel = isDot ? 1 : innerCellOffset;
      const innerCellSizePixel = isDot ? 1 : innerCellSize;
      // Alive Cells
      ctx.beginPath();
      ctx.fillStyle = "black";
      histories[gen].forEachAlive((x, y) => {
        ctx.rect(
          (x - dx + safeArea) * sizePixel + innerCellOffsetPixel,
          (y - dy + safeArea) * sizePixel + innerCellOffsetPixel,
          innerCellSizePixel,
          innerCellSizePixel,
        );
      });
      ctx.fill();
    }
    // Grid
    if (isDot) {
      return;
    }
    const yMax = data.boundingBox.sizeY + safeArea * 2;
    const xMax = data.boundingBox.sizeX + safeArea * 2;
    if ($showGridCheckbox.checked) {
      ctx.beginPath();
      for (let y = 0; y < yMax; y++) {
        const posY = y * cellSize;
        for (let x = 0; x < xMax; x++) {
          const posX = x * cellSize;
          ctx.strokeStyle = isDarkMode ? "#444444" : "#dddddd";
          ctx.strokeRect(
            posX + gridWidth / 2,
            posY + gridWidth / 2,
            cellSize - gridWidth,
            cellSize - gridWidth,
          );
        }
      }
      ctx.fill();
    }
  }

  getMapIndexAt(
    pixelPosition: {
      x: number;
      y: number;
    },
    data: AnalyzeResult | null,
    mapData: MapData<number>,
  ): { cellData: number; index: number } | undefined {
    if (!data) {
      return undefined;
    }
    const dx = data.bitGridData.minX;
    const dy = data.bitGridData.minY;
    const x =
      -safeArea +
      dx +
      Math.floor(
        (pixelPosition.x / this.$canvas.clientWidth) *
          (data.boundingBox.sizeX + safeArea * 2),
      );
    const y =
      -safeArea +
      dy +
      Math.floor(
        (pixelPosition.y / this.$canvas.clientHeight) *
          (data.boundingBox.sizeY + safeArea * 2),
      );

    if (y < 0 || y >= mapData.data.length) {
      return undefined;
    }

    const cellData = mapData.data[y][x];
    if (cellData === undefined) {
      return undefined;
    }

    const index = mapData.list.findIndex((x) => x === cellData);
    if (index === -1) {
      return undefined;
    }

    return { cellData, index };
  }
}

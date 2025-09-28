import { BitGrid } from "@ca-ts/algo/bit";
import { bitGridFromData, type AnalyzeResult } from "./lib/analyzeOscillator";
import { Valve } from "./ui/valve";
import {
  $colorSelectContainer,
  $dataBox,
  $generation,
  $hoverInfo,
  $mapBox,
  $showAnimationCheckbox,
  $animFrequency,
  $animFrequencyLabel,
  $colorTable,
} from "./bind";
import { ColorTableUI } from "./ui/colorTable";
import { type ColorType, type MapType } from "./ui/core";
import { makeColorMap } from "./make-color";
import { FrequencyUI } from "./ui/frequency";
import { MapCanvasUI } from "./ui/map-canvas-ui";

export class App {
  private data: AnalyzeResult | null = null;
  private histories: BitGrid[] | null = null;
  private gen = 0;
  private valve: Valve;
  private mapType: MapType = "period";
  private colorType: ColorType = "hue";
  private colorMap: Map<number, string> = new Map();
  private mapCanvasUI: MapCanvasUI;
  private frequencyUI: FrequencyUI;
  private colorTable: ColorTableUI;

  constructor($canvas: HTMLCanvasElement) {
    this.mapCanvasUI = new MapCanvasUI($canvas);
    this.valve = new Valve(
      (num) => {
        if (!this.histories || num <= 0) {
          return;
        }
        this.gen = (this.gen + num) % this.histories.length;
      },
      { frequency: 20 },
    );
    this.valve.disabled = false;

    this.frequencyUI = new FrequencyUI(
      $animFrequencyLabel,
      $animFrequency,
      this.valve,
    );

    this.colorTable = new ColorTableUI($colorTable, $hoverInfo);

    const update = () => {
      this.render();
      requestAnimationFrame(update);
    };

    update();
  }

  render() {
    this.frequencyUI.render({
      showAnimationChecked: $showAnimationCheckbox.checked,
    });
    if (this.histories == null || this.data == null) {
      return;
    }

    this.mapCanvasUI.render({
      data: this.data,
      mapData: this.getMapData(),
      colorMap: this.colorMap,
      mapType: this.mapType,
      histories: this.histories,
      gen: this.gen,
    });

    if ($showAnimationCheckbox.checked) {
      $generation.textContent =
        "generation = " +
        this.gen
          .toString()
          .padStart(this.histories.length.toString().length, " ") +
        "/" +
        this.histories.length;
    } else {
      $generation.textContent = "";
    }
  }

  setup(data: AnalyzeResult) {
    // Do not show map for spaceship
    $mapBox.style.display = data.isSpaceship ? "none" : "";

    $dataBox.style.display = "";

    this.mapCanvasUI.setup({ data });

    this.data = data;
    this.histories = data.histories.map((h) => bitGridFromData(h));
    this.gen = 0;

    this.frequencyUI.setup(data);

    this.setupColorMap();
    this.updateFrequency();
    this.colorTable.setup(this.getMapData(), this.colorMap, this.mapType);
  }

  private setupColorMap() {
    if (this.data == null) {
      return;
    }
    const mapData = this.getMapData();
    const list = mapData.list;
    const colorMap = makeColorMap({
      list,
      style: (
        {
          period:
            this.colorType === "grayscale" ? "gray-reverse" : "hue-for-period",
          frequency:
            this.colorType === "grayscale" ? "gray" : "hue-for-frequency",
          heat: "heat",
        } as const
      )[this.mapType],
      hasStatorCell: this.data.periodMap.list.some((x) => x === 1),
    });
    this.colorMap = colorMap;
  }

  private getMapData() {
    const data = this.data;
    if (data == null) {
      throw null;
    }
    switch (this.mapType) {
      case "frequency": {
        return data.frequencyMap;
      }
      case "heat": {
        return data.heatMap;
      }
      case "period": {
        return data.periodMap;
      }
    }
  }

  updateFrequency() {
    this.valve.frequency = this.frequencyUI.getFrequency();
  }

  renderColorTableHighlight(position: { x: number; y: number }) {
    const data = this.mapCanvasUI.getMapIndexAt(
      position,
      this.data,
      this.getMapData(),
    );
    this.colorTable.renderColorTableHighlight(data ?? null, this.mapType);
  }

  updateMapType(mapType: MapType) {
    if (mapType === "heat") {
      $colorSelectContainer.style.display = "none";
    } else {
      $colorSelectContainer.style.display = "";
    }
    this.mapType = mapType;
    this.setupColorMap();
    this.colorTable.setup(this.getMapData(), this.colorMap, this.mapType);
  }

  updateColor(color: ColorType) {
    this.colorType = color;
    this.setupColorMap();
    this.colorTable.setup(this.getMapData(), this.colorMap, this.mapType);
  }
}

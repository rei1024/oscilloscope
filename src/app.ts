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
  $analyzeButton,
} from "./bind";
import { ColorTableUI } from "./ui/colorTable";
import { type ColorType, type MapType } from "./ui/core";
import { ColorMap } from "./make-color";
import { FrequencyUI } from "./ui/frequency";
import { MapCanvasUI } from "./ui/map-canvas-ui";
import type { MapData } from "./lib/getMap";
import { post } from "./main";

export class App {
  private data: AnalyzeResult | null = null;
  private histories: BitGrid[] | null = null;
  private signatureMap: MapData<bigint> | null = null;
  private gen = 0;
  private valve: Valve;
  private mapType: MapType = "period";
  private colorType: ColorType = "hue";
  private colorMap!: ColorMap<unknown>;
  private mapCanvasUI: MapCanvasUI;
  private frequencyUI: FrequencyUI;
  private colorTable: ColorTableUI;
  private analyzeButtonChangeId: number | undefined;

  constructor($canvas: HTMLCanvasElement) {
    this.mapCanvasUI = new MapCanvasUI($canvas);
    this.valve = new Valve(
      (num) => {
        if (!this.histories || num <= 0) {
          return;
        }
        this.gen = (this.gen + num) % this.histories.length;
        this.render();
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
    this.signatureMap = null;
    // Do not show map for spaceship
    $mapBox.style.display = data.isSpaceship ? "none" : "";

    $dataBox.style.display = "";

    this.mapCanvasUI.setup({ data });

    this.data = data;
    this.histories = data.histories.map((h) => bitGridFromData(h));
    this.gen = 0;

    this.frequencyUI.setup(data);

    if (this.mapType === "signature" && this.signatureMap == null) {
      this.analyzeSignature();
    }

    this.updateFrequency();
    this.setupColor();
    this.render();
  }

  private analyzeSignature() {
    if (!this.data) {
      return;
    }
    $analyzeButton.disabled = true;
    this.analyzeButtonChangeId = setTimeout(() => {
      $analyzeButton.textContent = "Creating signature map...";
    }, 200);

    post({
      kind: "request-signature",
      data: {
        width: this.data.bitGridData.width,
        height: this.data.bitGridData.height,
        or: this.data.bitGridData.or,
        periodMapArray: this.data.periodMap.data,
        histories: this.data.histories,
      },
    });
  }

  onSignatureMap(signatureMap: MapData<bigint>) {
    $analyzeButton.disabled = false;
    clearTimeout(this.analyzeButtonChangeId);
    $analyzeButton.textContent = "Analyze";
    this.signatureMap = signatureMap;
    this.render();
    this.setupColor();
  }

  private setupColorMap() {
    const data = this.data;
    if (data == null) {
      return;
    }
    const mapData = this.getMapData();
    if (!mapData) {
      return;
    }
    const list = mapData.list;
    const colorMap = ColorMap.make({
      list: list as (number | bigint)[],
      style: (
        {
          period:
            this.colorType === "grayscale" ? "gray-reverse" : "hue-for-period",
          frequency:
            this.colorType === "grayscale" ? "gray" : "hue-for-frequency",
          heat: "heat",
          signature:
            this.colorType === "grayscale" ? "gray" : "hue-for-frequency",
        } as const
      )[this.mapType],
      hasStatorCell: data.periodMap.list.some((x) => x === 1),
      hasFullPeriodCell: data.periodMap.list.some((x) => x === data.period),
    });
    this.colorMap = colorMap;
  }

  private getMapData() {
    const data = this.data;
    if (data == null) {
      throw new Error("Internal error");
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
      case "signature": {
        if (!this.signatureMap) {
          return null;
        }
        return this.signatureMap;
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
      this.getMapData()!,
    );
    this.colorTable.renderColorTableHighlight(data ?? null, this.mapType);
  }

  updateMapType(mapType: MapType) {
    if (mapType === "heat") {
      $colorSelectContainer.style.display = "none";
    } else {
      $colorSelectContainer.style.display = "";
    }
    if (mapType === "signature" && this.signatureMap == null) {
      this.analyzeSignature();
    }
    this.mapType = mapType;
    this.setupColor();
    this.render();
  }

  updateColor(color: ColorType) {
    this.colorType = color;
    this.setupColor();
    this.render();
  }

  valveEnable(enable: boolean) {
    this.valve.disabled = !enable;
  }

  private setupColor() {
    this.setupColorMap();
    this.colorTable.setup(
      this.getMapData(),
      this.colorMap,
      this.mapType,
      this.histories!.length,
    );
  }
}

import type { MapData } from "../lib/getMap";
import type { ColorMap } from "../make-color";
import { displayMapTypeLower, displayMapTypeTitle, type MapType } from "./core";

function createColorTable<T>(
  $colorTable: HTMLElement,
  map: MapData<T>,
  colorMap: ColorMap<T>,
  mapType: MapType,
  historyLength: number,
) {
  const rows: HTMLTableRowElement[] = [];

  const list = map.list;

  $colorTable.replaceChildren();

  {
    const trHead = document.createElement("tr");

    const thColor = document.createElement("th");
    thColor.textContent = "Color";
    thColor.style.width = "60px";

    const thType = document.createElement("th");
    thType.textContent = displayMapTypeTitle(mapType);

    const thCount = document.createElement("th");
    thCount.textContent = "Count";

    trHead.append(thColor, thType, thCount);
    $colorTable.append(trHead);
  }

  for (const item of list) {
    const row = document.createElement("tr");
    const color = colorMap.map.get(item) ?? "";
    const $color = document.createElement("td");
    $color.style.backgroundColor = color;
    $color.style.width = "40px";

    const $detail = document.createElement("td");
    if (mapType === "signature") {
      $detail.style.maxWidth = "500px";
      $detail.style.overflow = "hidden";
      $detail.style.textOverflow = "ellipsis";
    }
    $detail.textContent =
      typeof item === "number"
        ? item.toString()
        : typeof item === "bigint"
          ? showSignature(item, historyLength)
          : (() => {
              throw new Error("Internal error");
            })();
    $detail.style.textAlign = "right";

    const $count = document.createElement("td");
    $count.textContent = map.countMap.get(item)?.toString() ?? "-";
    $count.style.textAlign = "right";

    row.append($color, $detail, $count);
    $colorTable.append(row);
    rows.push(row);
  }

  return rows;
}

export class ColorTableUI {
  private $colorTable: HTMLElement;
  private $hoverInfo: HTMLElement;
  private rows: HTMLTableRowElement[] = [];
  private historyLength: number = 0;
  constructor($colorTable: HTMLElement, $hoverInfo: HTMLElement) {
    this.$colorTable = $colorTable;
    this.$hoverInfo = $hoverInfo;
  }

  setup<T>(
    map: MapData<T> | null,
    colorMap: ColorMap<T>,
    mapType: MapType,
    historyLength: number,
  ) {
    if (map == null) {
      this.rows = [];
      this.$colorTable.replaceChildren();
      return;
    }
    this.rows = createColorTable(
      this.$colorTable,
      map,
      colorMap,
      mapType,
      historyLength,
    );
    this.historyLength = historyLength;
  }

  renderColorTableHighlight(
    data: {
      index: number;
      cellData: unknown;
    } | null,
    mapType: MapType,
  ) {
    for (const row of this.rows) {
      row.style.backgroundColor = "";
    }

    if (data != undefined) {
      this.rows[data.index].style.backgroundColor = "#0000FF22";

      this.$hoverInfo.style.overflow = "hidden";
      this.$hoverInfo.style.maxWidth = "500px";
      this.$hoverInfo.style.textOverflow = "ellipsis";

      this.$hoverInfo.textContent =
        "  " +
        displayMapTypeLower(mapType) +
        " = " +
        (typeof data.cellData === "number"
          ? data.cellData.toString()
          : typeof data.cellData === "bigint"
            ? showSignature(data.cellData, this.historyLength)
            : (() => {
                throw new Error("Internal error");
              })());
    } else {
      this.$hoverInfo.textContent = " "; // 崩れないように
    }
  }
}

function showSignature(n: bigint, historyLength: number) {
  const str = n.toString(2).padStart(historyLength, "0");
  return str;
}

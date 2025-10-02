import type { MapData } from "../lib/getMap";
import type { ColorMap } from "../make-color";
import { displayMapTypeLower, displayMapTypeTitle, type MapType } from "./core";

function createColorTable<T>(
  $colorTable: HTMLElement,
  map: MapData<T>,
  colorMap: ColorMap<T>,
  mapType: MapType,
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
    $detail.textContent =
      typeof item === "number"
        ? item.toString()
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
  constructor($colorTable: HTMLElement, $hoverInfo: HTMLElement) {
    this.$colorTable = $colorTable;
    this.$hoverInfo = $hoverInfo;
  }

  setup<T>(map: MapData<T>, colorMap: ColorMap<T>, mapType: MapType) {
    this.rows = createColorTable(this.$colorTable, map, colorMap, mapType);
  }

  renderColorTableHighlight(
    data: {
      index: number;
      cellData: number;
    } | null,
    mapType: MapType,
  ) {
    for (const row of this.rows) {
      row.style.backgroundColor = "";
    }

    if (data != undefined) {
      this.rows[data.index].style.backgroundColor = "#0000FF22";

      this.$hoverInfo.textContent =
        "  " + displayMapTypeLower(mapType) + " = " + data.cellData;
    } else {
      this.$hoverInfo.textContent = " "; // 崩れないように
    }
  }
}

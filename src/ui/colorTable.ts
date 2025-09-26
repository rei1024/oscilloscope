import { displayMapTypeLower, displayMapTypeTitle, type MapType } from "./core";

function createColorTable(
  $colorTable: HTMLElement,
  map: { data: number[][]; list: number[]; countMap: Map<number, number> },
  colorMap: Map<number, string>,
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
    const color = colorMap.get(item) ?? "";
    const $color = document.createElement("td");
    $color.style.backgroundColor = color;
    $color.style.width = "40px";

    const $detail = document.createElement("td");
    $detail.textContent = item.toString();
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

  setup(
    map: { data: number[][]; list: number[]; countMap: Map<number, number> },
    colorMap: Map<number, string>,
    mapType: MapType,
  ) {
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

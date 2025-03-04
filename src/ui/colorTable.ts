import { makeColorMap } from "../app";
import { $colorTable } from "../bind";
import { displayMapTypeTitle, type MapType } from "./core";

export function setColorTable(
  map: { data: number[][]; list: number[]; countMap: Map<number, number> },
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

  const colorMap = makeColorMap(list, mapType === "heat" ? "heat" : "hue");
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

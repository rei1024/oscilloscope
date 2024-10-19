import { dataToColor as dataToColor } from "../app";
import { $colorTable } from "../bind";

export function setColorTable(
  map: { data: number[][]; list: number[] },
  type: "period" | "frequency"
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
    thType.textContent = type === "period" ? "Period" : "Frequency";

    trHead.append(thColor, thType);
    $colorTable.append(trHead);
  }

  for (const item of list) {
    if (item === 0) {
      continue;
    }
    const row = document.createElement("tr");
    const color = dataToColor(list, item);
    const $color = document.createElement("td");
    $color.style.backgroundColor = color;
    $color.style.width = "40px";

    const $detail = document.createElement("td");
    $detail.textContent = item.toString();
    $detail.style.textAlign = "right";

    row.append($color, $detail);
    $colorTable.append(row);
    rows.push(row);
  }

  return rows;
}

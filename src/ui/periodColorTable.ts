import { periodToColor } from "../app";
import { $periodColorTable } from "../bind";
import type { AnalyzeResult } from "../lib/analyzeOscillator";

export function setPeriodColorTable(data: AnalyzeResult) {
  const rows: HTMLTableRowElement[] = [];

  const periodList = data.periodMap.periodList;

  $periodColorTable.replaceChildren();

  {
    const trHead = document.createElement("tr");

    const thColor = document.createElement("th");
    thColor.textContent = "Color";

    const thPeriod = document.createElement("th");
    thPeriod.textContent = "Period";

    trHead.append(thColor, thPeriod);
    $periodColorTable.append(trHead);
  }

  for (const p of periodList) {
    if (p === 0) {
      continue;
    }
    const row = document.createElement("tr");
    const color = periodToColor(periodList, p);
    const colorShow = document.createElement("td");
    colorShow.style.backgroundColor = color;
    colorShow.style.width = "40px";

    const periodShow = document.createElement("td");
    periodShow.textContent = p.toString();
    periodShow.style.textAlign = "right";

    row.append(colorShow, periodShow);
    $periodColorTable.append(row);
    rows.push(row);
  }

  return rows;
}

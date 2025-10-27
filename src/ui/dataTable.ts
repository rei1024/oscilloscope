import type { AnalyzeResult } from "../lib/analyzeOscillator";
import { getDirectionName } from "../lib/direction";
import { formatSpeed } from "../lib/formatSpeed";
import type { Size } from "../lib/rect";
import { MathExtra } from "../util/math";

type DataTableRow = {
  header: string;
  content: string;
  url?: string;
  details?: string;
};

function getDataTableRows(data: AnalyzeResult): DataTableRow[] {
  if (data.period === 1) {
    return getDataTableRowsForStillLife(data);
  } else if (data.isSpaceship) {
    return getDataTableRowsForSpaceship(data);
  } else {
    return getDataTableRowsForOscillator(data);
  }
}

function getBoundingBoxText({ width, height }: Size) {
  return `${width} x ${height} = ${width * height}`;
}

function getDataTableRowsForStillLife(data: AnalyzeResult): DataTableRow[] {
  return [
    {
      header: "Type",
      content: "Still life",
    },
    {
      header: "Population",
      content: data.population.min.toString(),
    },
    {
      header: "Bounding Box",
      content: getBoundingBoxText(data.boundingBox),
    },
    {
      header: "Density",
      content: (
        data.population.min /
        (data.boundingBox.width * data.boundingBox.height)
      ).toFixed(2),
    },
  ];
}

function getDataTableRowsForOscillator(data: AnalyzeResult): DataTableRow[] {
  const totalCells = data.stator + data.rotor;

  return [
    {
      header: "Type",
      content: "Oscillator",
    },
    {
      header: "Period",
      content: data.period.toString(),
    },
    {
      header: "Heat",
      content:
        data.heat.toFixed(2) + `, min = ${data.heatMin}, max = ${data.heatMax}`,
    },
    {
      header: "Temperature",
      content: data.temperature.toFixed(2),
    },
    {
      header: "Rotor temperature",
      content: data.rotorTemperature.toFixed(2),
    },
    {
      header: "Population",
      content: `min = ${data.population.min}, max = ${data.population.max}, avg = ${data.population.avg.toFixed(2)}, median = ${data.population.median}`,
    },
    {
      header: "Bounding Box",
      content:
        getBoundingBoxText(data.boundingBox) +
        ", " +
        `Min: ${getBoundingBoxText(data.boundingBoxMinArea.size)}, ` +
        ` Max: ${getBoundingBoxText(data.boundingBoxMaxArea.size)}`,
    },
    {
      header: "Cells",
      content: `stator = ${data.stator}, rotor = ${data.rotor}, total = ${totalCells}`,
    },
    {
      header: "Volatility",
      content: data.volatility.toFixed(3),
    },
    {
      header: "Strict volatility",
      content: data.strictVolatility.toFixed(3),
    },
    {
      header: "Is omnifrequent",
      content: isOmnifrequent(data),
      url: "https://conwaylife.com/forums/viewtopic.php?f=2&t=7026",
      ...(data.missingFrequencies.length === 0
        ? {}
        : {
            details: `missing ${compactRanges(data.missingFrequencies).join(", ")}`,
          }),
    },
  ];
}

function isOmnifrequent(data: AnalyzeResult): string {
  const missingFrequencies = data.missingFrequencies;
  if (missingFrequencies.length === 0) {
    return "Yes";
  }
  return `No (has ${data.frequencyMap.list.length}/${data.period})`;
}

/**
 * @param arr sorted
 * @returns
 */
function compactRanges(arr: number[]): string[] {
  const len = arr.length;
  if (len === 0) {
    return [];
  }
  const result = [];
  let start = arr[0];
  let end = arr[0];

  for (let i = 1; i < len; i++) {
    const item = arr[i];
    if (item === end + 1) {
      end = item;
    } else {
      result.push(start === end ? `${start}` : `${start}-${end}`);
      start = item;
      end = item;
    }
  }

  result.push(start === end ? `${start}` : `${start}-${end}`);
  return result;
}

// Do not show Heat, Temperature, Bounding Box, Cells, Volatility, Strict volatility
function getDataTableRowsForSpaceship(data: AnalyzeResult): DataTableRow[] {
  const speed = data.speed;

  const directionName = getDirectionName(speed.dx, speed.dy);
  const direction =
    speed.dx === 0 || speed.dy === 0
      ? "Orthogonal"
      : Math.abs(speed.dx) === Math.abs(speed.dy)
        ? "Diagonal"
        : "Oblique" + (directionName ? ` ${directionName}` : "");

  return [
    {
      header: "Type",
      content: "Spaceship",
    },
    {
      header: "Period",
      content: data.period.toString(),
    },
    {
      header: "Population",
      content: `min = ${data.population.min}, max = ${data.population.max}, avg = ${data.population.avg.toFixed(2)}, median = ${data.population.median}`,
    },
    {
      header: "Bounding Box",
      content:
        getBoundingBoxText(data.boundingBoxMovingEncloses) +
        ", " +
        `Min: ${getBoundingBoxText(data.boundingBoxMinArea.size)}, ` +
        ` Max: ${getBoundingBoxText(data.boundingBoxMaxArea.size)}`,
    },
    {
      header: "Direction",
      content: direction,
    },
    {
      header: "Speed",
      content:
        formatSpeed(speed.dx, speed.dy, data.period, true) +
        " (Unsimplified: " +
        formatSpeed(speed.dx, speed.dy, data.period, false) +
        ")",
    },
  ];
}

/**
 * Generates table rows based on analysis data and updates the target HTML table element.
 * @param $table The target HTMLTableElement to update.
 * @param data Analysis result data.
 */
function setDataTable($table: HTMLTableElement, data: AnalyzeResult) {
  // Clear existing table content.
  $table.textContent = "";

  const rows = getDataTableRows(data);

  // Build table rows from data.
  for (const row of rows) {
    const $tr = $table.insertRow();

    // Header cell (th)
    const $th = document.createElement("th");

    if (row.url) {
      const a = document.createElement("a");
      a.href = row.url;
      a.textContent = row.header;
      $th.append(a);
      $tr.append($th);
    } else {
      $th.textContent = row.header;
      $tr.appendChild($th);
    }

    // Content cell (td)
    const $td = $tr.insertCell();

    if (row.details) {
      const contentDiv = document.createElement("div");
      contentDiv.textContent = row.content;
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = "Details";
      summary.style.userSelect = "none";
      summary.style.cursor = "pointer";
      const detailsText = document.createElement("span");
      detailsText.textContent = row.details;
      details.append(summary, detailsText);
      $td.append(contentDiv, details);
    } else {
      $td.textContent = row.content;
    }
  }
}

export class DataTableUI {
  private $table: HTMLTableElement;
  constructor($table: HTMLTableElement) {
    this.$table = $table;
  }

  render(data: AnalyzeResult) {
    setDataTable(this.$table, data);
  }
}

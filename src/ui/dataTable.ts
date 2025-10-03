import type { AnalyzeResult } from "../lib/analyzeOscillator";
import { MathExtra } from "../util/math";

type DataTableRow = {
  header: string;
  content: string;
  url?: string;
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

function getBoundingBoxText({
  sizeX,
  sizeY,
}: {
  sizeX: number;
  sizeY: number;
}) {
  return `${sizeX} x ${sizeY} = ${sizeX * sizeY}`;
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
        (data.boundingBox.sizeX * data.boundingBox.sizeY)
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
    },
  ];
}

function isOmnifrequent(data: AnalyzeResult): string {
  const missingFrequencies = data.missingFrequencies;
  if (missingFrequencies.length === 0) {
    return "Yes";
  }
  return `No (has ${data.frequencyMap.list.length}/${data.period}, missing ${compactRanges(missingFrequencies).join(", ")})`;
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
      content:
        speed.dx === 0 || speed.dy === 0
          ? "Orthogonal"
          : Math.abs(speed.dx) === Math.abs(speed.dy)
            ? "Diagonal"
            : "Oblique",
    },
    {
      header: "Speed",
      content:
        speed.dx === 0 || speed.dy === 0
          ? stringifyFraction(Math.abs(speed.dx + speed.dy), data.period)
          : Math.abs(speed.dx) === Math.abs(speed.dy)
            ? stringifyFraction(Math.abs(speed.dx), data.period)
            : stringifyFraction2(
                Math.abs(speed.dx),
                Math.abs(speed.dy),
                data.period,
              ),
    },
  ];
}

function stringifyFraction(num: number, den: number) {
  const divideBy = MathExtra.gcd(num, den);
  const numSimple = Math.floor(num / divideBy);
  const denSimple = Math.floor(den / divideBy);

  return `${numSimple === 1 ? "" : numSimple}c${denSimple === 1 ? "" : `/${denSimple}`}`;
}

function stringifyFraction2(num0: number, num1: number, den: number) {
  const num01GCD = MathExtra.gcd(num0, num1);
  const divideBy = MathExtra.gcd(num01GCD, den);
  const num0Simple = Math.floor(num0 / divideBy);
  const num1Simple = Math.floor(num1 / divideBy);
  const denSimple = Math.floor(den / divideBy);

  // (2,1)c/6
  return `(${num0Simple},${num1Simple})c${denSimple === 1 ? "" : `/${denSimple}`}`;
}

/**
 * Generates table rows based on analysis data and updates the target HTML table element.
 * @param $table The target HTMLTableElement to update.
 * @param data Analysis result data.
 */
export function setDataTable($table: HTMLTableElement, data: AnalyzeResult) {
  // Clear existing table content.
  $table.textContent = "";

  const rows = getDataTableRows(data);
  console.log(rows);
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
    $td.textContent = row.content;
  }
}

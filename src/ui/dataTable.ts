import type { AnalyzeResult } from "../lib/analyzeOscillator";
import { MathExtra } from "../util/math";

type DataTableRow = {
  header: string;
  content: string;
};

function getDataTableRows(data: AnalyzeResult): DataTableRow[] {
  if (data.isSpaceship) {
    return getDataTableRowsForSpaceship(data);
  } else {
    return getDataTableRowsForOscillator(data);
  }
}

function getDataTableRowsForOscillator(data: AnalyzeResult): DataTableRow[] {
  const boundingBoxArea = data.boundingBox.sizeX * data.boundingBox.sizeY;
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
      content: data.heat.toFixed(2),
    },
    {
      header: "Temperature",
      content: data.temperature.toFixed(2),
    },
    {
      header: "Population",
      content: `min = ${data.population.min}, max = ${data.population.max}, avg = ${data.population.avg.toFixed(2)}, median = ${data.population.median}`,
    },
    {
      header: "Bounding Box",
      content: `${data.boundingBox.sizeX} x ${data.boundingBox.sizeY} = ${boundingBoxArea}`,
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
  ];
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

  // Build table rows from data.
  for (const row of rows) {
    const $tr = $table.insertRow();

    // Header cell (th)
    const $th = document.createElement("th");
    $th.textContent = row.header;
    $tr.appendChild($th);

    // Content cell (td)
    const $td = $tr.insertCell();
    $td.textContent = row.content;
  }
}

import type { AnalyzeResult } from "../lib/analyzeOscillator";
import {
  $outputArea,
  $outputCellsAvg,
  $outputCellsMax,
  $outputCellsMedian,
  $outputCellsMin,
  $outputHeight,
  $outputPeriod,
  $outputCells,
  $outputStrictVolatility,
  $outputVolatility,
  $outputWidth,
  $outputHeat,
  $outputTemperature,
} from "../bind";

export function setDataTable(data: AnalyzeResult) {
  $outputPeriod.textContent = data.period.toString();

  $outputHeat.textContent = data.heat.toFixed(2);

  $outputTemperature.textContent = data.temperature.toFixed(2);

  $outputCellsMin.textContent = data.population.min.toString();

  $outputCellsMax.textContent = data.population.max.toString();

  $outputCellsAvg.textContent = data.population.avg.toFixed(2);

  $outputCellsMedian.textContent = data.population.median.toString();

  $outputWidth.textContent = data.boundingBox.sizeX.toString();

  $outputHeight.textContent = data.boundingBox.sizeY.toString();

  $outputArea.textContent = (
    data.boundingBox.sizeX * data.boundingBox.sizeY
  ).toString();

  $outputCells.textContent = `stator = ${data.stator}, rotor = ${
    data.rotor
  }, total = ${data.stator + data.rotor}`;

  $outputVolatility.textContent = data.volatility.toFixed(3);
  $outputStrictVolatility.textContent = data.strictVolatility.toFixed(3);
}

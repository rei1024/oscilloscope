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
} from "../bind";

export function setDataTable(data: AnalyzeResult) {
  $outputPeriod.textContent = data.period.toString();

  $outputCellsMin.textContent = data.population.min.toString();

  $outputCellsMax.textContent = data.population.max.toString();

  $outputCellsAvg.textContent = data.population.avg.toString();

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

import type { AnalyzeResult } from "../lib/analyzeOscillator";
import {
  $outputArea,
  $outputCellsAvg,
  $outputCellsMax,
  $outputCellsMedian,
  $outputCellsMin,
  $outputHeight,
  $outputPeriod,
  $outputRotor,
  $outputStator,
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

  $outputStator.textContent = data.stator.toString();

  $outputRotor.textContent = data.rotor.toString();

  $outputVolatility.textContent = data.volatility;
}

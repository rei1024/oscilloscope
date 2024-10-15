import { BitGrid } from "@ca-ts/algo/bit";
import type { WorkerRequestMessage, WorkerResponseMessage } from "./worker";
import MyWorker from "./worker?worker";

const worker = new MyWorker();

export class App {
  constructor() {}
}

function post(req: WorkerRequestMessage) {
  worker.postMessage(req);
}

const $message = document.querySelector("#message") as HTMLElement;
const $outputTable = document.querySelector("#output-table") as HTMLElement;
worker.addEventListener("message", (e) => {
  const message = e.data as WorkerResponseMessage;
  $message.textContent = "";
  $outputTable.style.display = "none";

  $analyzeButton.disabled = false;
  if (message.kind === "response-error") {
    $message.textContent = "Error: " + message.message;
  } else {
    $outputTable.style.display = "block";
    const data = message.data;
    const bitGridData = data.bitGridData;
    const width32 = Math.ceil((bitGridData.width ?? 0) / 32);
    const height = bitGridData.height ?? 0;
    const hisotories = bitGridData.histories.map(
      (h) => new BitGrid(width32, height, h)
    );

    const $outputPeriod = document.querySelector(
      "#output-period"
    ) as HTMLElement;
    $outputPeriod.textContent = data.period.toString();
    const $outputCellsMin = document.querySelector(
      "#output-cells-min"
    ) as HTMLElement;
    $outputCellsMin.textContent = data.population.min.toString();

    const $outputCellsMax = document.querySelector(
      "#output-cells-max"
    ) as HTMLElement;
    $outputCellsMax.textContent = data.population.max.toString();

    const $outputCellsAvg = document.querySelector(
      "#output-cells-avg"
    ) as HTMLElement;
    $outputCellsAvg.textContent = data.population.avg.toString();

    const $outputCellsMedian = document.querySelector(
      "#output-cells-median"
    ) as HTMLElement;
    $outputCellsMedian.textContent = data.population.median.toString();

    const $outputWidth = document.querySelector("#output-width") as HTMLElement;
    $outputWidth.textContent = data.boundingBox.sizeX.toString();

    const $outputHeight = document.querySelector(
      "#output-height"
    ) as HTMLElement;
    $outputHeight.textContent = data.boundingBox.sizeY.toString();

    const $outputArea = document.querySelector("#output-area") as HTMLElement;
    $outputArea.textContent = (
      data.boundingBox.sizeX * data.boundingBox.sizeY
    ).toString();

    const $outputStator = document.querySelector(
      "#output-stator"
    ) as HTMLElement;
    $outputStator.textContent = data.stator.toString();

    const $outputRotor = document.querySelector("#output-rotor") as HTMLElement;
    $outputRotor.textContent = data.rotor.toString();

    const $outputVolatility = document.querySelector(
      "#output-volatility"
    ) as HTMLElement;
    $outputVolatility.textContent = data.volatility;
  }
});

const $input = document.querySelector("#input") as HTMLTextAreaElement;
const $analyzeButton = document.querySelector("#analyze") as HTMLButtonElement;

$analyzeButton.addEventListener("click", () => {
  $analyzeButton.disabled = true;
  post({ kind: "request-analyze", rle: $input.value });
});

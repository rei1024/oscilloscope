export const $message = document.querySelector("#message") as HTMLElement;

export const $mapBox = document.querySelector("#map-box") as HTMLElement;

export const $mapTypeSelect = [
  ...document.querySelectorAll('[name="map-type-select"]'),
] as HTMLInputElement[];

export const $showAnimationCheckbox = document.querySelector(
  "#show-animation-checkbox",
) as HTMLInputElement;

export const $showGridCheckbox = document.querySelector(
  "#show-grid-checkbox",
) as HTMLInputElement;

export const $dataBox = document.querySelector("#data-box") as HTMLElement;

export const $outputTable = document.querySelector(
  "#output-table",
) as HTMLElement;

export const $outputPeriod = document.querySelector(
  "#output-period",
) as HTMLElement;
export const $outputCellsMin = document.querySelector(
  "#output-cells-min",
) as HTMLElement;
export const $outputCellsMax = document.querySelector(
  "#output-cells-max",
) as HTMLElement;
export const $outputCellsAvg = document.querySelector(
  "#output-cells-avg",
) as HTMLElement;

export const $outputCellsMedian = document.querySelector(
  "#output-cells-median",
) as HTMLElement;

export const $outputWidth = document.querySelector(
  "#output-width",
) as HTMLElement;

export const $outputHeight = document.querySelector(
  "#output-height",
) as HTMLElement;

export const $outputArea = document.querySelector(
  "#output-area",
) as HTMLElement;

export const $outputCells = document.querySelector(
  "#output-cells",
) as HTMLElement;

export const $outputVolatility = document.querySelector(
  "#output-volatility",
) as HTMLElement;

export const $outputStrictVolatility = document.querySelector(
  "#output-strict-volatility",
) as HTMLElement;

export const $input = document.querySelector("#input") as HTMLTextAreaElement;
export const $analyzeButton = document.querySelector(
  "#analyze",
) as HTMLButtonElement;

export const $exampleOscillators = document.querySelector(
  "#example-oscillators",
) as HTMLSelectElement;

export const $canvas = document.querySelector("#canvas") as HTMLCanvasElement;

export const $hoverInfo = document.querySelector("#hover-info") as HTMLElement;

export const $animFrequency = document.querySelector(
  "#anim-frequency",
) as HTMLInputElement;

export const $animFrequencyLabel = document.querySelector(
  "#anim-frequency-label",
) as HTMLInputElement;

export const $generation = document.querySelector("#generation") as HTMLElement;

export const $colorTable = document.querySelector(
  "#color-table",
) as HTMLTableElement;

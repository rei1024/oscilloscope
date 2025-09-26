function $(selector: string): HTMLElement {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  return element as HTMLElement;
}

export const $message = $("#message") as HTMLElement;

export const $mapBox = $("#map-box") as HTMLElement;

export const $mapTypeSelect = [
  ...document.querySelectorAll('[name="map-type-select"]'),
] as HTMLInputElement[];

export const $showAnimationCheckbox = $(
  "#show-animation-checkbox",
) as HTMLInputElement;

export const $showGridCheckbox = $("#show-grid-checkbox") as HTMLInputElement;

export const $blackBackgroundCheckbox = $(
  "#black-background-checkbox",
) as HTMLInputElement;

export const $dataBox = $("#data-box") as HTMLElement;

export const $outputTable = $("#output-table") as HTMLElement;

export const $outputPeriod = $("#output-period") as HTMLElement;
export const $outputHeat = $("#output-heat") as HTMLElement;
export const $outputTemperature = $("#output-temperature") as HTMLElement;

export const $outputCellsMin = $("#output-cells-min") as HTMLElement;
export const $outputCellsMax = $("#output-cells-max") as HTMLElement;
export const $outputCellsAvg = $("#output-cells-avg") as HTMLElement;

export const $outputCellsMedian = $("#output-cells-median") as HTMLElement;

export const $outputWidth = $("#output-width") as HTMLElement;

export const $outputHeight = $("#output-height") as HTMLElement;

export const $outputArea = $("#output-area") as HTMLElement;

export const $outputCells = $("#output-cells") as HTMLElement;

export const $outputVolatility = $("#output-volatility") as HTMLElement;

export const $outputStrictVolatility = $(
  "#output-strict-volatility",
) as HTMLElement;

export const $input = $("#input") as HTMLTextAreaElement;
export const $analyzeButton = $("#analyze") as HTMLButtonElement;

export const $exampleOscillators = $(
  "#example-oscillators",
) as HTMLSelectElement;

export const $canvas = $("#canvas") as HTMLCanvasElement;

export const $hoverInfo = $("#hover-info") as HTMLElement;

export const $animFrequency = $("#anim-frequency") as HTMLInputElement;

export const $animFrequencyLabel = $(
  "#anim-frequency-label",
) as HTMLInputElement;

export const $generation = $("#generation") as HTMLElement;

export const $colorTable = $("#color-table") as HTMLTableElement;

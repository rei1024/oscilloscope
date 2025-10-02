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

export const $colorSelectContainer = $(
  "#color-select-container",
) as HTMLElement;

export const $colorSelect = [
  ...document.querySelectorAll('[name="color-select"]'),
] as HTMLInputElement[];

export const $showAnimationCheckbox = $(
  "#show-animation-checkbox",
) as HTMLInputElement;

export const $showGridCheckbox = $("#show-grid-checkbox") as HTMLInputElement;

export const $darkModeCheckbox = $("#dark-mode-checkbox") as HTMLInputElement;

export const $dataBox = $("#data-box") as HTMLElement;

export const $outputTable = $("#output-table") as HTMLTableElement;

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

import type { AnalyzeResult } from "../lib/analyzeOscillator";
import type { Valve } from "./valve";

const frequencyList = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200,
  300, 400, 500,
];

export class FrequencyUI {
  private $label: HTMLElement;
  private $input: HTMLInputElement;
  private valve: Valve;
  constructor($label: HTMLElement, $input: HTMLInputElement, valve: Valve) {
    this.$label = $label;
    this.$input = $input;
    this.valve = valve;
  }

  setup(data: AnalyzeResult) {
    this.$input.style.display = "inline";

    this.$input.min = (0).toString();
    this.$input.max = (frequencyList.length - 1).toString();
    this.$input.value = (
      data.histories.length <= 3
        ? frequencyList.filter((x) => x <= 3).length - 1
        : data.histories.length <= 10
          ? frequencyList.filter((x) => x <= 10).length - 1
          : "10"
    ).toString();

    this.$label.textContent = this.valve.frequency.toLocaleString() + "Hz";
  }

  render({ showAnimationChecked }: { showAnimationChecked: boolean }) {
    this.$label.textContent = this.valve.frequency.toLocaleString() + "Hz";
    if (showAnimationChecked) {
      this.$input.style.display = "";
      this.$label.style.display = "";
    } else {
      this.$input.style.display = "none";
      this.$label.style.display = "none";
    }
  }

  updateFrequency() {
    return frequencyList[parseInt(this.$input.value, 10)];
  }
}

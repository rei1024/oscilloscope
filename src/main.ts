import type { WorkerRequestMessage, WorkerResponseMessage } from "./worker";
import MyWorker from "./worker?worker";
import {
  $analyzeButton,
  $animFrequency,
  $canvas,
  $colorSelect,
  $darkModeCheckbox,
  $exampleOscillators,
  $input,
  $mapTypeSelect,
  $message,
  $outputTable,
  $showAnimationCheckbox,
  $showGridCheckbox,
} from "./bind";
import { setDataTable } from "./ui/dataTable";

import { App } from "./app";
import { getMousePositionInElement } from "./ui/getMousePositionInElement";
import type { ColorType, MapType } from "./ui/core";
import { setupShowAnimationCheckbox } from "./ui/show-animation-checkbox";
import { setupDarkModeCheckbox } from "./ui/dark-mode-checkbox";

setupShowAnimationCheckbox(() => {
  app.valveEnable($showAnimationCheckbox.checked);
  app.render();
});

setupDarkModeCheckbox(() => {
  app.render();
});

const worker = new MyWorker();

const app = new App($canvas);

function post(req: WorkerRequestMessage) {
  worker.postMessage(req);
}

let analyzingDelayTimeoutId: number | null = null;

worker.addEventListener("message", (e) => {
  const message = e.data as WorkerResponseMessage;
  $message.textContent = "";
  $message.style.display = "none";
  $outputTable.style.display = "none";

  $analyzeButton.disabled = false;
  if (analyzingDelayTimeoutId) {
    clearTimeout(analyzingDelayTimeoutId);
  }
  $analyzeButton.textContent = "Analyze";
  if (message.kind === "response-error") {
    $message.style.display = "block";
    $message.textContent = "Error: " + message.message;
    $message.style.backgroundColor = "#fecaca";
  } else {
    $outputTable.style.display = "block";
    const data = message.data;
    setDataTable($outputTable, data);
    app.setup(data);
  }
});

$analyzeButton.addEventListener("click", () => {
  $analyzeButton.disabled = true;
  if (analyzingDelayTimeoutId) {
    clearTimeout(analyzingDelayTimeoutId);
  }
  analyzingDelayTimeoutId = setTimeout(() => {
    $analyzeButton.textContent = "Analyzing";
  }, 200);
  post({ kind: "request-analyze", rle: $input.value });
});

$animFrequency.addEventListener("input", () => {
  app.updateFrequency();
  app.render();
});

$canvas.addEventListener("mousemove", (e) => {
  const position = getMousePositionInElement($canvas, e);
  app.renderColorTableHighlight(position);
});

$canvas.addEventListener("mouseleave", (e) => {
  const position = getMousePositionInElement($canvas, e);
  app.renderColorTableHighlight(position);
});

for (const $radio of $mapTypeSelect) {
  $radio.addEventListener("input", (e) => {
    (e.target as HTMLInputElement).value;
    app.updateMapType((e.target as HTMLInputElement).value as MapType);
  });
}

for (const $radio of $colorSelect) {
  $radio.addEventListener("input", (e) => {
    (e.target as HTMLInputElement).value;
    app.updateColor((e.target as HTMLInputElement).value as ColorType);
  });
}

const examples = [
  { name: "P96 Hans Leo hassler", src: "p96hansleohassler.rle" },
  {
    name: "Figure eight on pentadecathlon",
    src: "cisfigureeightonpentadecathlon.rle",
  },
  { name: "Kok's galaxy", src: "koksgalaxy.rle" },
  {
    name: "Statorless p3",
    src: "statorlessp3.rle",
  },
  {
    name: "p43 Snark loop",
    src: "p43gliderloop.rle",
  },
  {
    name: "Cribbage",
    src: "cribbage.rle",
  },
  {
    name: "David Hilbert",
    src: "davidhilbert.rle",
  },
  {
    name: "Glider",
    src: "glider.rle",
  },
  {
    name: "Sir Robin",
    src: "sirrobin.rle",
  },
];

for (const example of examples) {
  const option = document.createElement("option");
  option.textContent = example.name;
  option.value = example.src;
  $exampleOscillators.append(option);
}

$exampleOscillators.addEventListener("change", async () => {
  if ($exampleOscillators.value === "") {
    return;
  }
  const response = await fetch(
    "/oscilloscope/data/" + $exampleOscillators.value,
  );
  if (!response.ok) {
    throw new Error("fetch error");
  }
  const text = await response.text();
  $input.value = text;
});

$input.addEventListener("input", () => {
  $exampleOscillators.value = "";
});

$showGridCheckbox.addEventListener("change", () => {
  app.render();
});

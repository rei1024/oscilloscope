import "./style.css";
import type { WorkerRequestMessage, WorkerResponseMessage } from "./worker";
import MyWorker from "./worker?worker";
import {
  $analyzeButton,
  $animFrequency,
  $canvas,
  $exampleOscillators,
  $input,
  $message,
  $outputTable,
} from "./bind";
import { setTable } from "./ui/table";

import { App } from "./app";
import { getMousePositionInElement } from "./ui/getMousePositionInElement";

const worker = new MyWorker();

const app = new App($canvas);

function post(req: WorkerRequestMessage) {
  worker.postMessage(req);
}

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
    setTable(data);
    app.setup(data);
  }
});

$analyzeButton.addEventListener("click", () => {
  $analyzeButton.disabled = true;
  post({ kind: "request-analyze", rle: $input.value });
});

$animFrequency.addEventListener("input", () => {
  app.updateFrequency();
});

$canvas.addEventListener("mousemove", (e) => {
  const position = getMousePositionInElement($canvas, e);
  app.renderPeriodTableHighlight(position);
});

const examples = [
  { name: "P96 Hans Leo hassler", src: "p96hansleohassler.rle" },
  {
    name: "Figure eight on pentadecathlon",
    src: "cisfigureeightonpentadecathlon.rle",
  },
  { name: "Kok's galaxy", src: "koksgalaxy.rle" },
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
    "/oscilloscope/data/" + $exampleOscillators.value
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

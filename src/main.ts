import "./style.css";
import { BitGrid } from "@ca-ts/algo/bit";
import type { WorkerRequestMessage, WorkerResponseMessage } from "./worker";
import MyWorker from "./worker?worker";
import {
  $analyzeButton,
  $canvas,
  $input,
  $message,
  $outputTable,
} from "./bind";
import { setTable } from "./ui/table";

import { App } from "./app";

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

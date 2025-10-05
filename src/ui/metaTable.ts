import { $metaBox } from "../bind";
import type { AnalyzeResult } from "../lib/analyzeOscillator";
import type { WorkerResponseMessageSignature } from "../worker";

type DataTableRow = {
  header: string;
  content: string;
  url?: string;
};

function formatTime(
  data: AnalyzeResult,
  signature: WorkerResponseMessageSignature | null,
) {
  return (
    `Run: ${(Math.floor(data.performance.runningTimeMilliseconds) / 1000).toString()}s, Stats and Map: ${(Math.floor(data.performance.calclationTimeMilliseconds) / 1000).toString()}s` +
    (signature == null
      ? ""
      : `, Signature map: ${(Math.floor(signature.signatureTimeMilliseconds) / 1000).toString()}s`)
  );
}

function getMetaTableRows(
  data: AnalyzeResult,
  signature: WorkerResponseMessageSignature | null,
): DataTableRow[] {
  return [
    {
      header: "Time",
      content: formatTime(data, signature),
    },
  ];
}

/**
 * Generates table rows based on analysis data and updates the target HTML table element.
 * @param $table The target HTMLTableElement to update.
 * @param data Analysis result data.
 */
function setDataTable(
  $table: HTMLTableElement,
  data: AnalyzeResult,
  signature: WorkerResponseMessageSignature | null,
) {
  // Clear existing table content.
  $table.textContent = "";

  const rows = getMetaTableRows(data, signature);

  // Build table rows from data.
  for (const row of rows) {
    const $tr = $table.insertRow();

    // Header cell (th)
    const $th = document.createElement("th");

    if (row.url) {
      const a = document.createElement("a");
      a.href = row.url;
      a.textContent = row.header;
      $th.append(a);
      $tr.append($th);
    } else {
      $th.textContent = row.header;
      $tr.appendChild($th);
    }

    // Content cell (td)
    const $td = $tr.insertCell();
    $td.textContent = row.content;
  }
}

export class MetaTableUI {
  private $table: HTMLTableElement;
  constructor($table: HTMLTableElement) {
    this.$table = $table;
  }

  render(
    data: AnalyzeResult,
    signature: WorkerResponseMessageSignature | null,
  ) {
    $metaBox.style.display = "";
    this.$table.style.display = "";
    setDataTable(this.$table, data, signature);
  }
}

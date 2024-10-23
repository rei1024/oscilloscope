import { analyzeOscillator, type AnalyzeResult } from "./lib/analyzeOscillator";
import { parseRLE } from "@ca-ts/rle";
import { parseRule } from "@ca-ts/rule";

export type WorkerRequestMessage = {
  kind: "request-analyze";
  rle: string;
};

export type WorkerResponseMessage =
  | {
      kind: "response-analyzed";
      data: AnalyzeResult;
    }
  | {
      kind: "response-error";
      message: string;
    };

function handleRequest(data: WorkerRequestMessage): WorkerResponseMessage {
  let rle;
  let rule;
  if (data.rle.trim() === "") {
    return {
      kind: "response-error",
      message: "RLE is empty",
    };
  }
  try {
    rle = parseRLE(data.rle);
    rule = parseRule(rle.ruleString);
  } catch (error) {
    console.error(error);
    return {
      kind: "response-error",
      message: "Unsupported rule or rle error",
    };
  }

  if (rule.type === "outer-totalistic" && rule.transition.birth.includes(0)) {
    return {
      kind: "response-error",
      message: "Rules containing B0 is not supported",
    };
  } else if (rule.type === "int" && rule.transition.birth.includes("0")) {
    return {
      kind: "response-error",
      message: "Rules containing B0 is not supported",
    };
  }

  const cells = rle.cells.filter((x) => x.state === 1).map((x) => x.position);
  if (cells.length === 0) {
    return {
      kind: "response-error",
      message: "Empty pattern",
    };
  }

  try {
    const result = analyzeOscillator({
      cells: cells,
      rule:
        rule.type === "int"
          ? { intTransition: rule.transition }
          : { transition: rule.transition },
      maxGeneration: rule.type === "int" ? 2_000 : 50_000,
    });
    return { kind: "response-analyzed", data: result };
  } catch (error) {
    console.error(error);
    return {
      kind: "response-error",
      message: "Analyzation Error",
    };
  }
}

onmessage = (e) => {
  const data = e.data as WorkerRequestMessage;
  function post(res: WorkerResponseMessage) {
    postMessage(res);
  }
  post(handleRequest(data));
};

import { analyzeOscillator, AnalyzeResult } from "./lib/analyzeOscillator";
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

onmessage = (e) => {
  const data = e.data as WorkerRequestMessage;
  function post(res: WorkerResponseMessage) {
    postMessage(res);
  }
  let rle;
  let rule;
  try {
    rle = parseRLE(data.rle);
    rule = parseRule(rle.ruleString);
  } catch (error) {
    post({
      kind: "response-error",
      message: "Unsupported rule or rle error",
    });
    return;
  }

  if (rule.type !== "outer-totalistic") {
    post({
      kind: "response-error",
      message: "Unsupported rule",
    });
    return;
  }
  try {
    const result = analyzeOscillator(
      rle.cells.filter((x) => x.state === 1).map((x) => x.position),
      rule.transition,
      { maxGeneration: 100_000 }
    );
    post({ kind: "response-analyzed", data: result });
  } catch (error) {
    post({
      kind: "response-error",
      message: "Analyzation Error",
    });
  }
};

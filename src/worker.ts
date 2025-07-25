import { analyzeOscillator, type AnalyzeResult } from "./lib/analyzeOscillator";
import { parseRLE } from "@ca-ts/rle";
import { parseRule } from "@ca-ts/rule";
import { MaxGenerationError } from "./lib/runOscillator";

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
  let rule: ReturnType<typeof parseRule> | "LifeHistory";
  if (data.rle.trim() === "") {
    return {
      kind: "response-error",
      message: "RLE is empty",
    };
  }
  try {
    rle = parseRLE(data.rle);
    if (rle.ruleString.trim() === "") {
      rle.ruleString = "B3/S23";
    }
    rule = parseRule(rle.ruleString);
  } catch (error) {
    if (rle?.ruleString.toLowerCase() === "lifehistory") {
      // LifeHistory
      rule = {
        type: "outer-totalistic",
        transition: {
          birth: [3],
          survive: [2, 3],
        },
      };
      rle.cells = rle.cells.map((cell) => {
        return {
          ...cell,
          state: cell.state % 2 === 0 ? 0 : 1,
        };
      });
    } else {
      console.error(error);
      return {
        kind: "response-error",
        message: "Unsupported rule or rle error",
      };
    }
  }

  if (rule.type === "outer-totalistic") {
    if (rule.generations != undefined) {
      return {
        kind: "response-error",
        message: "Generations is not supported",
      };
    }
    if (rule.neighborhood != undefined) {
      return {
        kind: "response-error",
        message: "Hexagonal or von Neumann neighborhood is not supported",
      };
    }
    if (rule.transition.birth.includes(0)) {
      return {
        kind: "response-error",
        message: "Rules containing B0 is not supported",
      };
    }
  }

  if (rule.type === "int" && rule.transition.birth.includes("0")) {
    return {
      kind: "response-error",
      message: "Rules containing B0 is not supported",
    };
  }

  if (rule.type === "map" && rule.neighbors !== "moore") {
    return {
      kind: "response-error",
      message: "Non Moore neighborhood is not suuported for MAP rules",
    };
  }

  const cells = rle.cells.filter((x) => x.state === 1).map((x) => x.position);
  if (cells.length === 0) {
    return {
      kind: "response-error",
      message: "Empty pattern",
    };
  }
  const maxGeneration = 50_000;
  try {
    const result = analyzeOscillator({
      cells: cells,
      rule: rule,
      maxGeneration: maxGeneration,
    });
    return { kind: "response-analyzed", data: result };
  } catch (error) {
    console.error(error);
    if (error instanceof MaxGenerationError) {
      return {
        kind: "response-error",
        message: `maximum period is ${maxGeneration.toLocaleString()}`,
      };
    }
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

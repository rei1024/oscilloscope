import { analyzeOscillator, type AnalyzeResult } from "./lib/analyzeOscillator";
import { parseRLE } from "@ca-ts/rle";
import { parseRule, type GridParameter } from "@ca-ts/rule";
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

function isInfiniteGrid(
  gridParameter: GridParameter | null | undefined,
): boolean {
  if (gridParameter == null) {
    return true;
  }
  if (
    (gridParameter.topology.type === "P" ||
      gridParameter.topology.type === "T") &&
    gridParameter.size.width === 0 &&
    gridParameter.size.height === 0
  ) {
    return true;
  }
  return false;
}

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
  } catch (error) {
    return {
      kind: "response-error",
      message: "Invalid RLE",
    };
  }

  // LifeHistory and LifeSuper
  const lowerRuleString = rle.ruleString.toLowerCase();
  const suffix = ["history", "super"];
  for (const s of suffix) {
    if (lowerRuleString.endsWith(s)) {
      rle.ruleString = rle.ruleString.slice(0, -s.length);
      rle.cells = rle.cells.map((cell) => {
        return {
          ...cell,
          state: cell.state % 2 === 0 ? 0 : 1,
        };
      });
      break;
    }
  }

  try {
    rule = parseRule(rle.ruleString);
  } catch (error) {
    console.error(error);
    return {
      kind: "response-error",
      message: "Unsupported rule",
    };
  }

  if (rule.type === "outer-totalistic") {
    if (rule.generations != undefined) {
      return {
        kind: "response-error",
        message: "Generations is not supported",
      };
    }
    const unsupportedNeighborhoods = [
      "hexagonal",
      "von-neumann",
      "triangular",
    ] as const;
    if (
      rule.neighborhood &&
      unsupportedNeighborhoods.includes(rule.neighborhood)
    ) {
      return {
        kind: "response-error",
        message: `${
          {
            hexagonal: "Hexagonal",
            "von-neumann": "von Neumann",
            triangular: "Triangular",
          }[rule.neighborhood]
        } neighborhood is not supported`,
      };
    }
    if (rule.neighborhood != undefined) {
      return {
        kind: "response-error",
        message: "Unsupported neighborhood",
      };
    }
    if (rule.transition.birth.includes(0)) {
      return {
        kind: "response-error",
        message: "Rules containing B0 is not supported",
      };
    }
    if (!isInfiniteGrid(rule.gridParameter)) {
      return {
        kind: "response-error",
        message: "Bounded grids are not supported",
      };
    }
  }

  if (rule.type === "int") {
    if (rule.transition.birth.includes("0")) {
      return {
        kind: "response-error",
        message: "Rules containing B0 is not supported",
      };
    }
    if (rule.generations != undefined) {
      return {
        kind: "response-error",
        message: "Generations is not supported",
      };
    }
    if (!isInfiniteGrid(rule.gridParameter)) {
      return {
        kind: "response-error",
        message: "Bounded grids are not supported",
      };
    }
  }

  if (rule.type === "map") {
    if (rule.neighbors !== "moore") {
      return {
        kind: "response-error",
        message: "Non Moore neighborhood is not supported for MAP rules",
      };
    }
    if (!isInfiniteGrid(rule.gridParameter)) {
      return {
        kind: "response-error",
        message: "Bounded grids are not supported",
      };
    }
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

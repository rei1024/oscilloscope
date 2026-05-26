import { ParseRuleError } from "@ca-ts/rule";

const DEFAULT_ERROR = "Unsupported rule";

/**
 * Get an error message from the error thrown by `parseRule`
 */
export function getErrorMessageForParseRule(error: unknown): string {
  if (!(error instanceof Error)) {
    return DEFAULT_ERROR;
  }
  if (typeof AggregateError === "undefined") {
    return DEFAULT_ERROR;
  }
  if (!(error instanceof AggregateError)) {
    return DEFAULT_ERROR;
  }

  const errors = error.errors.flatMap((x) =>
    x instanceof ParseRuleError ? [x] : [],
  );

  const topologyError = errors.find((e) => e.kind === "topology");
  if (topologyError) {
    return topologyError.message;
  }

  const generationsError = errors.find((e) => e.kind === "generations");
  if (generationsError) {
    return generationsError.message;
  }

  const transitionError = errors.find((e) => e.kind === "transition");
  if (transitionError) {
    return transitionError.message;
  }

  return DEFAULT_ERROR;
}

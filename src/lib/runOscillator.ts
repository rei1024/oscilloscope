import type { INTRule, MAPRule, OuterTotalisticRule } from "@ca-ts/rule";
import { WorldWithHistory } from "./WorldWithHistory";

export type RunOscillatorConfig = {
  cells: { x: number; y: number }[];
  rule: OuterTotalisticRule | INTRule | MAPRule;
  maxGeneration: number;
};

export type RunOscillatorResult = {
  world: WorldWithHistory;
};

export class MaxGenerationError extends Error {
  constructor(maxGen: number) {
    super("Maximum generation is " + maxGen);
  }
}

export function runOscillator(
  config: RunOscillatorConfig,
): RunOscillatorResult {
  const { cells, rule, maxGeneration } = config;

  const world = new WorldWithHistory({ cells, rule });
  const result = world.run({
    forceStop: () => world.getGen() >= maxGeneration,
  });
  if (result === "forced-stop") {
    throw new MaxGenerationError(config.maxGeneration);
  }
  return {
    world,
  };
}

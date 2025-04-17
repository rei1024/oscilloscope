import type { INTRule, MAPRule, OuterTotalisticRule } from "@ca-ts/rule";
import { WorldSizeError, WorldWithHistory } from "./WorldWithHistory";

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
  let bufferSize = 16;
  for (let i = 0; i < 5; i++) {
    try {
      const world = new WorldWithHistory({ cells, bufferSize, rule });
      const result = world.run({
        forceStop: () => world.getGen() >= maxGeneration,
      });
      if (result === "forced-stop") {
        throw new MaxGenerationError(config.maxGeneration);
      }
      return {
        world,
      };
    } catch (error) {
      if (error instanceof WorldSizeError) {
        bufferSize += 32;
      } else {
        throw error;
      }
    }
  }

  throw new Error("Error: Oscillator not detected");
}

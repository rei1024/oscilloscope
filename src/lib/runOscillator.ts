import { WorldSizeError, WorldWithHistory } from "./WorldWithHistory";

export type RunOscillatorConfig = {
  cells: { x: number; y: number }[];
  rule:
    | {
        transition: { birth: number[]; survive: number[] };
      }
    | {
        intTransition: { birth: string[]; survive: string[] };
      };
  maxGeneration: number;
};

export type RunOscillatorResult = {
  world: WorldWithHistory;
};

export function runOscillator(
  config: RunOscillatorConfig
): RunOscillatorResult {
  const { cells, rule, maxGeneration } = config;
  let bufferSize = 32;
  for (let i = 0; i < 5; i++) {
    try {
      const world = new WorldWithHistory({ cells, bufferSize, rule });
      const result = world.run({
        forceStop: () => world.getGen() >= maxGeneration,
      });
      if (result === "forced-stop") {
        throw new Error("Max Generations.");
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

  throw new Error("Error: analyzeOscillator");
}

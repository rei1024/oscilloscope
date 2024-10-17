import { WorldSizeError, WorldWithHistory } from "./WorldWithHistory";

export type RunOscillatorConfig = {
  cells: { x: number; y: number }[];
  transition: { birth: number[]; survive: number[] };
  maxGeneration: number;
};

export type RunOscillatorResult = {
  world: WorldWithHistory;
  data: {
    histories: Uint32Array[];
    width: number | null;
    height: number | null;
  };
};

export function runOscillator(
  config: RunOscillatorConfig
): RunOscillatorResult {
  const { cells, transition, maxGeneration } = config;
  let bufferSize = 32;
  for (let i = 0; i < 5; i++) {
    try {
      const world = new WorldWithHistory({ cells, bufferSize, transition });
      world.run({ forceStop: () => world.getGen() >= maxGeneration });
      return {
        world,
        data: {
          histories: world.histories.map((a) =>
            a.bitGrid.asInternalUint32Array()
          ),
          width: world.histories[0]?.bitGrid.getWidth() ?? null,
          height: world.histories[0]?.bitGrid.getHeight() ?? null,
        },
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

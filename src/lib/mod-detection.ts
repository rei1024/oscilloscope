import type { BitGrid } from "@ca-ts/algo/bit";

export type Position = { x: number; y: number };

/**
 * The 8 symmetry transformations of the 2D square grid (Dihedral Group D4).
 */
export const SYMMETRY_TRANSFORMS: ((pos: Position) => Position)[] = [
  ({ x, y }) => ({ x, y }), // Identity (0°)
  ({ x, y }) => ({ x: -y, y: x }), // Rotate 90° CW
  ({ x, y }) => ({ x: -x, y: -y }), // Rotate 180°
  ({ x, y }) => ({ x: y, y: -x }), // Rotate 270° CW
  ({ x, y }) => ({ x: -x, y }), // Reflect Horizontal (Flip X)
  ({ x, y }) => ({ x, y: -y }), // Reflect Vertical (Flip Y)
  ({ x, y }) => ({ x: y, y: x }), // Reflect Diagonal (y = x)
  ({ x, y }) => ({ x: -y, y: -x }), // Reflect Anti-diagonal (y = -x)
];

/**
 * Finds the top-row-left cell position (minimum Y, then minimum X)
 * of a BitGrid after applying a coordinate transformation.
 */
function getTopRowLeftOfTransformed(
  grid: BitGrid,
  transform: (pos: Position) => Position,
): Position | null {
  let minPos: Position | null = null;
  grid.forEachAlive((x, y) => {
    const p = transform({ x, y });
    if (
      minPos === null ||
      p.y < minPos.y ||
      (p.y === minPos.y && p.x < minPos.x)
    ) {
      minPos = p;
    }
  });
  return minPos;
}

/**
 * Checks whether `other` is identical to `self` under any of the 8 grid symmetries
 * (rotation/reflection) modulo translation.
 */
export function isSameWithSymm(self: BitGrid, other: BitGrid): boolean {
  const aPopulation = self.getPopulation();
  const bPopulation = other.getPopulation();
  if (aPopulation !== bPopulation) {
    return false;
  }
  if (aPopulation === 0) {
    return true;
  }

  const bPos = other.getTopRowLeftCellPosition();
  if (bPos === null) {
    return false;
  }

  for (const convert of SYMMETRY_TRANSFORMS) {
    const aPos = getTopRowLeftOfTransformed(self, convert);
    if (aPos === null) {
      continue;
    }

    const dx = bPos.x - aPos.x;
    const dy = bPos.y - aPos.y;

    let match = true;
    self.forEachAliveWithBreak((x, y) => {
      const p = convert({ x, y });
      if (other.getMaybe(p.x + dx, p.y + dy) !== 1) {
        match = false;
        return true; // Exits iteration early
      }
      return false;
    });

    if (match) {
      return true;
    }
  }

  return false;
}

/**
 * Calculates the mod of an oscillator or spaceship given its phase histories.
 * The mod is the smallest number of generations (1 <= mod <= period) after which
 * the pattern reappears in its original form up to rotation or reflection.
 */
export function detectMod(histories: BitGrid[]): number {
  if (histories.length <= 1) {
    return histories.length;
  }
  const period = histories.length;
  const first = histories[0];
  if (!first) {
    return period;
  }

  for (let i = 1; i < period; i++) {
    if (period % i === 0 && isSameWithSymm(first, histories[i]!)) {
      return i;
    }
  }

  return period;
}

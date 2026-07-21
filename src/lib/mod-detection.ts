import type { BitGrid } from "@ca-ts/algo/bit";

export type Position = { x: number; y: number };

/**
 * Pre-extracted alive cell data of a BitGrid to avoid re-extracting coordinates
 * across multiple symmetry checks.
 */
export type PreparedGrid = {
  _isPrepared: true;
  grid: BitGrid;
  population: number;
  xs: Int32Array;
  ys: Int32Array;
  x0: number;
  y0: number;
};

/**
 * Prepares a BitGrid by extracting its population and alive cell coordinates once.
 */
export function prepareGrid(grid: BitGrid): PreparedGrid {
  const population = grid.getPopulation();
  const xs = new Int32Array(population);
  const ys = new Int32Array(population);
  let idx = 0;
  grid.forEachAlive((x, y) => {
    xs[idx] = x;
    ys[idx] = y;
    idx++;
  });
  return {
    _isPrepared: true,
    grid,
    population,
    xs,
    ys,
    x0: xs[0] ?? 0,
    y0: ys[0] ?? 0,
  };
}

/**
 * Transforms a 2D coordinate according to one of the 8 grid symmetries (Dihedral Group D4).
 *
 * 0: Identity (0°)
 * 1: Rotate 90° CW
 * 2: Rotate 180°
 * 3: Rotate 270° CW
 * 4: Reflect Horizontal (Flip X)
 * 5: Reflect Vertical (Flip Y)
 * 6: Reflect Diagonal (y = x)
 * 7: Reflect Anti-diagonal (y = -x)
 */
export function transformCoord(x: number, y: number, sym: number): Position {
  switch (sym) {
    case 0:
      return { x, y };
    case 1:
      return { x: -y, y: x };
    case 2:
      return { x: -x, y: -y };
    case 3:
      return { x: y, y: -x };
    case 4:
      return { x: -x, y };
    case 5:
      return { x, y: -y };
    case 6:
      return { x: y, y: x };
    case 7:
      return { x: -y, y: -x };
    default:
      throw new Error(`Invalid symmetry index: ${sym}`);
  }
}

/**
 * Checks whether `other` is identical to `self` under any of the 8 grid symmetries
 * (rotation/reflection) modulo translation.
 *
 * Accepts either a raw `BitGrid` or a pre-extracted `PreparedGrid`.
 */
export function isSameWithSymm(
  self: BitGrid | PreparedGrid,
  other: BitGrid,
): boolean {
  const isPrep = "_isPrepared" in self;
  const selfGrid = isPrep ? self.grid : self;
  const aPopulation = isPrep ? self.population : self.getPopulation();
  const bPopulation = other.getPopulation();

  if (aPopulation !== bPopulation) {
    return false;
  }
  if (aPopulation === 0) {
    return true;
  }

  // Fast path: Check Identity symmetry first (0° rotation)
  if (selfGrid.isSamePatternIgnoreTranslation(other)) {
    return true;
  }

  const bPos = other.getTopRowLeftCellPosition();
  if (bPos === null) {
    return false;
  }

  // Reuse prepared grid or prepare ONCE if BitGrid was passed
  const prep: PreparedGrid = isPrep ? self : prepareGrid(self);
  const { xs, ys, x0, y0 } = prep;

  // Check remaining 7 symmetries (indices 1 to 7)
  for (let sym = 1; sym < 8; sym++) {
    // Initialize minTx and minTy with the transformed coordinates of cell i = 0.
    let minTx = 0;
    let minTy = 0;

    switch (sym) {
      case 1:
        minTx = -y0;
        minTy = x0;
        break;
      case 2:
        minTx = -x0;
        minTy = -y0;
        break;
      case 3:
        minTx = y0;
        minTy = -x0;
        break;
      case 4:
        minTx = -x0;
        minTy = y0;
        break;
      case 5:
        minTx = x0;
        minTy = -y0;
        break;
      case 6:
        minTx = y0;
        minTy = x0;
        break;
      case 7:
        minTx = -y0;
        minTy = -x0;
        break;
    }

    // Pass 1: Find top-row-left cell of transformed pattern starting from i = 1
    for (let i = 1; i < aPopulation; i++) {
      const x = xs[i]!;
      const y = ys[i]!;
      let tx = 0;
      let ty = 0;

      switch (sym) {
        case 1:
          tx = -y;
          ty = x;
          break;
        case 2:
          tx = -x;
          ty = -y;
          break;
        case 3:
          tx = y;
          ty = -x;
          break;
        case 4:
          tx = -x;
          ty = y;
          break;
        case 5:
          tx = x;
          ty = -y;
          break;
        case 6:
          tx = y;
          ty = x;
          break;
        case 7:
          tx = -y;
          ty = -x;
          break;
      }

      if (ty < minTy || (ty === minTy && tx < minTx)) {
        minTy = ty;
        minTx = tx;
      }
    }

    const dx = bPos.x - minTx;
    const dy = bPos.y - minTy;

    // Pass 2: Verify all cells match in 'other'
    let match = true;
    for (let i = 0; i < aPopulation; i++) {
      const x = xs[i]!;
      const y = ys[i]!;
      let tx = 0;
      let ty = 0;

      switch (sym) {
        case 1:
          tx = -y;
          ty = x;
          break;
        case 2:
          tx = -x;
          ty = -y;
          break;
        case 3:
          tx = y;
          ty = -x;
          break;
        case 4:
          tx = -x;
          ty = y;
          break;
        case 5:
          tx = x;
          ty = -y;
          break;
        case 6:
          tx = y;
          ty = x;
          break;
        case 7:
          tx = -y;
          ty = -x;
          break;
      }

      if (other.getMaybe(tx + dx, ty + dy) !== 1) {
        match = false;
        break;
      }
    }

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
 *
 * Pre-extracts the first frame ONCE across all candidate phase checks.
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

  // Extract initial frame coordinates ONCE for all candidate checks
  const preparedFirst = prepareGrid(first);

  for (let i = 1; i < period; i++) {
    if (period % i === 0 && isSameWithSymm(preparedFirst, histories[i]!)) {
      return i;
    }
  }

  return period;
}

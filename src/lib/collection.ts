/**
 * maximum
 * @throws if empty
 */
export function max(array: number[]): number {
  if (array.length === 0) {
    throw Error("max: length is 0");
  }

  return array.reduce((acc, x) => Math.max(acc, x), -Infinity);
}

/**
 * minimum
 * @throws if empty
 */
export function min(array: number[]): number {
  if (array.length === 0) {
    throw Error("min: length is 0");
  }

  return array.reduce((acc, x) => Math.min(acc, x), Infinity);
}

/**
 * average
 * @throws if empty
 */
export function average(array: number[]): number {
  if (array.length === 0) {
    throw Error("average: length is 0");
  }

  return array.reduce((acc, x) => acc + x, 0) / array.length;
}

/**
 * median
 * @throws if empty
 */
export function median(array: number[]): number {
  if (array.length === 0) {
    throw Error("average: length is 0");
  }

  const sorted = array.slice().sort((a, b) => a - b);

  if (sorted.length % 2 === 0) {
    const idx = Math.floor(sorted.length / 2) - 1;
    return (sorted[idx] + sorted[idx + 1]) / 2;
  } else {
    return sorted[Math.floor(sorted.length / 2)];
  }
}

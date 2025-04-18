/**
 * Find repeating pattern minimum periid.
 *
 * ```txt
 * 000000 -> 1
 * 010101 -> 2
 * 110110 -> 3
 * 111110 -> 6
 * ```
 *
 * KMP
 */
export function findPeriod<T>(binary: T[]): number {
  const n = binary.length;
  const lps = new Array(n).fill(0); // Longest Prefix Suffix table

  // Build the LPS array
  let length = 0;
  for (let i = 1; i < n; i++) {
    const current = binary[i];
    while (length > 0 && current !== binary[length]) {
      length = lps[length - 1];
    }
    if (current === binary[length]) {
      length++;
    }
    lps[i] = length;
  }

  const smallestPeriod = n - lps[n - 1];

  // If the string is composed of a repeating pattern, the smallest period divides the total length perfectly
  if (n % smallestPeriod === 0) {
    return smallestPeriod;
  }
  return n; // Otherwise, the period is the entire string
}

/**
 * Find repeating pattern minimum periid.
 *
 * ```txt
 * 000000 -> 1
 * 010101 -> 2
 * 110110 -> 3
 * 111110 -> 6
 * ```
 *
 * KMP
 */
export function findPeriodUint8(binary: Uint8Array): number {
  const n = binary.length;
  // Longest Prefix Suffix table
  const lps =
    n < 2 ** 8
      ? new Uint8Array(n)
      : n < 2 ** 16
        ? new Uint16Array(n)
        : n < 2 ** 32
          ? new Uint32Array(n)
          : new Array(n).fill(0);

  // Build the LPS array
  let length = 0;
  for (let i = 1; i < n; i++) {
    const current = binary[i];
    while (length > 0 && current !== binary[length]) {
      length = lps[length - 1];
    }
    if (current === binary[length]) {
      length++;
    }
    lps[i] = length;
  }

  const smallestPeriod = n - lps[n - 1];

  // If the string is composed of a repeating pattern, the smallest period divides the total length perfectly
  if (n % smallestPeriod === 0) {
    return smallestPeriod;
  }
  return n; // Otherwise, the period is the entire string
}

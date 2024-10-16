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
export function findPeriod(binary: (0 | 1)[]): number {
  const n = binary.length;
  const lps = new Array(n).fill(0); // Longest Prefix Suffix table

  // Build the LPS array
  let length = 0;
  for (let i = 1; i < n; i++) {
    while (length > 0 && binary[i] !== binary[length]) {
      length = lps[length - 1];
    }
    if (binary[i] === binary[length]) {
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

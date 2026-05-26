/**
 * Performs a cyclic left shift (rotation) on a BigInt.
 * Since BigInts are arbitrary precision, a bit length (len) is required for the rotation.
 * @param n The BigInt to rotate.
 * @param len The fixed bit length of the value (must be a positive BigInt).
 * @param shift The number of positions to shift (must be a positive BigInt).
 * @returns The resulting BigInt after cyclic left shift.
 */
export function rotateLeftBigInt(
  n: bigint,
  len: bigint,
  shift: bigint,
): bigint {
  // Ensure shift is within the range [0, len-1]
  const effectiveShift = shift % len;

  // Create a mask for the specified bit length (2^len - 1)
  const mask = (1n << len) - 1n;

  // Use BigInt.asUintN to treat 'n' as an unsigned integer of 'len' bits.
  const value = BigInt.asUintN(Number(len), n);

  // Left shift and then OR with the bits shifted off the left side
  const rotated = (value << effectiveShift) | (value >> (len - effectiveShift));

  // Mask the result to ensure it stays within 'len' bits
  return rotated & mask;
}

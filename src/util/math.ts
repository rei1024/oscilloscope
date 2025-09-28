export class MathExtra {
  /**
   * GCD
   */
  static gcd(m: number, n: number): number {
    if (typeof m !== "number" || typeof n !== "number") {
      throw TypeError("argment is not a number");
    }
    if (!Number.isInteger(m) || !Number.isInteger(n)) {
      throw Error("gcd: is not a integer");
    }
    if (m < 0) {
      m = -m;
    }
    if (n < 0) {
      n = -n;
    }
    if (m < n) {
      const temp = m;
      m = n;
      n = temp;
    }
    // m >= n
    while (n !== 0) {
      const temp = m % n;
      m = n;
      n = temp;
    }
    return m;
  }
}

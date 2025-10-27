import { MathExtra } from "../util/math";

export function formatSpeed(
  dx: number,
  dy: number,
  period: number,
  simplify: boolean,
): string {
  dx = Math.abs(dx);
  dy = Math.abs(dy);

  if (dx === 0 || dy === 0) {
    if (simplify) {
      return stringifyFraction(dx + dy, period);
    } else {
      return formatFraction(dx + dy, period);
    }
  } else if (dx === dy) {
    if (simplify) {
      return stringifyFraction(dx, period);
    } else {
      return formatFraction(dx, period);
    }
  } else {
    if (simplify) {
      return stringifyFraction2(dx, dy, period);
    } else {
      return formatFraction2(dx, dy, period);
    }
  }
}

function showDivIfNotOne(den: number) {
  return den === 1 ? "" : `/${den}`;
}

function formatFraction(num: number, den: number) {
  return `${num === 1 ? "" : num}c${showDivIfNotOne(den)}`;
}

// (2,1)c/6
function formatFraction2(num0: number, num1: number, den: number) {
  return `(${num0},${num1})c${showDivIfNotOne(den)}`;
}

function stringifyFraction(num: number, den: number) {
  const divideBy = MathExtra.gcd(num, den);
  const numSimple = Math.floor(num / divideBy);
  const denSimple = Math.floor(den / divideBy);

  return formatFraction(numSimple, denSimple);
}

function stringifyFraction2(num0: number, num1: number, den: number) {
  const num01GCD = MathExtra.gcd(num0, num1);
  const divideBy = MathExtra.gcd(num01GCD, den);
  const num0Simple = Math.floor(num0 / divideBy);
  const num1Simple = Math.floor(num1 / divideBy);
  const denSimple = Math.floor(den / divideBy);

  return formatFraction2(num0Simple, num1Simple, denSimple);
}

import { describe, it, expect } from "vitest";
import { findPeriod, findPeriodUint8 } from "./findPeriod";

describe("findPeriod", () => {
  it("correct", () => {
    const items = [
      { input: [], expected: 0 },
      { input: [1], expected: 1 },
      { input: [1, 1], expected: 1 },
      { input: [1, 0], expected: 2 },
      { input: [1, 0, 1], expected: 3 },
      { input: [1, 1, 1], expected: 1 },
      { input: [0, 0, 0], expected: 1 },
      { input: [1, 0, 1, 0], expected: 2 },
      { input: [1, 0, 1, 0, 1, 0], expected: 2 },
      { input: [1, 0, 0, 1, 1, 0], expected: 6 },
      { input: [1, 0, 0, 1, 1, 0, 0, 1], expected: 4 },
    ];

    for (const { input, expected } of items) {
      expect(findPeriod(input)).toEqual(expected);
      expect(findPeriodUint8(new Uint8Array(input))).toEqual(expected);
    }
  });

  it("correct string", () => {
    expect(findPeriod(["a", "b", "a", "b"])).toEqual(2);
  });
});

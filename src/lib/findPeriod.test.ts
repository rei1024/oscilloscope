import { describe, it, expect } from "vitest";
import { findPeriod } from "./findPeriod";

describe("findPeriod", () => {
  it("correct", () => {
    expect(findPeriod([])).toEqual(0);
    expect(findPeriod([1])).toEqual(1);
    expect(findPeriod([1, 1])).toEqual(1);
    expect(findPeriod([1, 0])).toEqual(2);
    expect(findPeriod([1, 0, 1])).toEqual(3);
    expect(findPeriod([1, 1, 1])).toEqual(1);
    expect(findPeriod([0, 0, 0])).toEqual(1);
    expect(findPeriod([1, 0, 1, 0])).toEqual(2);
    expect(findPeriod([1, 0, 1, 0, 1, 0])).toEqual(2);
    expect(findPeriod([1, 0, 0, 1, 1, 0])).toEqual(6);
    expect(findPeriod([1, 0, 0, 1, 1, 0, 0, 1])).toEqual(4);
  });

  it("correct string", () => {
    expect(findPeriod(["a", "b", "a", "b"])).toEqual(2);
  });
});

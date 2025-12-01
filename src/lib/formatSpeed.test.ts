import { describe, it, expect } from "vitest";
import { formatSpeed } from "./formatSpeed";

describe("formatSpeed", () => {
  it("correct", () => {
    expect(formatSpeed(0, 1, 1, false)).toEqual("c");
    expect(formatSpeed(1, 1, 1, false)).toEqual("c");
    expect(formatSpeed(0, 1, 2, false)).toEqual("c/2");
    expect(formatSpeed(0, 1, 3, false)).toEqual("c/3");
    expect(formatSpeed(0, 2, 6, false)).toEqual("2c/6");
    expect(formatSpeed(0, 2, 6, true)).toEqual("c/3");
    expect(formatSpeed(1, 1, 6, true)).toEqual("c/6");
    expect(formatSpeed(3, 3, 6, true)).toEqual("c/2");
    expect(formatSpeed(2, 3, 6, true)).toEqual("(3,2)c/6");
    expect(formatSpeed(-2, 3, 6, true)).toEqual("(3,2)c/6");
    expect(formatSpeed(3, -2, 6, true)).toEqual("(3,2)c/6");
  });
});

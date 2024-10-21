import { describe, it, expect } from "vitest";
import { average, max, median, min } from "./collection.ts";

describe("max", () => {
  it("throws on empty array", () => {
    expect(() => max([])).toThrow();
  });
  it("returns max of single element array", () => {
    expect(max([1])).toEqual(1);
  });
  it("returns max of two elements", () => {
    expect(max([1, 2])).toEqual(2);
  });
  it("returns max regardless of element order", () => {
    expect(max([2, 1])).toEqual(2);
  });
});

describe("min", () => {
  it("throws on empty array", () => {
    expect(() => min([])).toThrow();
  });
  it("returns min of single element array", () => {
    expect(min([1])).toEqual(1);
  });
  it("returns min of two elements", () => {
    expect(min([1, 2])).toEqual(1);
  });
  it("returns min regardless of element order", () => {
    expect(min([2, 1])).toEqual(1);
  });
});

describe("average", () => {
  it("throws on empty array", () => {
    expect(() => average([])).toThrow();
  });
  it("returns average of single element array", () => {
    expect(average([1])).toEqual(1);
  });
  it("returns average of two elements", () => {
    expect(average([1, 2])).toEqual(1.5);
  });
  it("returns average regardless of element order", () => {
    expect(average([2, 1])).toEqual(1.5);
  });
});

describe("median", () => {
  it("throws on empty array", () => {
    expect(() => median([])).toThrow();
  });
  it("returns median of single element array", () => {
    expect(median([1])).toEqual(1);
  });
  it("returns median of two elements", () => {
    expect(median([1, 2])).toEqual(1.5);
  });
  it("returns median regardless of element order", () => {
    expect(median([2, 1])).toEqual(1.5);
  });
  it("returns median of three elements", () => {
    expect(median([2, 1, 3])).toEqual(2);
  });
  it("returns median with repeated elements", () => {
    expect(median([1, 1, 1, 99])).toEqual(1);
  });
});

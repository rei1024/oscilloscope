import { describe, it, expect } from "vitest";
import { getDirectionName } from "./direction.ts";

describe("getDirectionName", () => {
  it("0, 0", () => {
    expect(getDirectionName(0, 0)).toBeNull();
  });

  it("2, 1", () => {
    expect(getDirectionName(2, 1)).toEqual("Knightwise");
  });

  it("1, 2", () => {
    expect(getDirectionName(1, 2)).toEqual("Knightwise");
  });

  it("-1, -2", () => {
    expect(getDirectionName(-1, -2)).toEqual("Knightwise");
  });

  it("2, 4", () => {
    expect(getDirectionName(2, 4)).toEqual("Knightwise");
  });

  it("2, -6", () => {
    expect(getDirectionName(2, -6)).toEqual("Camelwise");
  });
});

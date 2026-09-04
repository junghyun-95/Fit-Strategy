import { describe, it, expect } from "vitest";
import { mean, median, stdev, fieldStats, seasonDelta } from "./analytics";
import type { PlmSpec } from "../types";

describe("mean/median/stdev", () => {
  it("computes mean", () => {
    expect(mean([2, 4, 6])).toBe(4);
  });
  it("computes median for odd length", () => {
    expect(median([5, 1, 3])).toBe(3);
  });
  it("computes median for even length", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });
  it("computes population stdev", () => {
    expect(stdev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2, 5);
  });
  it("throws on empty input", () => {
    expect(() => mean([])).toThrow();
  });
});

describe("fieldStats", () => {
  it("aggregates a POM field across entries, ignoring missing values", () => {
    const entries = [
      { spec: { chest: 100 } },
      { spec: { chest: 104 } },
      { spec: {} },
    ];
    const stats = fieldStats(entries, "chest");
    expect(stats).toEqual({ n: 2, mean: 102, median: 102, stdev: 2, min: 100, max: 104 });
  });
  it("returns null when no entry has the field", () => {
    expect(fieldStats([{ spec: {} }], "chest")).toBeNull();
  });
});

describe("seasonDelta", () => {
  it("computes 25S->26S mean delta for a field", () => {
    const specs: PlmSpec[] = [
      { id: "1", productCode: "A", productName: "a", gender: "men", season: "25S", baseSize: "100", fitName: "Regular", spec: { chest: 108 }, imageUrl: null, techPackUrl: null },
      { id: "2", productCode: "B", productName: "b", gender: "men", season: "26S", baseSize: "100", fitName: "Regular", spec: { chest: 109 }, imageUrl: null, techPackUrl: null },
    ];
    const result = seasonDelta(specs, "chest");
    expect(result).toEqual({ from25S: 108, to26S: 109, delta: 1 });
  });
});

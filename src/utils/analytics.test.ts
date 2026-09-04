import { describe, it, expect } from "vitest";
import { mean, median, stdev, fieldStats, seasonDelta, normalizeFitLabel, fitDistribution, lengthDistribution, marketCoreBand, positionDeviation, nearestCompetitor } from "./analytics";
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

describe("normalizeFitLabel", () => {
  it("trims and title-cases known fit words", () => {
    expect(normalizeFitLabel("Slim ")).toBe("Slim");
    expect(normalizeFitLabel("Regular Fit")).toBe("Regular");
    expect(normalizeFitLabel("Semi-over Fit")).toBe("Semi-Over");
    expect(normalizeFitLabel("Loose Fit")).toBe("Loose");
    expect(normalizeFitLabel("Close Fit")).toBe("Close");
    expect(normalizeFitLabel("Classic Fit")).toBe("Classic");
  });
  it("returns Unlabeled for null/empty", () => {
    expect(normalizeFitLabel(null)).toBe("Unlabeled");
    expect(normalizeFitLabel("")).toBe("Unlabeled");
  });
});

describe("fitDistribution", () => {
  it("counts normalized labels", () => {
    const entries = [{ fitRaw: "Slim " }, { fitRaw: "Slim Fit" }, { fitRaw: null }];
    expect(fitDistribution(entries)).toEqual({ Slim: 2, Unlabeled: 1 });
  });
});

describe("lengthDistribution", () => {
  it("buckets frontLength into terciles of the given set", () => {
    const entries = [
      { spec: { frontLength: 45 } }, { spec: { frontLength: 50 } },
      { spec: { frontLength: 55 } }, { spec: { frontLength: 60 } },
      { spec: { frontLength: 65 } }, { spec: { frontLength: 70 } },
    ];
    const dist = lengthDistribution(entries);
    expect(dist.crop + dist.standard + dist.long).toBe(6);
    expect(dist.crop).toBe(2);
    expect(dist.long).toBe(2);
  });
});

describe("marketCoreBand", () => {
  it("returns mean +/- 1 stdev rectangle on both axes", () => {
    const entries = [
      { spec: { chest: 100, frontLength: 60 } },
      { spec: { chest: 110, frontLength: 70 } },
    ];
    const band = marketCoreBand(entries, "chest", "frontLength");
    expect(band).not.toBeNull();
    expect(band!.xMin).toBeLessThan(105);
    expect(band!.xMax).toBeGreaterThan(105);
  });
});

describe("positionDeviation", () => {
  it("computes (value-mean)/stdev", () => {
    const stats = { n: 5, mean: 100, median: 100, stdev: 5, min: 90, max: 110 };
    expect(positionDeviation(110, stats)).toBe(2);
  });
});

describe("nearestCompetitor", () => {
  it("finds the closest entry by euclidean distance on two fields", () => {
    const own = { spec: { chest: 100, frontLength: 60 } };
    const market = [
      { id: "far", spec: { chest: 130, frontLength: 90 } },
      { id: "near", spec: { chest: 101, frontLength: 61 } },
    ];
    expect(nearestCompetitor(own, market, "chest", "frontLength")?.id).toBe("near");
  });
});

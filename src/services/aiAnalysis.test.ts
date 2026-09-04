import { describe, it, expect } from "vitest";
import { mockAiAdapter, confidenceFromStats } from "./aiAnalysis";
import type { AIStrategyInput } from "./aiAnalysis";
import { fieldStats } from "../utils/analytics";

describe("confidenceFromStats", () => {
  it("is high for large n and low stdev", () => {
    expect(confidenceFromStats({ n: 20, mean: 100, median: 100, stdev: 1, min: 98, max: 102 })).toBe("high");
  });
  it("is low for small n or high stdev", () => {
    expect(confidenceFromStats({ n: 3, mean: 100, median: 100, stdev: 20, min: 60, max: 140 })).toBe("low");
  });
});

describe("mockAiAdapter", () => {
  const input: AIStrategyInput = {
    ownFit: {
      id: "1", name: "Regular Fit", gender: "men", tagline: null,
      spec: { chest: 112, frontLength: 69 },
      images: { crop: null, full: null, product: null },
    },
    ownPlmSpecs: [
      { id: "a", productCode: "X1", productName: "p1", gender: "men", season: "25S", baseSize: "100", fitName: "Regular", spec: { chest: 108 }, imageUrl: null, techPackUrl: null },
      { id: "b", productCode: "X2", productName: "p2", gender: "men", season: "26S", baseSize: "100", fitName: "Regular", spec: { chest: 109 }, imageUrl: null, techPackUrl: null },
    ],
    market: [
      { id: "m1", brand: "New Balance", style: "Tee", gender: "men", fitRaw: "Regular Fit", spec: { chest: 108, frontLength: 71 }, dataType: "actual_measurement", imagePath: null, sourceUrl: null },
      { id: "m2", brand: "Lululemon", style: "Tee", gender: "men", fitRaw: "Slim Fit", spec: { chest: 104, frontLength: 68 }, dataType: "actual_measurement", imagePath: null, sourceUrl: null },
    ],
  };

  it("produces an executive conclusion that cites only computed numbers", async () => {
    const result = await mockAiAdapter.analyze(input);
    const chestStats = fieldStats(input.market, "chest");
    expect(result.executiveConclusion).toContain(String(chestStats!.mean));
    expect(result.executiveConclusion.length).toBeGreaterThan(0);
  });

  it("returns exactly 3 diagnosis buckets: strength, gap, opportunity", async () => {
    const result = await mockAiAdapter.analyze(input);
    expect(Object.keys(result.diagnosis)).toEqual(["strength", "gap", "opportunity"]);
  });

  it("returns a recommendation row per requested POM field with a confidence label", async () => {
    const result = await mockAiAdapter.analyze(input);
    expect(result.recommendations.length).toBeGreaterThan(0);
    for (const rec of result.recommendations) {
      expect(["high", "medium", "low"]).toContain(rec.confidence);
    }
  });
});

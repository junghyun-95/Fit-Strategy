import type { PomSpec, PlmSpec } from "../types";

export function mean(values: number[]): number {
  if (values.length === 0) throw new Error("mean of empty array");
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function median(values: number[]): number {
  if (values.length === 0) throw new Error("median of empty array");
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function stdev(values: number[]): number {
  if (values.length === 0) throw new Error("stdev of empty array");
  const m = mean(values);
  const variance = mean(values.map((v) => (v - m) ** 2));
  return Math.sqrt(variance);
}

export interface FieldStats {
  n: number;
  mean: number;
  median: number;
  stdev: number;
  min: number;
  max: number;
}

export function fieldStats(
  entries: { spec: PomSpec }[],
  field: keyof PomSpec
): FieldStats | null {
  const values = entries
    .map((e) => e.spec[field])
    .filter((v): v is number => typeof v === "number");
  if (values.length === 0) return null;
  return {
    n: values.length,
    mean: round1(mean(values)),
    median: round1(median(values)),
    stdev: round1(stdev(values)),
    min: round1(Math.min(...values)),
    max: round1(Math.max(...values)),
  };
}

export interface SeasonDelta {
  from25S: number;
  to26S: number;
  delta: number;
}

export function seasonDelta(
  plmSpecs: PlmSpec[],
  field: keyof PomSpec
): SeasonDelta | null {
  const values25S = plmSpecs
    .filter((s) => s.season === "25S")
    .map((s) => s.spec[field])
    .filter((v): v is number => typeof v === "number");
  const values26S = plmSpecs
    .filter((s) => s.season === "26S")
    .map((s) => s.spec[field])
    .filter((v): v is number => typeof v === "number");
  if (values25S.length === 0 || values26S.length === 0) return null;
  const from25S = round1(mean(values25S));
  const to26S = round1(mean(values26S));
  return { from25S, to26S, delta: round1(to26S - from25S) };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

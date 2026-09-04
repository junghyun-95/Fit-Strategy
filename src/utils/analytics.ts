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

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

const FIT_WORD_MAP: Record<string, string> = {
  slim: "Slim",
  regular: "Regular",
  "semi-over": "Semi-Over",
  loose: "Loose",
  close: "Close",
  classic: "Classic",
  over: "Over",
};

export function normalizeFitLabel(raw: string | null): string {
  if (!raw || !raw.trim()) return "Unlabeled";
  const cleaned = raw.trim().toLowerCase().replace(/\bfit\b/g, "").trim();
  return FIT_WORD_MAP[cleaned] ?? (cleaned.charAt(0).toUpperCase() + cleaned.slice(1));
}

export function fitDistribution(
  entries: { fitRaw: string | null }[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of entries) {
    const label = normalizeFitLabel(e.fitRaw);
    counts[label] = (counts[label] ?? 0) + 1;
  }
  return counts;
}

export function lengthDistribution(
  entries: { spec: PomSpec }[]
): { crop: number; standard: number; long: number } {
  const values = entries
    .map((e) => e.spec.frontLength)
    .filter((v): v is number => typeof v === "number")
    .sort((a, b) => a - b);
  const n = values.length;
  const t1 = values[Math.floor(n / 3) - 1] ?? values[0];
  const t2 = values[Math.floor((2 * n) / 3) - 1] ?? values[n - 1];
  let crop = 0, standard = 0, long = 0;
  for (const v of values) {
    if (v <= t1) crop++;
    else if (v <= t2) standard++;
    else long++;
  }
  return { crop, standard, long };
}

export function marketCoreBand(
  entries: { spec: PomSpec }[],
  xField: keyof PomSpec,
  yField: keyof PomSpec
): { xMin: number; xMax: number; yMin: number; yMax: number } | null {
  const xStats = fieldStats(entries, xField);
  const yStats = fieldStats(entries, yField);
  if (!xStats || !yStats) return null;
  return {
    xMin: round1(xStats.mean - xStats.stdev),
    xMax: round1(xStats.mean + xStats.stdev),
    yMin: round1(yStats.mean - yStats.stdev),
    yMax: round1(yStats.mean + yStats.stdev),
  };
}

export function positionDeviation(ownValue: number, marketStats: FieldStats): number {
  if (marketStats.stdev === 0) return 0;
  return round1((ownValue - marketStats.mean) / marketStats.stdev);
}

export function nearestCompetitor<T extends { spec: PomSpec }>(
  own: { spec: PomSpec },
  market: T[],
  xField: keyof PomSpec,
  yField: keyof PomSpec
): T | null {
  const ox = own.spec[xField];
  const oy = own.spec[yField];
  if (typeof ox !== "number" || typeof oy !== "number") return null;
  let best: T | null = null;
  let bestDist = Infinity;
  for (const entry of market) {
    const mx = entry.spec[xField];
    const my = entry.spec[yField];
    if (typeof mx !== "number" || typeof my !== "number") continue;
    const dist = Math.sqrt((mx - ox) ** 2 + (my - oy) ** 2);
    if (dist < bestDist) {
      bestDist = dist;
      best = entry;
    }
  }
  return best;
}

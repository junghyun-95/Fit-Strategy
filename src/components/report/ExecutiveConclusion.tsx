import type { AIStrategyResult } from "../../services/aiAnalysis";
import type { ReportFilters } from "./FilterBar";

interface Props {
  result: AIStrategyResult;
  filters: ReportFilters;
  brandCount: number;
}

export function ExecutiveConclusion({ result, filters, brandCount }: Props) {
  return (
    <section className="mb-16">
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
          AI FIT STRATEGY
        </h1>
        <p className="text-xs text-muted">
          {filters.season} · {filters.gender === "men" ? "Men" : "Women"} · {filters.category} · {brandCount} brands analyzed
        </p>
      </div>
      <p className="text-2xl md:text-3xl font-semibold leading-snug text-ink max-w-4xl">
        {result.executiveConclusion}
      </p>
      <div className="mt-8 grid grid-cols-3 gap-6 max-w-3xl">
        <Chip label="Market Shift" value={result.marketShift} />
        <Chip label="Our Position" value={result.ourPosition} />
        <Chip label="Next Action" value={result.nextAction} />
      </div>
    </section>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-accent pl-3">
      <p className="text-[11px] uppercase tracking-wide text-muted mb-1">{label}</p>
      <p className="text-sm text-ink font-medium">{value}</p>
    </div>
  );
}

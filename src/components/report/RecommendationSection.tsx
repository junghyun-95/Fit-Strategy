import type { Recommendation } from "../../services/aiAnalysis";
import { SectionHeading } from "./MarketSection";

interface Props {
  recommendations: Recommendation[];
  ownFitName: string;
}

const CONFIDENCE_LABEL: Record<Recommendation["confidence"], string> = { high: "High", medium: "Medium", low: "Low" };

export function RecommendationSection({ recommendations, ownFitName }: Props) {
  return (
    <section className="mb-16">
      <SectionHeading title="Recommendation" question="신규 시즌에는 어떤 핏과 실루엣으로 수정해야 하는가?" />
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted border-b border-border">
                <th className="py-2 pr-4">POM</th>
                <th className="py-2 pr-4">Current</th>
                <th className="py-2 pr-4">Market Median</th>
                <th className="py-2 pr-4">Recommended</th>
                <th className="py-2 pr-4">Change</th>
                <th className="py-2">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((r) => (
                <tr key={r.pom} className="border-b border-border">
                  <td className="py-2 pr-4 font-medium text-ink">{r.pom}</td>
                  <td className="py-2 pr-4">{r.current}cm</td>
                  <td className="py-2 pr-4">{r.marketMedian}cm</td>
                  <td className="py-2 pr-4 font-medium text-accent">{r.recommended}cm</td>
                  <td className="py-2 pr-4">{r.change > 0 ? "+" : ""}{r.change}cm</td>
                  <td className="py-2">{CONFIDENCE_LABEL[r.confidence]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 space-y-2 text-xs text-muted">
            {recommendations.map((r) => (
              <p key={r.pom}>
                <span className="text-ink font-medium">{r.pom}:</span> {r.changeReason}
                {r.referenceStyles.length > 0 && <> — 참고: {r.referenceStyles.join(", ")}</>}
              </p>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted mb-2">Current vs Recommended</p>
          <div className="border border-border rounded-lg h-64 flex items-center justify-center gap-6 text-xs text-muted">
            <div className="border-2 border-dashed border-border rounded w-20 h-40 flex items-center justify-center text-center px-1">
              {ownFitName}<br />(Current)
            </div>
            <div className="border-2 border-dashed border-accent rounded w-24 h-44 flex items-center justify-center text-center px-1 text-accent">
              Recommended
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

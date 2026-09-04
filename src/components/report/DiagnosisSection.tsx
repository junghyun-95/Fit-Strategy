import type { AIStrategyResult } from "../../services/aiAnalysis";
import { SectionHeading } from "./MarketSection";

interface Props {
  diagnosis: AIStrategyResult["diagnosis"];
}

const ORDER: (keyof Props["diagnosis"])[] = ["strength", "gap", "opportunity"];
const LABELS: Record<keyof Props["diagnosis"], string> = { strength: "Strength", gap: "Gap", opportunity: "Opportunity" };

export function DiagnosisSection({ diagnosis }: Props) {
  return (
    <section className="mb-16">
      <SectionHeading title="Diagnosis" question="자사의 무엇을 유지하고 무엇을 보완해야 하는가?" />
      <div className="grid grid-cols-3 gap-6">
        {ORDER.map((key) => {
          const item = diagnosis[key];
          return (
            <div key={key} className="border border-border rounded-lg p-5">
              <p className="text-[11px] uppercase tracking-wide text-accent font-semibold mb-2">
                {LABELS[key]}
              </p>
              <p className="text-sm font-medium text-ink mb-2">{item.title}</p>
              <p className="text-sm text-muted leading-relaxed mb-3">{item.body}</p>
              <p className="text-xs text-ink border-t border-border pt-2">{item.evidence}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

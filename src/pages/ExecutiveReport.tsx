import { useEffect, useMemo, useState } from "react";
import { FilterBar, type ReportFilters } from "../components/report/FilterBar";
import { mockAiAdapter, type AIStrategyResult } from "../services/aiAnalysis";
import { ExecutiveConclusion } from "../components/report/ExecutiveConclusion";
import { MarketSection } from "../components/report/MarketSection";
import { PositionSection } from "../components/report/PositionSection";
import { DiagnosisSection } from "../components/report/DiagnosisSection";
import { RecommendationSection } from "../components/report/RecommendationSection";
import { SupportingEvidenceDrawer } from "../components/evidence/SupportingEvidenceDrawer";
import ownFitsData from "../data/ownFits.json";
import plmSpecsData from "../data/plmSpecs.json";
import marketEntriesData from "../data/marketEntries.json";
import type { OwnFit, PlmSpec, MarketEntry } from "../types";

const ownFits = ownFitsData as OwnFit[];
const plmSpecs = plmSpecsData as PlmSpec[];
const marketEntries = marketEntriesData as MarketEntry[];

export function ExecutiveReport() {
  const [filters, setFilters] = useState<ReportFilters>({
    season: "26S",
    gender: "men",
    category: "티셔츠",
    size: "100",
    ownStyleId: ownFits.find((f) => f.gender === "men")?.id ?? "",
  });
  const [generation, setGeneration] = useState(0);
  const [result, setResult] = useState<AIStrategyResult | null>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  const filteredMarket = useMemo(
    () => marketEntries.filter((m) => m.gender === filters.gender),
    [filters.gender]
  );
  const filteredPlmSpecs = useMemo(
    () => plmSpecs.filter((s) => s.gender === filters.gender),
    [filters.gender]
  );
  const ownFit = useMemo(
    () => ownFits.find((f) => f.id === filters.ownStyleId) ?? null,
    [filters.ownStyleId]
  );

  useEffect(() => {
    if (!ownFit) {
      setResult(null);
      return;
    }
    mockAiAdapter
      .analyze({ ownFit, ownPlmSpecs: filteredPlmSpecs, market: filteredMarket })
      .then(setResult);
  }, [ownFit, filteredPlmSpecs, filteredMarket, generation]);

  return (
    <div className="max-w-[1440px] mx-auto px-10 py-8">
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onGenerate={() => setGeneration((g) => g + 1)}
        ownFits={ownFits}
      />
      <div data-generation={generation}>
        {ownFit && result ? (
          <>
            <ExecutiveConclusion result={result} filters={filters} brandCount={new Set(filteredMarket.map((m) => m.brand)).size} />
            <MarketSection market={filteredMarket} plmSpecs={filteredPlmSpecs} marketSummary={result.marketSummary} />
            <PositionSection ownFit={ownFit} market={filteredMarket} positionDiagnosis={result.positionDiagnosis} />
            <DiagnosisSection diagnosis={result.diagnosis} />
            <RecommendationSection recommendations={result.recommendations} ownFitName={ownFit.name} />
            <div className="mb-4 print:hidden">
              <button
                className="text-sm font-medium text-accent underline"
                onClick={() => setEvidenceOpen(true)}
              >
                View Supporting Data
              </button>
            </div>
            <p className="mb-16 text-xs text-muted max-w-3xl leading-relaxed">
              경쟁사 데이터는 특정 시점의 스냅샷이며 시즌 이력을 포함하지 않습니다. 또한 자사 스펙은 기준 사이즈 기준이나 경쟁사 데이터에는 사이즈 정보가 없어 완전히 동일 조건의 비교는 아닙니다.
            </p>
          </>
        ) : (
          <p className="text-muted text-sm">Select an own brand style to begin.</p>
        )}
      </div>
      <SupportingEvidenceDrawer open={evidenceOpen} onClose={() => setEvidenceOpen(false)} entries={filteredMarket} />
    </div>
  );
}

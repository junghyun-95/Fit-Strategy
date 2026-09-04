import { useEffect, useMemo, useState } from "react";
import { FilterBar, type ReportFilters } from "../components/report/FilterBar";
import { mockAiAdapter, type AIStrategyResult } from "../services/aiAnalysis";
import { ExecutiveConclusion } from "../components/report/ExecutiveConclusion";
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
          <ExecutiveConclusion result={result} filters={filters} brandCount={new Set(filteredMarket.map((m) => m.brand)).size} />
        ) : (
          <p className="text-muted text-sm">Select an own brand style to begin.</p>
        )}
      </div>
    </div>
  );
}

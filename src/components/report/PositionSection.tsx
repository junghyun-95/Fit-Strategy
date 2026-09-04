import { PositionScatterChart } from "../charts/PositionScatterChart";
import { fieldStats, positionDeviation, nearestCompetitor } from "../../utils/analytics";
import type { OwnFit, MarketEntry } from "../../types";
import { SectionHeading } from "./MarketSection";

interface Props {
  ownFit: OwnFit;
  market: MarketEntry[];
  positionDiagnosis: string;
}

export function PositionSection({ ownFit, market, positionDiagnosis }: Props) {
  const chestStats = fieldStats(market, "chest");
  const nearest = nearestCompetitor(ownFit, market, "chest", "frontLength");
  const chestDev = chestStats && ownFit.spec.chest != null
    ? positionDeviation(ownFit.spec.chest, chestStats)
    : null;

  return (
    <section className="mb-16">
      <SectionHeading title="Position" question="자사는 경쟁 시장에서 어디에 위치하는가?" />
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <PositionScatterChart ownFit={ownFit} market={market} />
        </div>
        <div className="space-y-4 text-sm">
          <Stat label="시장 평균 대비 가슴 편차" value={chestDev != null ? `${chestDev > 0 ? "+" : ""}${chestDev}σ` : "N/A"} />
          <Stat label="가장 가까운 경쟁 브랜드" value={nearest ? `${nearest.brand} ${nearest.style}` : "N/A"} />
          <p className="text-ink leading-relaxed pt-2">{positionDiagnosis}</p>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="text-base font-medium text-ink">{value}</p>
    </div>
  );
}

import { FitDonutChart } from "../charts/FitDonutChart";
import { LengthDonutChart } from "../charts/LengthDonutChart";
import { seasonDelta } from "../../utils/analytics";
import type { MarketEntry, PlmSpec } from "../../types";

interface Props {
  market: MarketEntry[];
  plmSpecs: PlmSpec[];
  marketSummary: string;
}

export function MarketSection({ market, plmSpecs, marketSummary }: Props) {
  const chestDelta = seasonDelta(plmSpecs, "chest");
  const lengthDelta = seasonDelta(plmSpecs, "frontLength");
  return (
    <section className="mb-16">
      <SectionHeading title="Market" question="현재 시장의 대표적인 핏과 실루엣은 무엇인가?" />
      <div className="grid grid-cols-3 gap-8">
        <FitDonutChart entries={market} />
        <LengthDonutChart entries={market} />
        <div>
          <p className="text-xs uppercase tracking-wide text-muted mb-2">
            자사 스펙 변화 (25S → 26S, 핏 구성 변화 포함 전체 평균)
          </p>
          {chestDelta && lengthDelta ? (
            <>
              <ul className="text-sm space-y-1">
                <li>Chest: {chestDelta.from25S}cm → {chestDelta.to26S}cm ({chestDelta.delta > 0 ? "+" : ""}{chestDelta.delta}cm)</li>
                <li>Body Length: {lengthDelta.from25S}cm → {lengthDelta.to26S}cm ({lengthDelta.delta > 0 ? "+" : ""}{lengthDelta.delta}cm)</li>
              </ul>
              <p className="text-xs text-muted mt-2">
                핏 구성비 변화가 섞여 있어 시즌별 순수 스펙 변화와는 다를 수 있습니다.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">데이터 부족</p>
          )}
        </div>
      </div>
      <p className="text-sm text-ink mt-6 max-w-3xl leading-relaxed">{marketSummary}</p>
    </section>
  );
}

export function SectionHeading({ title, question }: { title: string; question: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="text-sm text-muted">{question}</p>
    </div>
  );
}

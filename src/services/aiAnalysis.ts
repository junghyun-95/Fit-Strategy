import type { OwnFit, PlmSpec, MarketEntry, PomSpec } from "../types";
import { fieldStats, seasonDelta, positionDeviation, nearestCompetitor, type FieldStats } from "../utils/analytics";

export interface AIStrategyInput {
  ownFit: OwnFit;
  ownPlmSpecs: PlmSpec[];
  market: MarketEntry[];
}

export interface DiagnosisItem {
  title: string;
  body: string;
  evidence: string;
}

export interface Recommendation {
  pom: string;
  current: number;
  marketMedian: number;
  recommended: number;
  change: number;
  changeReason: string;
  referenceStyles: string[];
  confidence: "high" | "medium" | "low";
}

export interface AIStrategyResult {
  executiveConclusion: string;
  marketShift: string;
  ourPosition: string;
  nextAction: string;
  marketSummary: string;
  positionDiagnosis: string;
  diagnosis: { strength: DiagnosisItem; gap: DiagnosisItem; opportunity: DiagnosisItem };
  recommendations: Recommendation[];
}

export interface AIAdapter {
  analyze(input: AIStrategyInput): Promise<AIStrategyResult>;
}

export function confidenceFromStats(stats: FieldStats): "high" | "medium" | "low" {
  const cv = stats.mean === 0 ? Infinity : stats.stdev / stats.mean;
  if (stats.n >= 10 && cv < 0.08) return "high";
  if (stats.n >= 5 && cv < 0.15) return "medium";
  return "low";
}

const RECOMMEND_FIELDS: (keyof PomSpec)[] = ["chest", "frontLength"];
const FIELD_LABEL: Record<string, string> = {
  chest: "Chest", frontLength: "Body Length",
};

export const mockAiAdapter: AIAdapter = {
  async analyze(input: AIStrategyInput): Promise<AIStrategyResult> {
    const { ownFit, ownPlmSpecs, market } = input;
    const chestStats = fieldStats(market, "chest");
    const lengthStats = fieldStats(market, "frontLength");
    const chestDelta = seasonDelta(ownPlmSpecs, "chest");
    const lengthDelta = seasonDelta(ownPlmSpecs, "frontLength");
    const nearest = nearestCompetitor(ownFit, market, "chest", "frontLength");

    const chestDev = chestStats && ownFit.spec.chest != null
      ? positionDeviation(ownFit.spec.chest, chestStats)
      : null;

    const marketShift = chestDelta && chestDelta.delta !== 0
      ? `가슴 여유가 ${chestDelta.delta > 0 ? "확대" : "축소"}되는 방향 (자사 25S→26S ${chestDelta.delta > 0 ? "+" : ""}${chestDelta.delta}cm)`
      : "가슴 스펙 안정적 유지";
    const ourPosition = chestDev != null
      ? `시장 평균 대비 가슴 ${chestDev > 0 ? "+" : ""}${chestDev}σ`
      : "시장 평균 데이터 부족";
    const nextAction = chestDev != null && chestDev < -0.5
      ? "가슴 여유량 확대 검토"
      : "현재 실루엣 유지, 미세 조정만 적용";

    const executiveConclusion = chestStats
      ? `현재 시장 평균 가슴 스펙은 ${chestStats.mean}cm이며, 자사(${ownFit.name})는 ${ownFit.spec.chest ?? "N/A"}cm로 ${ourPosition}에 위치합니다. 다음 시즌에는 ${ownFit.name}의 기본 실루엣을 유지하고, ${marketShift} 흐름에 맞춰 세부 스펙을 조정하는 것을 권장합니다.`
      : "시장 데이터가 부족하여 결론을 계산할 수 없습니다.";

    const marketSummary = chestStats && lengthStats
      ? `${chestStats.n}개 경쟁 스타일 기준 평균 가슴 ${chestStats.mean}cm, 평균 총장 ${lengthStats.mean}cm (표준편차 ${chestStats.stdev}cm / ${lengthStats.stdev}cm).`
      : "시장 스펙 데이터가 부족합니다.";

    const positionDiagnosis = chestDev != null && nearest
      ? `자사는 시장 평균보다 가슴이 ${chestDev > 0 ? "여유 있고" : "슬림하고"} (${chestDev}σ), 가장 가까운 경쟁 스타일은 ${nearest.brand} ${nearest.style}입니다.`
      : "포지션을 계산하기 위한 데이터가 부족합니다.";

    const strengthEvidence = lengthDelta
      ? `자사 총장 25S→26S 변화 ${lengthDelta.delta}cm로 실루엣 균형 유지`
      : "총장 데이터 부족";
    const gapEvidence = chestDev != null
      ? `시장 평균 대비 가슴 편차 ${chestDev}σ`
      : "가슴 편차 계산 불가";
    const opportunityEvidence = chestDelta
      ? `시장 스타일 ${market.length}건 중 자사 인접 스타일: ${nearest ? `${nearest.brand} ${nearest.style}` : "없음"}`
      : "기회 근거 부족";

    const recommendations: Recommendation[] = RECOMMEND_FIELDS.flatMap((field) => {
      const stats = fieldStats(market, field);
      const current = ownFit.spec[field];
      if (!stats || current == null) return [];
      const recommended = round1(current + (stats.median - current) * 0.5);
      return [{
        pom: FIELD_LABEL[field] ?? field,
        current,
        marketMedian: stats.median,
        recommended,
        change: round1(recommended - current),
        changeReason: `시장 중앙값(${stats.median}cm)과 자사 아이덴티티를 절반씩 반영한 절충 스펙`,
        referenceStyles: market
          .filter((m) => typeof m.spec[field] === "number")
          .slice(0, 3)
          .map((m) => `${m.brand} ${m.style}`),
        confidence: confidenceFromStats(stats),
      }];
    });

    return {
      executiveConclusion,
      marketShift,
      ourPosition,
      nextAction,
      marketSummary,
      positionDiagnosis,
      diagnosis: {
        strength: { title: "실루엣 일관성", body: "핵심 핏의 시즌간 변화폭이 작아 브랜드 아이덴티티가 유지되고 있습니다.", evidence: strengthEvidence },
        gap: { title: "시장 평균 대비 편차", body: "일부 POM이 시장 평균과 벌어져 있어 신규 고객 접근성에 영향을 줄 수 있습니다.", evidence: gapEvidence },
        opportunity: { title: "인접 경쟁 스타일 벤치마크", body: "가장 가까운 경쟁 스타일의 스펙을 참고해 신규 핏 테스트에 활용할 수 있습니다.", evidence: opportunityEvidence },
      },
      recommendations,
    };
  },
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

# AI Fit Strategy Dashboard — 프로젝트 규칙

## 목적
경쟁사/자사 핏 데이터를 AI로 분석해 시장 내 자사 포지션을 진단하고, 신규 시즌
핏/실루엣 수정 방향을 근거와 함께 제안하는 경영진용 Executive Report.
흐름: Market → Position → Diagnosis → Recommendation.

## 독립성
- 다른 AI_JUNGHYUN 하위 프로젝트(project 1-4, discovery fit guide/library,
  ai trend report)를 절대 수정하지 않는다. 이 프로젝트는 그것들과 완전히
  분리된 독립 git 저장소다.
- `discovery fit library/fit_library.db`는 `scripts/export_snapshot.py`로
  1회성 read-only export만 한다. 이 프로젝트에서 그 DB에 쓰기 금지.

## 데이터
- `src/data/*.json`이 유일한 데이터 소스 (정적, 빌드 타임 import).
  실데이터 갱신이 필요하면 `scripts/export_snapshot.py`를 다시 실행한다.
- Phase 1 고정 범위: Season=26S(자사)/현재 스냅샷(경쟁사), Category=티셔츠,
  Gender=남/여. 다른 필터 옵션은 UI에 보이되 비활성화("Coming soon").
- 모든 숫자는 `src/utils/analytics.ts`의 순수 함수로 계산한다. AI가 숫자를
  임의로 만들지 않는다 (`src/services/aiAnalysis.ts`는 계산된 stats만 문장화).
- market_entries에는 시즌 이력이 없다 — "시즌 변화"는 자사 PLM 25S→26S 실측
  변화로 대체하고 그렇게 라벨링한다. 시장 전체의 시즌 트렌드로 과장 금지.

## 디자인 시스템
- 색상 토큰(`src/index.css`): `--bg #FAFAF8`, `--ink #1A1A1A`,
  `--muted #6B6B66`, `--border #E4E2DC`, `--neutral-competitor #B3B0A8`,
  `--accent #B5502C`. Accent는 자사 브랜드 강조/헤드라인/주요 버튼에만 사용.
- 단일 페이지, 사이드바/라우터 없음. Uber 스타일(pill 버튼 등, 기존
  대시보드 규칙)은 이 프로젝트에 적용하지 않는다.

## 개발 서버 실행
```powershell
cd "C:\Users\AC1218\Desktop\새 폴더 (2)\AI_JUNGHYUN\output\ai-fit-strategy-dashboard"
npm run dev
```
- 접속: http://localhost:5175/
- 테스트: `npm run test`
- 타입체크: `npx tsc -b`
- 데이터 재생성: `C:\Users\AC1218\Desktop\DCS\.venv\Scripts\python.exe scripts/export_snapshot.py`

# AI Fit Strategy Dashboard — Design Spec

Date: 2026-09-04
Status: Approved for implementation planning

## 0. Isolation & Non-Goals

- New, independent project at `output\ai-fit-strategy-dashboard\`. Own git repo.
  Existing dashboards (`project 1`–`4`, `discovery fit guide`, `discovery fit
  library`, `ai trend report`) are **not modified** — this project only reads
  `discovery fit library\fit_library.db` once, read-only, via an offline export
  script, and is never a runtime dependency of that project or vice versa.
- Not a redesign of any existing dashboard. No shared UI/layout/component code
  with prior projects. Uber-style design system (`--r-pill`, B&W-only, etc.)
  from CLAUDE.md's "기존 대시보드" rule does **not** apply here — this project
  defines its own design language (§7).
- Single page. No router, no sidebar, no multi-page navigation.
- Dev server: **port 5175** (unused by any sibling project — 8000/8001/8004/
  8005/8010/9003 are all taken).

## 1. Purpose (from user spec, verbatim intent)

Diagnose our brand's fit position in market vs. competitors using AI, and
recommend next-season fit/silhouette direction with evidence. Flow:
Market → Position → Diagnosis → Recommendation. Audience: 회장/경영진 (10-second
takeaway) and TD/기획 (need POM-level evidence). Report page, screenshot/print/
PDF friendly.

## 2. Data Source (real data snapshot, decoupled)

`fit_library.db` (SQLite, in `discovery fit library\`) has real, usable data:

| Table | Rows used | Role |
|---|---|---|
| `fits` | 8, `status='confirmed'` | 자사 confirmed fit definitions (name, POM, images) |
| `plm_specs` | 139 total, filter `sesn IN ('25S','26S')` → 70+69 | 자사 실측 스펙 by product code, two seasons → enables real season-over-season change for **our own** specs |
| `market_entries` | 26 | 경쟁사 스펙 (brand, style, fit, chest/length/etc., image, source_url, `spec_estimated` flag). No `season` column populated (all NULL) — see Known Limitation below. |

**Known limitation (surface to user, do not fabricate around it):**
`market_entries` has no real season history — it's a single current snapshot.
The spec's "이전 시즌 대비 변화" / "실루엣 변화" chart in the Market section
will use **real 자사 PLM 25S→26S change** (the only real season-over-season
number available) and be labeled explicitly "자사 스펙 변화 (25S→26S)" rather
than implying a market-wide historical trend. Market-wide trend commentary in
the AI summary will be phrased as a current-snapshot read ("현재 시장은..."),
not a "vs last season" claim, since we have no real data to back that. This
is the single biggest data gap for this project going forward — flagged again
in the final report's "다음에 필요한 데이터" line.

**Fixed scope for Phase 1** (matches what real data actually covers):
Season = 26S (own) / current snapshot (competitors), Category = 티셔츠,
Gender = 남/여 both present. Filter UI shows the full set of controls from
§5 but only these real values are wired; all other options are visible,
disabled, labeled "Coming soon" — never silently backed by fake data.

**Fit label normalization:** `market_entries.fit` is free text ("Slim ",
"Regular Fit", "Loose Fit", "Close Fit", "Classic Fit", "Semi-over Fit", NULL).
`plm_specs.fit_name` is a clean enum (Regular/Semi-Over/Slim/Over). A pure
function `normalizeFitLabel()` in `utils/analytics.ts` maps raw market fit
strings to the same canonical set used for our own fits (Slim / Regular /
Semi-Over / Over / Loose / Close / Classic), for the Fit 구성 비율 chart.
This is a labeling/bucketing function, not a numeric estimate — it never
invents a spec value.

### 2.1 Export pipeline (offline, one-time — not part of the running app)

`scripts/export_snapshot.py` (Python, run manually with the DCS venv):
1. Opens `fit_library.db` read-only (`file:...?mode=ro`), same pattern as
   `ai trend report/db_source.py`.
2. Writes UTF-8 JSON:
   - `src/data/ownFits.json` ← `fits` (confirmed only)
   - `src/data/plmSpecs.json` ← `plm_specs` where `sesn IN ('25S','26S')`
   - `src/data/marketEntries.json` ← `market_entries`
3. Copies only the image files actually referenced by the rows above
   (`fits.image_path_crop/full/product`, `market_entries.image_path`) from
   `discovery fit library\uploads\` into `public/evidence/<filename>`.
   `plm_specs.prdt_img_url` / `po_img` are already remote F&F CDN URLs — used
   directly via `<img src>`, not copied.
4. Script is idempotent and safe to re-run; it never writes back to
   `fit_library.db`.

## 3. Data Model (`types/`)

TypeScript types mirror the DB shape closely (no premature abstraction),
plus a `dataType` discriminator required by the spec's evidence-quality rule:

```ts
type DataType = 'actual_measurement' | 'official_spec' | 'ai_estimate';

interface OwnFit {
  id: string; name: string; gender: 'men' | 'women'; tagline?: string;
  spec: PomSpec; images: { crop?: string; full?: string; product?: string };
}

interface PlmSpec {
  id: string; productCode: string; productName: string;
  gender: 'men' | 'women'; season: '25S' | '26S'; baseSize: string;
  fitName: 'Regular' | 'Semi-Over' | 'Slim' | 'Over';
  spec: PomSpec; imageUrl?: string; techPackUrl?: string;
}

interface MarketEntry {
  id: string; brand: string; style: string; gender: 'men' | 'women';
  fitRaw: string | null; fitNormalized: string;
  spec: Partial<PomSpec>; dataType: DataType; // spec_estimated → ai_estimate else actual_measurement
  imagePath?: string; sourceUrl?: string;
}

interface PomSpec {
  frontLength?: number; backLength?: number; chest?: number;
  waistPosition?: number; waist?: number; hem?: number; neckWidth?: number;
  frontNeckDepth?: number; backNeckDepth?: number; shoulder?: number;
  hwajang?: number; sleeveCircumference?: number; sleeveHem?: number;
  shoulderAngle?: number; armholeDepth?: number;
}
```

`fits`/`plm_specs` rows are always `data_type: 'official_spec'` (자사 실측/컨펌
데이터); `market_entries` is `'actual_measurement'` when `spec_estimated=0`,
`'ai_estimate'` when `spec_estimated=1`.

## 4. Analytics (`utils/analytics.ts`) — pure functions, no AI involved

- `mean`, `median`, `stdev` per POM field over a filtered entry set.
- `seasonDelta(plmSpecs, field)` → 25S vs 26S mean diff for 자사.
- `fitDistribution(entries)` → counts by normalized fit label (for the Fit
  구성 비율 chart).
- `lengthDistribution` → bucketed by front_length using tercile boundaries
  computed from the filtered dataset itself (bottom third = Crop, middle
  third = Standard, top third = Long), so thresholds always reflect the
  actual data in view rather than a hardcoded cm value that could stop
  matching once filters change.
- `positionDeviation(ownSpec, marketStats, field)` → z-score-like deviation
  (value − mean) / stdev, used for the Position map and "시장 평균 대비 편차"
  text.
- `nearestCompetitor(ownEntry, marketEntries)` → Euclidean distance in
  (chest, frontLength) space, smallest wins.
- All of these are unit-testable in isolation; AI never recomputes them.

## 5. AI Layer (`services/aiAnalysis.ts`)

```ts
interface AIStrategyInput { ownFit: OwnFit; ownSpecs: PlmSpec[]; market: MarketEntry[]; stats: ReturnType<typeof computeAllStats>; }
interface AIStrategyResult {
  executiveConclusion: string; // the single "현재 시장은...자사는...권장합니다" sentence
  marketShift: string; ourPosition: string; nextAction: string; // short phrases
  marketSummary: string; positionDiagnosis: string;
  diagnosis: { strength: {title,body,evidence}[]; gap: [...]; opportunity: [...] };
  recommendations: { pom: string; current: number; marketMedian: number; recommended: number; changeReason: string; referenceStyles: string[]; confidence: 'high'|'medium'|'low' }[];
}
interface AIAdapter { analyze(input: AIStrategyInput): Promise<AIStrategyResult>; }
```

Phase 1 ships `mockAiAdapter: AIAdapter` — a deterministic function that
builds every sentence and number from the already-computed `stats` object
(never invents a POM value; confidence is derived from `n` and `stdev`, not
guessed). A `geminiAiAdapter` implementing the same interface is left as a
documented stub for a later phase — not built now, no Gemini call in Phase 1
(no `.env`, no API key, no backend needed for Phase 1 at all, since this is a
static-data SPA).

## 6. Screen structure (single page, in order)

A. Executive Conclusion — title "AI FIT STRATEGY", filter summary line,
   one large highlighted sentence, three short phrase chips (Market Shift /
   Our Position / Next Action). No KPI card grid.
B. Market — Fit 구성 비율 (donut), Length 구성 비율 (donut), 자사 25S→26S 스펙
   변화 (labeled honestly per §2), AI summary paragraph (2-3 lines) next to
   the numbers that back it.
C. Position — Chest × Body-length scatter (Recharts ScatterChart): competitors
   neutral gray, 자사 accent color, market-core band shaded (defined as
   mean ± 1 stdev on both axes — a rectangle, computed by `utils/analytics.ts`,
   never eyeballed), nearest competitor line, AI diagnosis paragraph.
D. Diagnosis — exactly 3 cards: Strength / Gap / Opportunity, each: short
   title + 1-2 sentence body + one supporting number.
E. Recommendation — POM comparison table (Current / Market Median /
   Recommended / Change), silhouette placeholder (labeled "Current vs
   Recommended" side-by-side box outline, not a fabricated SVG garment),
   confidence badge per row, reasoning text, reference competitor styles.
F. Supporting Evidence — collapsed by default; "View Supporting Data" opens a
   drawer listing 3-5 reference competitor entries (image, brand/style,
   fit/length, key specs, source link, data-type badge, confidence) pulled
   from `marketEntries.json`.

Filters bar (Season/Gender/Category/Size/Competitor Brands/Our Style) + a
"Generate AI Fit Strategy" button sits above section A; changing filters and
regenerating recomputes B–F from the same filtered dataset via the analytics
functions, then re-runs the mock AI adapter.

## 7. Visual Design

- Desktop-first, 1440px canvas, generous whitespace, no shadows/gradients,
  minimal icons (Lucide, used sparingly — never decorative).
- Palette (all defined as CSS variables, both light-only — no dark mode
  required per spec's "밝은 배경" rule, but tokens still centralized for
  maintainability):
  - `--bg: #FAFAF8` (warm off-white), `--surface: #FFFFFF`
  - `--ink: #1A1A1A` (charcoal text/headings), `--muted: #6B6B66`
  - `--border: #E4E2DC`
  - `--neutral-competitor: #B3B0A8` (competitor marks/bars — desaturated)
  - `--accent: #B5502C` (burnt terracotta — used ONLY for 자사 brand marks,
    the one highlighted sentence, and primary actions; never for competitors)
- Typography: Inter, large serif-weight numerals for the one headline
  sentence in A, small-caps section labels.
- Print CSS: `@media print` hides the filter bar and the evidence drawer
  trigger, forces light background, breaks sections onto sane page boundaries
  (`break-inside: avoid` on cards/tables).

## 8. Tech Stack

React + TypeScript + Vite + Tailwind CSS + Recharts + lucide-react. No state
library (local component state / context is enough for one page), no router,
no backend framework, no ORM — static JSON imported at build time.

## 9. Explicit Non-Goals (from user's §8 avoid-list)

No multi-page nav, no decorative KPI cards, no more than one accent color, no
long AI paragraphs (2-3 lines max per summary), no unevidenced recommendations,
no fabricated numbers anywhere (AI text is generated *from* computed stats,
never independently), no full raw-data table on the main screen (only inside
the Supporting Evidence drawer), no generic admin-dashboard look.

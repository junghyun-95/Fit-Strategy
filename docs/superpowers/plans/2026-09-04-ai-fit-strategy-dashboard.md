# AI Fit Strategy Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Phase 1 of a standalone Executive Report dashboard (React/TS/Vite) that diagnoses our fit position vs. competitors and recommends next-season fit direction, backed by a real read-only data snapshot exported from `discovery fit library/fit_library.db`.

**Architecture:** Single-page React SPA, no backend, no router. A one-time Python export script produces static JSON + copied images consumed at build time. Pure functions in `utils/analytics.ts` compute every number; `services/aiAnalysis.ts` generates narrative text strictly from those computed numbers via a swappable adapter interface (mock adapter only in this phase). Components are organized as `report/` (section shells + filters), `charts/` (Recharts wrappers), `evidence/` (drawer).

**Tech Stack:** React 18, TypeScript, Vite 5, Tailwind CSS, Recharts, lucide-react, Vitest (unit tests for pure functions only — no component testing library needed since UI correctness is verified visually per spec).

**Spec:** `docs/superpowers/specs/2026-09-04-ai-fit-strategy-dashboard-design.md`

## Global Constraints

- New project lives entirely at `output\ai-fit-strategy-dashboard\`, independent git repo, own `package.json`. Existing sibling projects (`project 1`–`4`, `discovery fit guide`, `discovery fit library`, `ai trend report`) are never modified.
- Dev server runs on port **5175** (`vite.config.ts` → `server.port: 5175`).
- No UI/layout/component code is copied from any existing dashboard. Uber-style B&W/pill design system from the parent CLAUDE.md does not apply here.
- Single page, no router, no sidebar.
- Palette is fixed: `--bg:#FAFAF8`, `--surface:#FFFFFF`, `--ink:#1A1A1A`, `--muted:#6B6B66`, `--border:#E4E2DC`, `--neutral-competitor:#B3B0A8`, `--accent:#B5502C`. Accent color used ONLY for our own brand marks, the one headline sentence, and primary actions.
- Font: Inter (Google Fonts, loaded via `@fontsource` or CDN `<link>` — pick one in Task 6 and stay consistent).
- No numeric value shown anywhere in the UI may be invented — every number traces to `utils/analytics.ts` output computed from `src/data/*.json`.
- Phase 1 fixed data scope: Season=26S (own) / current snapshot (competitors), Category=티셔츠, Gender=both. Any other filter option is visible but disabled with a "Coming soon" label — never silently backed by fake data.
- Market season-change chart is explicitly labeled "자사 스펙 변화 (25S→26S)" — never implied to be market-wide trend, since `market_entries` has no real season history.
- Do not install any dependency outside: react, react-dom, typescript, vite, @vitejs/plugin-react, tailwindcss, postcss, autoprefixer, recharts, lucide-react, vitest, @types/react, @types/react-dom.

---

### Task 1: Project scaffold (Vite + React + TS + Tailwind)

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `.gitignore`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`

**Interfaces:**
- Produces: a running Vite dev server at `http://localhost:5175/` rendering a placeholder `App` component. All later tasks import Tailwind utility classes and read `src/index.css` CSS variables defined here.

- [ ] **Step 1: Scaffold via Vite CLI**

Run from `output\ai-fit-strategy-dashboard\`:
```bash
npm create vite@latest . -- --template react-ts
```
When prompted about the non-empty directory (it contains `.git/` and `docs/`), choose to continue / ignore existing files.

- [ ] **Step 2: Install base dependencies**

```bash
npm install
npm install -D tailwindcss@^3 postcss autoprefixer
npm install recharts lucide-react
npm install -D vitest
```

- [ ] **Step 3: Initialize Tailwind config**

```bash
npx tailwindcss init -p
```

Edit `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        border: "var(--border)",
        competitor: "var(--neutral-competitor)",
        accent: "var(--accent)",
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: Set dev server port**

Edit `vite.config.ts`:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5175, strictPort: true },
});
```

- [ ] **Step 5: Add design tokens to `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #FAFAF8;
  --surface: #FFFFFF;
  --ink: #1A1A1A;
  --muted: #6B6B66;
  --border: #E4E2DC;
  --neutral-competitor: #B3B0A8;
  --accent: #B5502C;
}

body {
  background: var(--bg);
  color: var(--ink);
  font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

- [ ] **Step 6: Add Inter font via Google Fonts link**

Edit `index.html`, inside `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```
Also set `<title>AI Fit Strategy</title>`.

- [ ] **Step 7: Placeholder App component**

Replace `src/App.tsx`:
```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-bg text-ink p-8">
      <h1 className="text-2xl font-semibold">AI Fit Strategy — scaffold OK</h1>
    </div>
  );
}
```

- [ ] **Step 8: Verify dev server**

Run: `npm run dev`
Expected: server starts on `http://localhost:5175/`; open it and confirm the placeholder heading renders. Stop the server after confirming.

- [ ] **Step 9: `.gitignore`**

```
node_modules
dist
*.log
.env
```

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Scaffold Vite + React + TS + Tailwind project

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JZLSrwrHMDw24iAhz13fv5
EOF
)"
```

---

### Task 2: Data export script (real snapshot from fit_library.db)

**Files:**
- Create: `scripts/export_snapshot.py`
- Create: `scripts/test_export_snapshot.py`
- Create (by running the script): `src/data/ownFits.json`, `src/data/plmSpecs.json`, `src/data/marketEntries.json`, `public/evidence/*` (copied images)

**Interfaces:**
- Produces: JSON files matching the shapes in Task 3's TypeScript types (snake_case→camelCase field names are converted by this script, not left as raw SQL column names, so Task 3 types apply directly with no further mapping).

- [ ] **Step 1: Write the script**

Create `scripts/export_snapshot.py`:
```python
"""One-time, read-only export of a real data snapshot from
discovery fit library's fit_library.db into this project's src/data/*.json
and public/evidence/*. Never writes to fit_library.db. Safe to re-run."""
import json
import shutil
import sqlite3
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = (
    PROJECT_ROOT.parent / "discovery fit library" / "fit_library.db"
)
UPLOADS_DIR = PROJECT_ROOT.parent / "discovery fit library" / "uploads"
DATA_DIR = PROJECT_ROOT / "src" / "data"
EVIDENCE_DIR = PROJECT_ROOT / "public" / "evidence"

SPEC_FIELD_MAP = {
    "front_length": "frontLength", "back_length": "backLength",
    "chest": "chest", "waist_position": "waistPosition", "waist": "waist",
    "hem": "hem", "neck_width": "neckWidth",
    "front_neck_depth": "frontNeckDepth", "back_neck_depth": "backNeckDepth",
    "shoulder": "shoulder", "hwajang": "hwajang",
    "sleeve_circumference": "sleeveCircumference", "sleeve_hem": "sleeveHem",
    "shoulder_angle": "shoulderAngle", "armhole_depth": "armholeDepth",
}


def get_connection(db_path: Path) -> sqlite3.Connection:
    uri = f"file:{db_path.as_posix()}?mode=ro"
    conn = sqlite3.connect(uri, uri=True)
    conn.row_factory = sqlite3.Row
    return conn


def to_spec(row: sqlite3.Row) -> dict:
    spec = {}
    for src, dst in SPEC_FIELD_MAP.items():
        val = row[src] if src in row.keys() else None
        if val is not None:
            spec[dst] = val
    return spec


def build_own_fits(conn: sqlite3.Connection) -> list[dict]:
    cur = conn.execute(
        "SELECT * FROM fits WHERE status = 'confirmed'"
    )
    out = []
    for row in cur.fetchall():
        out.append({
            "id": row["id"],
            "name": row["name"],
            "gender": row["gender"],
            "tagline": row["tagline"],
            "spec": to_spec(row),
            "images": {
                "crop": row["image_path_crop"],
                "full": row["image_path_full"],
                "product": row["image_path_product"],
            },
        })
    return out


def build_plm_specs(conn: sqlite3.Connection) -> list[dict]:
    cur = conn.execute(
        "SELECT * FROM plm_specs WHERE sesn IN ('25S', '26S')"
    )
    out = []
    for row in cur.fetchall():
        out.append({
            "id": row["id"],
            "productCode": row["prdt_cd"],
            "productName": row["prdt_nm"],
            "gender": row["gender"],
            "season": row["sesn"],
            "baseSize": row["base_size"],
            "fitName": row["fit_name"],
            "spec": to_spec(row),
            "imageUrl": row["prdt_img_url"],
            "techPackUrl": row["cad_pdf_url"],
        })
    return out


def build_market_entries(conn: sqlite3.Connection) -> list[dict]:
    cur = conn.execute("SELECT * FROM market_entries")
    out = []
    for row in cur.fetchall():
        out.append({
            "id": row["id"],
            "brand": row["brand"],
            "style": row["style"],
            "gender": row["gender"],
            "fitRaw": row["fit"],
            "spec": to_spec(row),
            "dataType": (
                "ai_estimate" if row["spec_estimated"] == 1
                else "actual_measurement"
            ),
            "imagePath": row["image_path"],
            "sourceUrl": row["source_url"],
        })
    return out


def copy_referenced_images(own_fits: list[dict], market: list[dict]) -> None:
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    paths = set()
    for fit in own_fits:
        for p in fit["images"].values():
            if p:
                paths.add(p)
    for entry in market:
        if entry["imagePath"]:
            paths.add(entry["imagePath"])
    for rel in paths:
        filename = Path(rel).name
        src = UPLOADS_DIR / filename
        if src.exists():
            shutil.copyfile(src, EVIDENCE_DIR / filename)


def write_json(name: str, data) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    path = DATA_DIR / name
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"wrote {path} ({len(data)} rows)")


def main() -> None:
    conn = get_connection(DB_PATH)
    try:
        own_fits = build_own_fits(conn)
        plm_specs = build_plm_specs(conn)
        market = build_market_entries(conn)
    finally:
        conn.close()

    write_json("ownFits.json", own_fits)
    write_json("plmSpecs.json", plm_specs)
    write_json("marketEntries.json", market)
    copy_referenced_images(own_fits, market)
    print(f"copied images into {EVIDENCE_DIR}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Write a verification test**

Create `scripts/test_export_snapshot.py`:
```python
"""Read-only integration check against the real fit_library.db.
Does not write to the DB. Run with pytest."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from export_snapshot import (  # noqa: E402
    DB_PATH, get_connection, build_own_fits, build_plm_specs,
    build_market_entries,
)


def test_db_exists():
    assert DB_PATH.exists(), f"expected fit_library.db at {DB_PATH}"


def test_own_fits_shape():
    conn = get_connection(DB_PATH)
    try:
        fits = build_own_fits(conn)
    finally:
        conn.close()
    assert len(fits) == 8
    assert all(f["gender"] in ("men", "women") for f in fits)
    assert all("chest" in f["spec"] for f in fits)


def test_plm_specs_two_seasons():
    conn = get_connection(DB_PATH)
    try:
        specs = build_plm_specs(conn)
    finally:
        conn.close()
    seasons = {s["season"] for s in specs}
    assert seasons == {"25S", "26S"}
    assert len(specs) == 139


def test_market_entries_data_type_flag():
    conn = get_connection(DB_PATH)
    try:
        entries = build_market_entries(conn)
    finally:
        conn.close()
    assert len(entries) == 26
    assert all(e["dataType"] in ("actual_measurement", "ai_estimate") for e in entries)
```

- [ ] **Step 3: Run the test to verify it fails before the script has run (sanity: DB path resolves, but no assumption skipped)**

Run: `C:\Users\AC1218\Desktop\DCS\.venv\Scripts\python.exe -m pytest scripts/test_export_snapshot.py -v`
Expected: all 4 tests PASS immediately (this is a read-only check against existing real data, not code you're building up — there is no "red" state here since the functions are already fully implemented in Step 1). If `test_db_exists` fails, stop and confirm the sibling `discovery fit library` folder path with the user before continuing.

- [ ] **Step 4: Run the export script**

Run: `C:\Users\AC1218\Desktop\DCS\.venv\Scripts\python.exe scripts/export_snapshot.py`
Expected output: three "wrote ..." lines (8, 139, 26 rows respectively) and "copied images into .../public/evidence".

- [ ] **Step 5: Spot-check the JSON output**

Run: `C:\Users\AC1218\Desktop\DCS\.venv\Scripts\python.exe -c "import json; d=json.load(open('src/data/marketEntries.json', encoding='utf-8')); print(d[0])"`
Expected: a dict with correct UTF-8 Korean brand/style text (not mojibake), confirming the earlier console-encoding artifact does not affect the JSON file itself.

- [ ] **Step 6: Commit**

```bash
git add scripts/export_snapshot.py scripts/test_export_snapshot.py src/data public/evidence
git commit -m "$(cat <<'EOF'
Add read-only data export script and real data snapshot

Exports fits/plm_specs/market_entries from discovery fit library's
fit_library.db (read-only, never written to) into static JSON plus
the referenced product images, decoupled from the source project.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JZLSrwrHMDw24iAhz13fv5
EOF
)"
```

---

### Task 3: TypeScript data model

**Files:**
- Create: `src/types/index.ts`

**Interfaces:**
- Produces: `PomSpec`, `OwnFit`, `PlmSpec`, `MarketEntry`, `DataType`, `Gender`, `FitName` types consumed by every later task that touches data.

- [ ] **Step 1: Write the types**

Create `src/types/index.ts`:
```ts
export type Gender = "men" | "women";
export type DataType = "actual_measurement" | "official_spec" | "ai_estimate";
export type FitName = "Regular" | "Semi-Over" | "Slim" | "Over";

export interface PomSpec {
  frontLength?: number;
  backLength?: number;
  chest?: number;
  waistPosition?: number;
  waist?: number;
  hem?: number;
  neckWidth?: number;
  frontNeckDepth?: number;
  backNeckDepth?: number;
  shoulder?: number;
  hwajang?: number;
  sleeveCircumference?: number;
  sleeveHem?: number;
  shoulderAngle?: number;
  armholeDepth?: number;
}

export const POM_FIELDS: (keyof PomSpec)[] = [
  "frontLength", "backLength", "chest", "waistPosition", "waist", "hem",
  "neckWidth", "frontNeckDepth", "backNeckDepth", "shoulder", "hwajang",
  "sleeveCircumference", "sleeveHem", "shoulderAngle", "armholeDepth",
];

export interface OwnFit {
  id: string;
  name: string;
  gender: Gender;
  tagline: string | null;
  spec: PomSpec;
  images: { crop: string | null; full: string | null; product: string | null };
}

export interface PlmSpec {
  id: string;
  productCode: string;
  productName: string;
  gender: Gender;
  season: "25S" | "26S";
  baseSize: string;
  fitName: FitName;
  spec: PomSpec;
  imageUrl: string | null;
  techPackUrl: string | null;
}

export interface MarketEntry {
  id: string;
  brand: string;
  style: string;
  gender: Gender;
  fitRaw: string | null;
  spec: PomSpec;
  dataType: DataType;
  imagePath: string | null;
  sourceUrl: string | null;
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors (file has no consumers yet, so this just checks syntax validity).

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "$(cat <<'EOF'
Add TypeScript data model for fits, PLM specs, and market entries

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JZLSrwrHMDw24iAhz13fv5
EOF
)"
```

---

### Task 4: Core statistics functions (mean/median/stdev/seasonDelta)

**Files:**
- Create: `src/utils/analytics.ts`
- Create: `src/utils/analytics.test.ts`

**Interfaces:**
- Consumes: `PomSpec`, `POM_FIELDS`, `PlmSpec` from `src/types/index.ts`.
- Produces: `mean(values: number[]): number`, `median(values: number[]): number`, `stdev(values: number[]): number`, `fieldStats(entries: {spec: PomSpec}[], field: keyof PomSpec): {n: number; mean: number; median: number; stdev: number; min: number; max: number} | null`, `seasonDelta(plmSpecs: PlmSpec[], field: keyof PomSpec): {from25S: number; to26S: number; delta: number} | null`. These are consumed by Tasks 5, 10.

- [ ] **Step 1: Configure Vitest**

Add to `package.json` `scripts`: `"test": "vitest run"`.
Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node" },
});
```

- [ ] **Step 2: Write failing tests**

Create `src/utils/analytics.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { mean, median, stdev, fieldStats, seasonDelta } from "./analytics";
import type { PlmSpec } from "../types";

describe("mean/median/stdev", () => {
  it("computes mean", () => {
    expect(mean([2, 4, 6])).toBe(4);
  });
  it("computes median for odd length", () => {
    expect(median([5, 1, 3])).toBe(3);
  });
  it("computes median for even length", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });
  it("computes population stdev", () => {
    expect(stdev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2, 5);
  });
  it("throws on empty input", () => {
    expect(() => mean([])).toThrow();
  });
});

describe("fieldStats", () => {
  it("aggregates a POM field across entries, ignoring missing values", () => {
    const entries = [
      { spec: { chest: 100 } },
      { spec: { chest: 104 } },
      { spec: {} },
    ];
    const stats = fieldStats(entries, "chest");
    expect(stats).toEqual({ n: 2, mean: 102, median: 102, stdev: 2, min: 100, max: 104 });
  });
  it("returns null when no entry has the field", () => {
    expect(fieldStats([{ spec: {} }], "chest")).toBeNull();
  });
});

describe("seasonDelta", () => {
  it("computes 25S->26S mean delta for a field", () => {
    const specs: PlmSpec[] = [
      { id: "1", productCode: "A", productName: "a", gender: "men", season: "25S", baseSize: "100", fitName: "Regular", spec: { chest: 108 }, imageUrl: null, techPackUrl: null },
      { id: "2", productCode: "B", productName: "b", gender: "men", season: "26S", baseSize: "100", fitName: "Regular", spec: { chest: 109 }, imageUrl: null, techPackUrl: null },
    ];
    const result = seasonDelta(specs, "chest");
    expect(result).toEqual({ from25S: 108, to26S: 109, delta: 1 });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — `src/utils/analytics.ts` does not exist yet.

- [ ] **Step 4: Implement**

Create `src/utils/analytics.ts`:
```ts
import type { PomSpec, PlmSpec } from "../types";

export function mean(values: number[]): number {
  if (values.length === 0) throw new Error("mean of empty array");
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function median(values: number[]): number {
  if (values.length === 0) throw new Error("median of empty array");
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function stdev(values: number[]): number {
  if (values.length === 0) throw new Error("stdev of empty array");
  const m = mean(values);
  const variance = mean(values.map((v) => (v - m) ** 2));
  return Math.sqrt(variance);
}

export interface FieldStats {
  n: number;
  mean: number;
  median: number;
  stdev: number;
  min: number;
  max: number;
}

export function fieldStats(
  entries: { spec: PomSpec }[],
  field: keyof PomSpec
): FieldStats | null {
  const values = entries
    .map((e) => e.spec[field])
    .filter((v): v is number => typeof v === "number");
  if (values.length === 0) return null;
  return {
    n: values.length,
    mean: round1(mean(values)),
    median: round1(median(values)),
    stdev: round1(stdev(values)),
    min: round1(Math.min(...values)),
    max: round1(Math.max(...values)),
  };
}

export interface SeasonDelta {
  from25S: number;
  to26S: number;
  delta: number;
}

export function seasonDelta(
  plmSpecs: PlmSpec[],
  field: keyof PomSpec
): SeasonDelta | null {
  const values25S = plmSpecs
    .filter((s) => s.season === "25S")
    .map((s) => s.spec[field])
    .filter((v): v is number => typeof v === "number");
  const values26S = plmSpecs
    .filter((s) => s.season === "26S")
    .map((s) => s.spec[field])
    .filter((v): v is number => typeof v === "number");
  if (values25S.length === 0 || values26S.length === 0) return null;
  const from25S = round1(mean(values25S));
  const to26S = round1(mean(values26S));
  return { from25S, to26S, delta: round1(to26S - from25S) };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS, all tests green.

- [ ] **Step 6: Commit**

```bash
git add src/utils/analytics.ts src/utils/analytics.test.ts vitest.config.ts package.json
git commit -m "$(cat <<'EOF'
Add core statistics functions with unit tests

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JZLSrwrHMDw24iAhz13fv5
EOF
)"
```

---

### Task 5: Positioning and distribution functions

**Files:**
- Modify: `src/utils/analytics.ts` (append)
- Modify: `src/utils/analytics.test.ts` (append)

**Interfaces:**
- Consumes: `mean`, `median`, `stdev`, `fieldStats` from Task 4; `MarketEntry`, `OwnFit`, `FitName` from Task 3.
- Produces: `normalizeFitLabel(raw: string | null): string`, `fitDistribution(entries: {fitRaw: string | null}[]): Record<string, number>`, `lengthDistribution(entries: {spec: PomSpec}[]): {crop: number; standard: number; long: number}`, `marketCoreBand(entries: {spec: PomSpec}[], xField: keyof PomSpec, yField: keyof PomSpec): {xMin: number; xMax: number; yMin: number; yMax: number} | null`, `positionDeviation(ownValue: number, marketStats: FieldStats): number`, `nearestCompetitor<T extends {spec: PomSpec}>(own: {spec: PomSpec}, market: T[], xField: keyof PomSpec, yField: keyof PomSpec): T | null`. Consumed by Tasks 9, 11, 12.

- [ ] **Step 1: Write failing tests (append to analytics.test.ts)**

```ts
import {
  normalizeFitLabel, fitDistribution, lengthDistribution,
  marketCoreBand, positionDeviation, nearestCompetitor,
} from "./analytics";

describe("normalizeFitLabel", () => {
  it("trims and title-cases known fit words", () => {
    expect(normalizeFitLabel("Slim ")).toBe("Slim");
    expect(normalizeFitLabel("Regular Fit")).toBe("Regular");
    expect(normalizeFitLabel("Semi-over Fit")).toBe("Semi-Over");
    expect(normalizeFitLabel("Loose Fit")).toBe("Loose");
    expect(normalizeFitLabel("Close Fit")).toBe("Close");
    expect(normalizeFitLabel("Classic Fit")).toBe("Classic");
  });
  it("returns Unlabeled for null/empty", () => {
    expect(normalizeFitLabel(null)).toBe("Unlabeled");
    expect(normalizeFitLabel("")).toBe("Unlabeled");
  });
});

describe("fitDistribution", () => {
  it("counts normalized labels", () => {
    const entries = [{ fitRaw: "Slim " }, { fitRaw: "Slim Fit" }, { fitRaw: null }];
    expect(fitDistribution(entries)).toEqual({ Slim: 2, Unlabeled: 1 });
  });
});

describe("lengthDistribution", () => {
  it("buckets frontLength into terciles of the given set", () => {
    const entries = [
      { spec: { frontLength: 45 } }, { spec: { frontLength: 50 } },
      { spec: { frontLength: 55 } }, { spec: { frontLength: 60 } },
      { spec: { frontLength: 65 } }, { spec: { frontLength: 70 } },
    ];
    const dist = lengthDistribution(entries);
    expect(dist.crop + dist.standard + dist.long).toBe(6);
    expect(dist.crop).toBe(2);
    expect(dist.long).toBe(2);
  });
});

describe("marketCoreBand", () => {
  it("returns mean +/- 1 stdev rectangle on both axes", () => {
    const entries = [
      { spec: { chest: 100, frontLength: 60 } },
      { spec: { chest: 110, frontLength: 70 } },
    ];
    const band = marketCoreBand(entries, "chest", "frontLength");
    expect(band).not.toBeNull();
    expect(band!.xMin).toBeLessThan(105);
    expect(band!.xMax).toBeGreaterThan(105);
  });
});

describe("positionDeviation", () => {
  it("computes (value-mean)/stdev", () => {
    const stats = { n: 5, mean: 100, median: 100, stdev: 5, min: 90, max: 110 };
    expect(positionDeviation(110, stats)).toBe(2);
  });
});

describe("nearestCompetitor", () => {
  it("finds the closest entry by euclidean distance on two fields", () => {
    const own = { spec: { chest: 100, frontLength: 60 } };
    const market = [
      { id: "far", spec: { chest: 130, frontLength: 90 } },
      { id: "near", spec: { chest: 101, frontLength: 61 } },
    ];
    expect(nearestCompetitor(own, market, "chest", "frontLength")?.id).toBe("near");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — new exports not defined.

- [ ] **Step 3: Implement (append to analytics.ts)**

```ts
const FIT_WORD_MAP: Record<string, string> = {
  slim: "Slim",
  regular: "Regular",
  "semi-over": "Semi-Over",
  loose: "Loose",
  close: "Close",
  classic: "Classic",
  over: "Over",
};

export function normalizeFitLabel(raw: string | null): string {
  if (!raw || !raw.trim()) return "Unlabeled";
  const cleaned = raw.trim().toLowerCase().replace(/\bfit\b/g, "").trim();
  return FIT_WORD_MAP[cleaned] ?? (cleaned.charAt(0).toUpperCase() + cleaned.slice(1));
}

export function fitDistribution(
  entries: { fitRaw: string | null }[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of entries) {
    const label = normalizeFitLabel(e.fitRaw);
    counts[label] = (counts[label] ?? 0) + 1;
  }
  return counts;
}

export function lengthDistribution(
  entries: { spec: PomSpec }[]
): { crop: number; standard: number; long: number } {
  const values = entries
    .map((e) => e.spec.frontLength)
    .filter((v): v is number => typeof v === "number")
    .sort((a, b) => a - b);
  const n = values.length;
  const t1 = values[Math.floor(n / 3) - 1] ?? values[0];
  const t2 = values[Math.floor((2 * n) / 3) - 1] ?? values[n - 1];
  let crop = 0, standard = 0, long = 0;
  for (const v of values) {
    if (v <= t1) crop++;
    else if (v <= t2) standard++;
    else long++;
  }
  return { crop, standard, long };
}

export function marketCoreBand(
  entries: { spec: PomSpec }[],
  xField: keyof PomSpec,
  yField: keyof PomSpec
): { xMin: number; xMax: number; yMin: number; yMax: number } | null {
  const xStats = fieldStats(entries, xField);
  const yStats = fieldStats(entries, yField);
  if (!xStats || !yStats) return null;
  return {
    xMin: round1(xStats.mean - xStats.stdev),
    xMax: round1(xStats.mean + xStats.stdev),
    yMin: round1(yStats.mean - yStats.stdev),
    yMax: round1(yStats.mean + yStats.stdev),
  };
}

export function positionDeviation(ownValue: number, marketStats: FieldStats): number {
  if (marketStats.stdev === 0) return 0;
  return round1((ownValue - marketStats.mean) / marketStats.stdev);
}

export function nearestCompetitor<T extends { spec: PomSpec }>(
  own: { spec: PomSpec },
  market: T[],
  xField: keyof PomSpec,
  yField: keyof PomSpec
): T | null {
  const ox = own.spec[xField];
  const oy = own.spec[yField];
  if (typeof ox !== "number" || typeof oy !== "number") return null;
  let best: T | null = null;
  let bestDist = Infinity;
  for (const entry of market) {
    const mx = entry.spec[xField];
    const my = entry.spec[yField];
    if (typeof mx !== "number" || typeof my !== "number") continue;
    const dist = Math.sqrt((mx - ox) ** 2 + (my - oy) ** 2);
    if (dist < bestDist) {
      bestDist = dist;
      best = entry;
    }
  }
  return best;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS, all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/utils/analytics.ts src/utils/analytics.test.ts
git commit -m "$(cat <<'EOF'
Add fit/length distribution and positioning analytics functions

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JZLSrwrHMDw24iAhz13fv5
EOF
)"
```

---

### Task 6: Mock AI adapter

**Files:**
- Create: `src/services/aiAnalysis.ts`
- Create: `src/services/aiAnalysis.test.ts`

**Interfaces:**
- Consumes: `fieldStats`, `FieldStats`, `seasonDelta`, `positionDeviation`, `nearestCompetitor` from `src/utils/analytics.ts`; `OwnFit`, `PlmSpec`, `MarketEntry` from `src/types`.
- Produces: `AIStrategyInput`, `AIStrategyResult`, `AIAdapter` interface, `mockAiAdapter: AIAdapter`, `confidenceFromStats(stats: FieldStats): "high" | "medium" | "low"`. Consumed by Tasks 10, 12, 14.

- [ ] **Step 1: Write failing tests**

Create `src/services/aiAnalysis.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { mockAiAdapter, confidenceFromStats } from "./aiAnalysis";
import type { AIStrategyInput } from "./aiAnalysis";
import { fieldStats } from "../utils/analytics";

describe("confidenceFromStats", () => {
  it("is high for large n and low stdev", () => {
    expect(confidenceFromStats({ n: 20, mean: 100, median: 100, stdev: 1, min: 98, max: 102 })).toBe("high");
  });
  it("is low for small n or high stdev", () => {
    expect(confidenceFromStats({ n: 3, mean: 100, median: 100, stdev: 20, min: 60, max: 140 })).toBe("low");
  });
});

describe("mockAiAdapter", () => {
  const input: AIStrategyInput = {
    ownFit: {
      id: "1", name: "Regular Fit", gender: "men", tagline: null,
      spec: { chest: 112, frontLength: 69 },
      images: { crop: null, full: null, product: null },
    },
    ownPlmSpecs: [
      { id: "a", productCode: "X1", productName: "p1", gender: "men", season: "25S", baseSize: "100", fitName: "Regular", spec: { chest: 108 }, imageUrl: null, techPackUrl: null },
      { id: "b", productCode: "X2", productName: "p2", gender: "men", season: "26S", baseSize: "100", fitName: "Regular", spec: { chest: 109 }, imageUrl: null, techPackUrl: null },
    ],
    market: [
      { id: "m1", brand: "New Balance", style: "Tee", gender: "men", fitRaw: "Regular Fit", spec: { chest: 108, frontLength: 71 }, dataType: "actual_measurement", imagePath: null, sourceUrl: null },
      { id: "m2", brand: "Lululemon", style: "Tee", gender: "men", fitRaw: "Slim Fit", spec: { chest: 104, frontLength: 68 }, dataType: "actual_measurement", imagePath: null, sourceUrl: null },
    ],
  };

  it("produces an executive conclusion that cites only computed numbers", async () => {
    const result = await mockAiAdapter.analyze(input);
    const chestStats = fieldStats(input.market, "chest");
    expect(result.executiveConclusion).toContain(String(chestStats!.mean));
    expect(result.executiveConclusion.length).toBeGreaterThan(0);
  });

  it("returns exactly 3 diagnosis buckets: strength, gap, opportunity", async () => {
    const result = await mockAiAdapter.analyze(input);
    expect(Object.keys(result.diagnosis)).toEqual(["strength", "gap", "opportunity"]);
  });

  it("returns a recommendation row per requested POM field with a confidence label", async () => {
    const result = await mockAiAdapter.analyze(input);
    expect(result.recommendations.length).toBeGreaterThan(0);
    for (const rec of result.recommendations) {
      expect(["high", "medium", "low"]).toContain(rec.confidence);
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — `src/services/aiAnalysis.ts` does not exist yet.

- [ ] **Step 3: Implement**

Create `src/services/aiAnalysis.ts`:
```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS, all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/services/aiAnalysis.ts src/services/aiAnalysis.test.ts
git commit -m "$(cat <<'EOF'
Add AI adapter interface and mock adapter driven only by computed stats

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JZLSrwrHMDw24iAhz13fv5
EOF
)"
```

---

### Task 7: Filter bar and top-level report state

**Files:**
- Create: `src/components/report/FilterBar.tsx`
- Create: `src/pages/ExecutiveReport.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `OwnFit`, `MarketEntry`, `PlmSpec` types; `ownFits.json`, `marketEntries.json`, `plmSpecs.json` data.
- Produces: `ReportFilters` type `{ season: "26S"; gender: Gender; category: "티셔츠"; size: string; competitorBrands: string[]; ownStyleId: string }`, `FilterBar` component with props `{ filters: ReportFilters; onChange: (f: ReportFilters) => void; onGenerate: () => void; ownFits: OwnFit[] }`. `ExecutiveReport` page owns filter state and passes filtered data down (later tasks fill in the sections it renders).

- [ ] **Step 1: Build FilterBar**

Create `src/components/report/FilterBar.tsx`:
```tsx
import type { Gender, OwnFit } from "../../types";

export interface ReportFilters {
  season: "26S";
  gender: Gender;
  category: "티셔츠";
  size: string;
  ownStyleId: string;
}

const DISABLED_SEASONS = ["25S", "26F", "25F"];
const DISABLED_CATEGORIES = ["아우터", "팬츠", "니트"];

interface Props {
  filters: ReportFilters;
  onChange: (filters: ReportFilters) => void;
  onGenerate: () => void;
  ownFits: OwnFit[];
}

export function FilterBar({ filters, onChange, onGenerate, ownFits }: Props) {
  const genderFits = ownFits.filter((f) => f.gender === filters.gender);
  return (
    <div className="flex flex-wrap items-end gap-4 border-b border-border pb-6 mb-8 print:hidden">
      <Field label="Season">
        <select className="report-select" value={filters.season} disabled>
          <option value="26S">26S</option>
        </select>
        {DISABLED_SEASONS.map((s) => (
          <option key={s} disabled>{s} (Coming soon)</option>
        ))}
      </Field>
      <Field label="Gender">
        <select
          className="report-select"
          value={filters.gender}
          onChange={(e) => onChange({ ...filters, gender: e.target.value as Gender, ownStyleId: "" })}
        >
          <option value="men">Men</option>
          <option value="women">Women</option>
        </select>
      </Field>
      <Field label="Category">
        <select className="report-select" value={filters.category} disabled>
          <option value="티셔츠">티셔츠</option>
        </select>
      </Field>
      <Field label="Our Brand Style">
        <select
          className="report-select"
          value={filters.ownStyleId}
          onChange={(e) => onChange({ ...filters, ownStyleId: e.target.value })}
        >
          {genderFits.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </Field>
      <button
        className="ml-auto rounded-md bg-accent text-white px-5 py-2 text-sm font-medium hover:opacity-90"
        onClick={onGenerate}
      >
        Generate AI Fit Strategy
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted text-xs uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}
```

Add to `src/index.css` (inside a `@layer components` block, after the Tailwind directives):
```css
@layer components {
  .report-select {
    @apply border border-border rounded-md px-2 py-1.5 bg-surface text-ink text-sm;
  }
}
```

- [ ] **Step 2: Build the page shell with filter state**

Create `src/pages/ExecutiveReport.tsx`:
```tsx
import { useMemo, useState } from "react";
import { FilterBar, type ReportFilters } from "../components/report/FilterBar";
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

  return (
    <div className="max-w-[1440px] mx-auto px-10 py-8">
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onGenerate={() => setGeneration((g) => g + 1)}
        ownFits={ownFits}
      />
      <div data-generation={generation}>
        {ownFit ? (
          <p className="text-muted text-sm">
            Loaded: {ownFit.name} vs {filteredMarket.length} competitor styles,
            {filteredPlmSpecs.length} own PLM records.
          </p>
        ) : (
          <p className="text-muted text-sm">Select an own brand style to begin.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire into App**

Replace `src/App.tsx`:
```tsx
import { ExecutiveReport } from "./pages/ExecutiveReport";

export default function App() {
  return <ExecutiveReport />;
}
```

- [ ] **Step 4: Type-check and visually verify**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run dev`, open `http://localhost:5175/`. Expected: filter bar renders with Season/Category disabled-looking (single option), Gender/Our Brand Style switchable, a status line below showing counts that change when Gender is switched. Stop the server after confirming.

- [ ] **Step 5: Commit**

```bash
git add src/components/report/FilterBar.tsx src/pages/ExecutiveReport.tsx src/App.tsx src/index.css
git commit -m "$(cat <<'EOF'
Add filter bar and report page shell wired to real data

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JZLSrwrHMDw24iAhz13fv5
EOF
)"
```

---

### Task 8: Executive Conclusion section (A)

**Files:**
- Create: `src/components/report/ExecutiveConclusion.tsx`
- Modify: `src/pages/ExecutiveReport.tsx`

**Interfaces:**
- Consumes: `mockAiAdapter`, `AIStrategyResult` from Task 6; `ReportFilters` from Task 7.
- Produces: `ExecutiveConclusion` component with props `{ result: AIStrategyResult; filters: ReportFilters; brandCount: number }`. Consumed directly by the page; no other section depends on this component.

- [ ] **Step 1: Build the component**

Create `src/components/report/ExecutiveConclusion.tsx`:
```tsx
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
```

- [ ] **Step 2: Wire into the page**

Modify `src/pages/ExecutiveReport.tsx` — add imports and, inside the render (replacing the temporary status paragraph from Task 7), compute and render the result:

```tsx
import { useEffect, useState } from "react";
import { mockAiAdapter, type AIStrategyResult } from "../services/aiAnalysis";
import { ExecutiveConclusion } from "../components/report/ExecutiveConclusion";
```

Add state and effect inside `ExecutiveReport`:
```tsx
const [result, setResult] = useState<AIStrategyResult | null>(null);

useEffect(() => {
  if (!ownFit) {
    setResult(null);
    return;
  }
  mockAiAdapter
    .analyze({ ownFit, ownPlmSpecs: filteredPlmSpecs, market: filteredMarket })
    .then(setResult);
}, [ownFit, filteredPlmSpecs, filteredMarket, generation]);
```

Replace the status `<div data-generation={generation}>...</div>` block with:
```tsx
<div data-generation={generation}>
  {ownFit && result ? (
    <ExecutiveConclusion result={result} filters={filters} brandCount={new Set(filteredMarket.map((m) => m.brand)).size} />
  ) : (
    <p className="text-muted text-sm">Select an own brand style to begin.</p>
  )}
</div>
```

- [ ] **Step 3: Type-check and visually verify**

Run: `npx tsc --noEmit` — expected no errors.
Run: `npm run dev`, open `http://localhost:5175/`. Expected: a bold headline sentence with real chest-spec numbers, three chips below it, meta line showing "26S · Men · 티셔츠 · N brands analyzed". Switch Gender and confirm the sentence's numbers change. Stop the server after confirming.

- [ ] **Step 4: Commit**

```bash
git add src/components/report/ExecutiveConclusion.tsx src/pages/ExecutiveReport.tsx
git commit -m "$(cat <<'EOF'
Add Executive Conclusion section (A) wired to mock AI adapter

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JZLSrwrHMDw24iAhz13fv5
EOF
)"
```

---

### Task 9: Fit and Length donut charts

**Files:**
- Create: `src/components/charts/FitDonutChart.tsx`
- Create: `src/components/charts/LengthDonutChart.tsx`

**Interfaces:**
- Consumes: `fitDistribution`, `lengthDistribution` from `src/utils/analytics.ts`; `MarketEntry` type.
- Produces: `FitDonutChart` with props `{ entries: { fitRaw: string | null }[] }`, `LengthDonutChart` with props `{ entries: { spec: PomSpec }[] }`. Consumed by Task 10.

- [ ] **Step 1: Build FitDonutChart**

Create `src/components/charts/FitDonutChart.tsx`:
```tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { fitDistribution } from "../../utils/analytics";

const COLORS = ["#B5502C", "#B3B0A8", "#D8D4C9", "#8A8880", "#E4E2DC", "#6B6B66"];

interface Props {
  entries: { fitRaw: string | null }[];
}

export function FitDonutChart({ entries }: Props) {
  const dist = fitDistribution(entries);
  const data = Object.entries(dist).map(([name, value]) => ({ name, value }));
  return (
    <div className="h-64">
      <p className="text-xs uppercase tracking-wide text-muted mb-2">Fit 구성 비율 (경쟁사)</p>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number, n: string) => [`${v}건`, n]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Build LengthDonutChart**

Create `src/components/charts/LengthDonutChart.tsx`:
```tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { lengthDistribution } from "../../utils/analytics";
import type { PomSpec } from "../../types";

const COLORS = ["#B5502C", "#B3B0A8", "#D8D4C9"];
const LABELS: Record<string, string> = { crop: "Crop", standard: "Standard", long: "Long" };

interface Props {
  entries: { spec: PomSpec }[];
}

export function LengthDonutChart({ entries }: Props) {
  const dist = lengthDistribution(entries);
  const data = (["crop", "standard", "long"] as const).map((k) => ({ name: LABELS[k], value: dist[k] }));
  return (
    <div className="h-64">
      <p className="text-xs uppercase tracking-wide text-muted mb-2">Length 구성 비율 (경쟁사, 데이터 내 3분위 기준)</p>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number, n: string) => [`${v}건`, n]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors (components have no consumers yet, so this only checks syntax/types).

- [ ] **Step 4: Commit**

```bash
git add src/components/charts/FitDonutChart.tsx src/components/charts/LengthDonutChart.tsx
git commit -m "$(cat <<'EOF'
Add Fit and Length donut chart components

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JZLSrwrHMDw24iAhz13fv5
EOF
)"
```

---

### Task 10: Market section (B)

**Files:**
- Create: `src/components/report/MarketSection.tsx`
- Modify: `src/pages/ExecutiveReport.tsx`

**Interfaces:**
- Consumes: `FitDonutChart`, `LengthDonutChart` (Task 9); `seasonDelta`, `fieldStats` (Task 4/5); `AIStrategyResult.marketSummary` (Task 6); `MarketEntry`, `PlmSpec` types.
- Produces: `MarketSection` component with props `{ market: MarketEntry[]; plmSpecs: PlmSpec[]; marketSummary: string }`.

- [ ] **Step 1: Build the component**

Create `src/components/report/MarketSection.tsx`:
```tsx
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
            자사 스펙 변화 (25S → 26S)
          </p>
          {chestDelta && lengthDelta ? (
            <ul className="text-sm space-y-1">
              <li>Chest: {chestDelta.from25S}cm → {chestDelta.to26S}cm ({chestDelta.delta > 0 ? "+" : ""}{chestDelta.delta}cm)</li>
              <li>Body Length: {lengthDelta.from25S}cm → {lengthDelta.to26S}cm ({lengthDelta.delta > 0 ? "+" : ""}{lengthDelta.delta}cm)</li>
            </ul>
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
```

- [ ] **Step 2: Wire into the page**

In `src/pages/ExecutiveReport.tsx`, add import `import { MarketSection } from "../components/report/MarketSection";` and render it right after `ExecutiveConclusion` inside the `ownFit && result` branch:
```tsx
<MarketSection market={filteredMarket} plmSpecs={filteredPlmSpecs} marketSummary={result.marketSummary} />
```

- [ ] **Step 3: Type-check and visually verify**

Run: `npx tsc --noEmit` — expected no errors.
Run: `npm run dev`. Expected: Market section renders two donut charts with real competitor counts and a season-delta list with real 25S→26S numbers, plus the AI summary sentence. Stop server after confirming.

- [ ] **Step 4: Commit**

```bash
git add src/components/report/MarketSection.tsx src/pages/ExecutiveReport.tsx
git commit -m "$(cat <<'EOF'
Add Market section (B) with real fit/length distribution and season delta

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JZLSrwrHMDw24iAhz13fv5
EOF
)"
```

---

### Task 11: Position scatter chart

**Files:**
- Create: `src/components/charts/PositionScatterChart.tsx`

**Interfaces:**
- Consumes: `marketCoreBand`, `nearestCompetitor` from `src/utils/analytics.ts`; `OwnFit`, `MarketEntry` types.
- Produces: `PositionScatterChart` with props `{ ownFit: OwnFit; market: MarketEntry[] }`. Consumed by Task 12.

- [ ] **Step 1: Build the component**

Create `src/components/charts/PositionScatterChart.tsx`:
```tsx
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer,
  ReferenceArea, Cell,
} from "recharts";
import { marketCoreBand, nearestCompetitor } from "../../utils/analytics";
import type { OwnFit, MarketEntry } from "../../types";

interface Props {
  ownFit: OwnFit;
  market: MarketEntry[];
}

export function PositionScatterChart({ ownFit, market }: Props) {
  const band = marketCoreBand(market, "chest", "frontLength");
  const nearest = nearestCompetitor(ownFit, market, "chest", "frontLength");
  const marketPoints = market
    .filter((m) => typeof m.spec.chest === "number" && typeof m.spec.frontLength === "number")
    .map((m) => ({ x: m.spec.chest!, y: m.spec.frontLength!, label: `${m.brand} ${m.style}`, isNearest: m.id === nearest?.id }));
  const ownPoint = ownFit.spec.chest != null && ownFit.spec.frontLength != null
    ? [{ x: ownFit.spec.chest, y: ownFit.spec.frontLength, label: ownFit.name }]
    : [];

  return (
    <div className="h-96">
      <p className="text-xs uppercase tracking-wide text-muted mb-2">Chest × Body Length Position (cm)</p>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
          <XAxis type="number" dataKey="x" name="Chest" unit="cm" domain={["dataMin - 5", "dataMax + 5"]} />
          <YAxis type="number" dataKey="y" name="Body Length" unit="cm" domain={["dataMin - 5", "dataMax + 5"]} />
          <ZAxis range={[80, 80]} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(v: number) => `${v}cm`} labelFormatter={() => ""} />
          {band && (
            <ReferenceArea
              x1={band.xMin} x2={band.xMax} y1={band.yMin} y2={band.yMax}
              fill="#E4E2DC" fillOpacity={0.5} stroke="none"
              label={{ value: "Market Core", position: "insideTopLeft", fill: "#6B6B66", fontSize: 11 }}
            />
          )}
          <Scatter name="Competitors" data={marketPoints} fill="#B3B0A8">
            {marketPoints.map((p, i) => (
              <Cell key={i} fill={p.isNearest ? "#8A8880" : "#B3B0A8"} />
            ))}
          </Scatter>
          <Scatter name={ownFit.name} data={ownPoint} fill="#B5502C" shape="star" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/charts/PositionScatterChart.tsx
git commit -m "$(cat <<'EOF'
Add Chest x Body Length position scatter chart

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JZLSrwrHMDw24iAhz13fv5
EOF
)"
```

---

### Task 12: Position section (C)

**Files:**
- Create: `src/components/report/PositionSection.tsx`
- Modify: `src/pages/ExecutiveReport.tsx`

**Interfaces:**
- Consumes: `PositionScatterChart` (Task 11); `fieldStats`, `positionDeviation`, `nearestCompetitor` (Task 4/5); `AIStrategyResult.positionDiagnosis` (Task 6).
- Produces: `PositionSection` component with props `{ ownFit: OwnFit; market: MarketEntry[]; positionDiagnosis: string }`.

- [ ] **Step 1: Build the component**

Create `src/components/report/PositionSection.tsx`:
```tsx
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
```

- [ ] **Step 2: Wire into the page**

In `src/pages/ExecutiveReport.tsx`, import `PositionSection` and render after `MarketSection`:
```tsx
<PositionSection ownFit={ownFit} market={filteredMarket} positionDiagnosis={result.positionDiagnosis} />
```

- [ ] **Step 3: Type-check and visually verify**

Run: `npx tsc --noEmit` — expected no errors.
Run: `npm run dev`. Expected: scatter chart with gray competitor dots, one accent-colored star for our brand, a shaded market-core rectangle, and the two stat readouts + diagnosis text on the right. Stop server after confirming.

- [ ] **Step 4: Commit**

```bash
git add src/components/report/PositionSection.tsx src/pages/ExecutiveReport.tsx
git commit -m "$(cat <<'EOF'
Add Position section (C) with scatter map and deviation stats

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JZLSrwrHMDw24iAhz13fv5
EOF
)"
```

---

### Task 13: Diagnosis section (D)

**Files:**
- Create: `src/components/report/DiagnosisSection.tsx`
- Modify: `src/pages/ExecutiveReport.tsx`

**Interfaces:**
- Consumes: `AIStrategyResult.diagnosis` (Task 6, `{ strength, gap, opportunity }`, each `DiagnosisItem`).
- Produces: `DiagnosisSection` component with props `{ diagnosis: AIStrategyResult["diagnosis"] }`.

- [ ] **Step 1: Build the component**

Create `src/components/report/DiagnosisSection.tsx`:
```tsx
import type { AIStrategyResult } from "../../services/aiAnalysis";
import { SectionHeading } from "./MarketSection";

interface Props {
  diagnosis: AIStrategyResult["diagnosis"];
}

const ORDER: (keyof Props["diagnosis"])[] = ["strength", "gap", "opportunity"];
const LABELS: Record<string, string> = { strength: "Strength", gap: "Gap", opportunity: "Opportunity" };

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
```

- [ ] **Step 2: Wire into the page**

In `src/pages/ExecutiveReport.tsx`, import `DiagnosisSection` and render after `PositionSection`:
```tsx
<DiagnosisSection diagnosis={result.diagnosis} />
```

- [ ] **Step 3: Type-check and visually verify**

Run: `npx tsc --noEmit` — expected no errors.
Run: `npm run dev`. Expected: exactly 3 cards side by side, each with title/body/evidence line. Stop server after confirming.

- [ ] **Step 4: Commit**

```bash
git add src/components/report/DiagnosisSection.tsx src/pages/ExecutiveReport.tsx
git commit -m "$(cat <<'EOF'
Add Diagnosis section (D) with Strength/Gap/Opportunity cards

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JZLSrwrHMDw24iAhz13fv5
EOF
)"
```

---

### Task 14: Recommendation section (E)

**Files:**
- Create: `src/components/report/RecommendationSection.tsx`
- Modify: `src/pages/ExecutiveReport.tsx`

**Interfaces:**
- Consumes: `AIStrategyResult.recommendations` (Task 6, `Recommendation[]`).
- Produces: `RecommendationSection` component with props `{ recommendations: Recommendation[]; ownFitName: string }`.

- [ ] **Step 1: Build the component**

Create `src/components/report/RecommendationSection.tsx`:
```tsx
import type { Recommendation } from "../../services/aiAnalysis";
import { SectionHeading } from "./MarketSection";

interface Props {
  recommendations: Recommendation[];
  ownFitName: string;
}

const CONFIDENCE_LABEL: Record<string, string> = { high: "High", medium: "Medium", low: "Low" };

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
```

- [ ] **Step 2: Wire into the page**

In `src/pages/ExecutiveReport.tsx`, import `RecommendationSection` and render after `DiagnosisSection`:
```tsx
<RecommendationSection recommendations={result.recommendations} ownFitName={ownFit.name} />
```

- [ ] **Step 3: Type-check and visually verify**

Run: `npx tsc --noEmit` — expected no errors.
Run: `npm run dev`. Expected: POM comparison table with real Current/Market Median/Recommended/Change values, reasoning lines below, and a labeled Current-vs-Recommended placeholder box (not a fabricated garment SVG). Stop server after confirming.

- [ ] **Step 4: Commit**

```bash
git add src/components/report/RecommendationSection.tsx src/pages/ExecutiveReport.tsx
git commit -m "$(cat <<'EOF'
Add Recommendation section (E) with POM table and silhouette placeholder

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JZLSrwrHMDw24iAhz13fv5
EOF
)"
```

---

### Task 15: Supporting Evidence drawer (F)

**Files:**
- Create: `src/components/evidence/EvidenceCard.tsx`
- Create: `src/components/evidence/SupportingEvidenceDrawer.tsx`
- Modify: `src/pages/ExecutiveReport.tsx`

**Interfaces:**
- Consumes: `MarketEntry` type; `nearestCompetitor` (for picking a relevant subset, Task 5).
- Produces: `EvidenceCard` with props `{ entry: MarketEntry }`; `SupportingEvidenceDrawer` with props `{ open: boolean; onClose: () => void; entries: MarketEntry[] }`.

- [ ] **Step 1: Build EvidenceCard**

Create `src/components/evidence/EvidenceCard.tsx`:
```tsx
import type { MarketEntry } from "../../types";

const DATA_TYPE_LABEL: Record<string, string> = {
  actual_measurement: "Actual Measurement",
  official_spec: "Official Spec",
  ai_estimate: "AI Estimate",
};

export function EvidenceCard({ entry }: { entry: MarketEntry }) {
  return (
    <div className="border border-border rounded-lg p-4 flex gap-4">
      {entry.imagePath && (
        <img
          src={`/evidence/${entry.imagePath.split("/").pop()}`}
          alt={`${entry.brand} ${entry.style}`}
          className="w-20 h-20 object-cover rounded"
        />
      )}
      <div className="text-sm flex-1">
        <p className="font-medium text-ink">{entry.brand} — {entry.style}</p>
        <p className="text-muted text-xs mb-2">
          {entry.fitRaw?.trim() || "Unlabeled"} · {DATA_TYPE_LABEL[entry.dataType]}
        </p>
        <p className="text-xs text-ink">
          Chest {entry.spec.chest ?? "N/A"}cm · Length {entry.spec.frontLength ?? "N/A"}cm
        </p>
        {entry.sourceUrl && (
          <a href={entry.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-accent underline">
            제품 링크
          </a>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build SupportingEvidenceDrawer**

Create `src/components/evidence/SupportingEvidenceDrawer.tsx`:
```tsx
import { X } from "lucide-react";
import { EvidenceCard } from "./EvidenceCard";
import type { MarketEntry } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  entries: MarketEntry[];
}

export function SupportingEvidenceDrawer({ open, onClose, entries }: Props) {
  if (!open) return null;
  const shown = entries.slice(0, 5);
  return (
    <div className="fixed inset-0 z-50 flex justify-end print:hidden">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-md h-full overflow-y-auto p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">Supporting Evidence</h3>
          <button onClick={onClose} aria-label="Close">
            <X size={18} className="text-muted" />
          </button>
        </div>
        <div className="space-y-4">
          {shown.map((entry) => (
            <EvidenceCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire the trigger into the page**

In `src/pages/ExecutiveReport.tsx`:
- Import `SupportingEvidenceDrawer` and `useState` (already imported).
- Add state: `const [evidenceOpen, setEvidenceOpen] = useState(false);`
- After `RecommendationSection`, add:
```tsx
<div className="mb-16 print:hidden">
  <button
    className="text-sm font-medium text-accent underline"
    onClick={() => setEvidenceOpen(true)}
  >
    View Supporting Data
  </button>
</div>
<SupportingEvidenceDrawer open={evidenceOpen} onClose={() => setEvidenceOpen(false)} entries={filteredMarket} />
```

- [ ] **Step 4: Type-check and visually verify**

Run: `npx tsc --noEmit` — expected no errors.
Run: `npm run dev`. Click "View Supporting Data" — expected a right-side drawer listing up to 5 competitor entries with images (from `/evidence/...`), brand/style, fit label, data-type badge, key specs, and a working source link. Close via the X or backdrop click. Stop server after confirming.

- [ ] **Step 5: Commit**

```bash
git add src/components/evidence src/pages/ExecutiveReport.tsx
git commit -m "$(cat <<'EOF'
Add Supporting Evidence drawer (F) with real competitor product data

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JZLSrwrHMDw24iAhz13fv5
EOF
)"
```

---

### Task 16: Print styles

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes: existing `print:hidden` Tailwind utility already applied in Tasks 7/15 to the filter bar and evidence drawer/trigger.
- Produces: no new component interfaces — purely CSS.

- [ ] **Step 1: Add print rules**

Append to `src/index.css`:
```css
@media print {
  body {
    background: #FFFFFF;
  }
  section {
    break-inside: avoid;
  }
  table, .border {
    break-inside: avoid;
  }
  a[href]::after {
    content: "";
  }
}
```

- [ ] **Step 2: Verify print layout**

Run: `npm run dev`, open `http://localhost:5175/`, open the browser's print preview (Ctrl+P). Expected: filter bar and "View Supporting Data" button are hidden, background is white, section cards/tables don't split awkwardly across page boundaries. Close print preview, stop server.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "$(cat <<'EOF'
Add print CSS so the report survives PDF/print export

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JZLSrwrHMDw24iAhz13fv5
EOF
)"
```

---

### Task 17: Project CLAUDE.md and final verification

**Files:**
- Create: `CLAUDE.md`
- Create: `README.md` (brief — how to run `npm run dev`, how to re-run the export script)

**Interfaces:**
- None — documentation only.

- [ ] **Step 1: Write CLAUDE.md**

Create `CLAUDE.md`:
```markdown
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
- 타입체크: `npx tsc --noEmit`
- 데이터 재생성: `C:\Users\AC1218\Desktop\DCS\.venv\Scripts\python.exe scripts/export_snapshot.py`
```

- [ ] **Step 2: Write README.md**

Create `README.md`:
```markdown
# AI Fit Strategy Dashboard

Executive Report dashboard diagnosing our fit position vs. competitors and
recommending next-season fit direction.

## Run

```bash
npm install
npm run dev
```
Open http://localhost:5175/

## Re-export data snapshot

```bash
C:\Users\AC1218\Desktop\DCS\.venv\Scripts\python.exe scripts/export_snapshot.py
```

## Test / typecheck

```bash
npm run test
npx tsc --noEmit
```
```

- [ ] **Step 3: Final full verification**

Run in order:
```bash
npx tsc --noEmit
npm run test
npm run build
```
Expected: all three succeed with zero errors. `npm run build` produces `dist/`.

Run: `npm run dev`, open `http://localhost:5175/`, walk through the full page top to bottom (A–F), switch Gender, click Generate, open and close the Supporting Evidence drawer, check print preview once more. Confirm no console errors. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "$(cat <<'EOF'
Add project CLAUDE.md and README; Phase 1 complete

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JZLSrwrHMDw24iAhz13fv5
EOF
)"
```

---

## Self-Review Notes

- **Spec coverage:** §A–F all have a dedicated task (8, 10, 12, 13, 14, 15). Filters (§5) → Task 7. Data/AI separation (§6) → Tasks 4/5/6. Design system (§7) → Task 1/6/16. Print CSS → Task 16. Isolation/no-touch-existing (§0 of spec) → enforced by Task 1's separate folder+repo and Task 2's read-only export.
- **Known gap carried forward (not a placeholder — a real data limitation documented in the spec and in this project's own CLAUDE.md):** `market_entries` has no season column populated, so true market-wide season-over-season trend is not computable from real data in Phase 1. This is the single item to flag to the user as "다음에 필요한 데이터" in the final report.
- **Type consistency checked:** `PomSpec`/`OwnFit`/`PlmSpec`/`MarketEntry` (Task 3) are used identically across Tasks 4–15 with no renamed fields. `AIStrategyResult`/`Recommendation`/`DiagnosisItem` (Task 6) property names match their usage in Tasks 8/13/14 exactly (`executiveConclusion`, `marketShift`, `ourPosition`, `nextAction`, `marketSummary`, `positionDiagnosis`, `diagnosis.{strength,gap,opportunity}`, `recommendations[].{pom,current,marketMedian,recommended,change,changeReason,referenceStyles,confidence}`).
- **No placeholders:** every step has literal code, not descriptions of code.

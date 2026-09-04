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
          {DISABLED_SEASONS.map((s) => (
            <option key={s} disabled>{s} (Coming soon)</option>
          ))}
        </select>
      </Field>
      <Field label="Gender">
        <select
          className="report-select"
          value={filters.gender}
          onChange={(e) => {
            const nextGender = e.target.value as Gender;
            const nextFit = ownFits.find((f) => f.gender === nextGender);
            onChange({ ...filters, gender: nextGender, ownStyleId: nextFit?.id ?? "" });
          }}
        >
          <option value="men">Men</option>
          <option value="women">Women</option>
        </select>
      </Field>
      <Field label="Category">
        <select className="report-select" value={filters.category} disabled>
          <option value="티셔츠">티셔츠</option>
          {DISABLED_CATEGORIES.map((c) => (
            <option key={c} disabled>{c} (Coming soon)</option>
          ))}
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

import type { MarketEntry, DataType } from "../../types";

const DATA_TYPE_LABEL: Record<DataType, string> = {
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

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

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
          <Tooltip formatter={(v, n) => [`${v}건`, n]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

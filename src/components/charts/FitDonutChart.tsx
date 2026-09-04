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
          <Tooltip formatter={(v, n) => [`${v}건`, n]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

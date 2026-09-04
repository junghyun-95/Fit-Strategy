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

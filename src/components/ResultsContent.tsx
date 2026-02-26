import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SimParams, SimResult } from "../types";
import { Card } from "./Card";
import { StatCard } from "./StatCard";

interface ResultsContentProps {
  result: SimResult;
  params: SimParams;
}

export function ResultsContent({ result, params }: ResultsContentProps) {
  const plural = result.years === 1 ? "year" : "years";

  let endReasonText = "";
  let endReasonExplanation = "";
  if (result.endReason === "everyone_reached") {
    endReasonText = "🎉 Everyone Reached!";
    endReasonExplanation =
      "Your influence rippled through the entire network. Every single person was reached!";
  } else if (result.endReason === "network_saturation") {
    endReasonText = "⛓️ Network Saturation";
    endReasonExplanation = `All reachable connections have been influenced. The people you reached have no remaining un-influenced friends to spread to. This happens because communities are tightly connected internally (${(params.withinRatio * 100).toFixed(0)}% of relationships), with only about ${((1 - params.withinRatio) * 100).toFixed(0)}% of people acting as bridges between groups.`;
  } else {
    endReasonText = "⏰ Time Limit Reached";
    endReasonExplanation =
      'The simulation reached its maximum duration. The ripple is still spreading, but we stopped the simulation here. You can try increasing the "Max Simulation Years" in the advanced options to see how much further it could go!';
  }

  const chartData = result.yearlyGrowth.map((d, i) => ({
    year: `Year ${i + 1}`,
    people: d.people,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        <StatCard
          label="Simulation Duration"
          value={`${result.years} ${plural}`}
        />
        <StatCard
          label="People Reached"
          value={result.peopleReached.toLocaleString()}
        />
        <StatCard
          label="Percentage of Network"
          value={`${result.percentage}%`}
        />
      </div>

      <Card>
        <div className="text-gray-600 uppercase tracking-wide">
          Simulation End Reason
        </div>
        <div className="text-lg text-gray-700 font-semibold">
          <strong>{endReasonText}</strong>
          <br />
          <p className="text-gray-600 font-normal mt-1">
            {endReasonExplanation}
          </p>
        </div>
      </Card>

      <Card>
        <div className="text-gray-600 uppercase tracking-wide mb-3">
          Growth Pattern
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v: number) => v.toLocaleString()}
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip
              formatter={(v: number | undefined) => v?.toLocaleString() ?? ""}
            />
            <Line
              type="monotone"
              dataKey="people"
              stroke="rgb(59, 84, 33)"
              strokeWidth={2}
              dot={false}
              fill="rgba(59, 84, 33, 0.2)"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

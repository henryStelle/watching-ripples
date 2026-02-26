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
import { useMemo } from "react";

interface ResultsContentProps {
  result: SimResult;
  params: SimParams;
}

export function ResultsContent({ result, params }: ResultsContentProps) {
  const plural = result.years === 1 ? "year" : "years";

  const analysisCards = useMemo(() => {
    const cards = [];

    // Calculate the reason the simulation ended, defaulting to everyone reached
    let endReasonText = "🎉 Everyone Reached!";
    let endReasonExplanation =
      "Your influence rippled through the entire network. Every single person was reached!";
    if (result.endReason === "network_saturation") {
      endReasonText = "⛓️ Network Saturation";
      endReasonExplanation = `All reachable connections have been influenced. The people you reached have no remaining un-influenced friends to spread to. This happens because communities are tightly connected internally (${(params.withinRatio * 100).toFixed(0)}% of relationships), with only about ${((1 - params.withinRatio) * 100).toFixed(0)}% of relationships acting as bridges between groups.`;
    } else {
      endReasonText = "⏰ Time Limit Reached";
      endReasonExplanation =
        'The simulation reached its maximum duration. The ripple is still spreading, but we stopped the simulation here. You can try increasing the "Max Simulation Years" in the advanced options to see how much further it could go!';
    }
    cards.push({
      heading: endReasonText,
      details: endReasonExplanation,
    });

    // Check if the growth is linear, which implies the withinRatio is limiting the spread.
    // Linear growth means year-over-year increments are roughly constant.
    // We measure this via the coefficient of variation (stddev / mean) of the diffs —
    // a low CV means the increments are consistent, i.e. linear growth.
    const growthDiffs = result.yearlyGrowth
      .map(({ people }, i, arr) =>
        // ignore the first few years and wait for stabilization
        i === 0 || i < arr.length / 2
          ? null
          : people - result.yearlyGrowth[i - 1].people,
      )
      .filter((d): d is number => d !== null);

    let linear = false;
    if (growthDiffs.length >= 3) {
      const mean = growthDiffs.reduce((a, b) => a + b, 0) / growthDiffs.length;
      if (mean > 0) {
        const variance =
          growthDiffs.reduce((a, d) => a + (d - mean) ** 2, 0) /
          growthDiffs.length;
        const cv = Math.sqrt(variance) / mean;
        console.log({ cv, mean, variance });
        linear = cv < 0.1;
      }
    }

    if (linear) {
      cards.push({
        heading: "⚠️ Linear Growth Detected",
        details: `It looks like the spread of influence is growing at a constant rate. This happens when the withinRatio is limiting the spread of influence. Try slowly decreasing "Within Ratio" in the advanced options and leaving the rest of the parameters unchanged.`,
        warning: true,
      });
    }

    // check if the growth became logistic, implying the Total Population was limiting the spread
    // to do this, check if the growth rate in the last year dropped significantly compared to the previous year, which is a sign of logistic growth
    const len = result.yearlyGrowth.length;
    const growthRates = result.yearlyGrowth.map((d, i) => {
      if (i === 0) return 0;
      const last = result.yearlyGrowth[i - 1].people;
      if (last === 0) return 0;
      return (d.people - last) / last;
    });
    let logistic = false;
    if (len >= 3) {
      const lastGrowthRate = growthRates[len - 1];
      const prevGrowthRate = growthRates[len - 2];

      if (prevGrowthRate > 0.5 && lastGrowthRate < prevGrowthRate * 0.5) {
        logistic = true;
      }
    }
    if (logistic && !linear) {
      cards.push({
        heading: "⚠️ Logistic Growth Detected",
        details: `It looks like the spread of influence is slowing down in the last period, which is a common sign of logistic growth. Try experimenting with doubling the "Total Population" in the advanced options and leaving the rest of the parameters unchanged.`,
        warning: true,
      });
    }

    return cards;
  }, [result, params]);

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
        <StatCard label="% of Population" value={result.percentage} />
      </div>

      {analysisCards.map(({ heading, details, warning }) => (
        <Card key={heading}>
          <h6 className={`font-semibold ${warning ? "text-yellow-600" : ""}`}>
            {heading}
          </h6>

          <p className="text-gray-600 font-normal mt-1">{details}</p>
        </Card>
      ))}

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

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { SimResult } from "../../types";
import { YEAR_COLORS } from "../stepUtils";

interface Props {
  results: SimResult[];
  /** Optional labels for each result; falls back to `Result 1`, ... */
  labels?: string[];
  /** Optional palette matching results order */
  colors?: string[];
  height?: number;
  /** Calculate and display the slope, not value at each year */
  showGrowth?: boolean;
  defaultEnabled?: boolean[];
}

function buildSeries(results: SimResult[], showGrowth: boolean) {
  // Determine max years across all results
  const maxYears = Math.max(...results.map((r) => r.yearlyState.length));

  // For each result, build an array
  const series = results.map((r) => {
    if (showGrowth) {
      const growth = [];
      for (let i = 1; i < r.yearlyState.length; i++) {
        const current = r.yearlyState[i].influenced;
        const previous = r.yearlyState[i - 1].influenced;
        growth.push(current - previous);
      }
      return growth;
    }

    return r.yearlyState.map((s) => s.influenced);
  });

  // Build unified data points: { year: 1, v0: x, v1: y, ... }
  const data = Array.from({ length: maxYears }, (_, i) => {
    const row: Record<string, number> = { year: i + 1 };
    for (let si = 0; si < series.length; si++) {
      row[`s${si}`] = series[si][i];
    }
    return row;
  });

  return { data, maxYears };
}

export default function MultiResultLineChart({
  results,
  labels,
  colors = YEAR_COLORS,
  height = 260,
  showGrowth = false,
  defaultEnabled,
}: Props) {
  const { data } = useMemo(
    () => buildSeries(results, showGrowth),
    [results, showGrowth],
  );
  const n = results.length;
  const [visible, setVisible] = useState<boolean[]>(
    () => defaultEnabled ?? Array(n).fill(true),
  );

  function toggle(i: number) {
    setVisible((v) => {
      const copy = [...v];
      copy[i] = !copy[i];
      return copy;
    });
  }

  const intl = new Intl.NumberFormat();

  return (
    <div className="bg-white">
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 32 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              label={{
                value: "Year",
                position: "insideBottom",
                offset: -6,
                fontSize: 11,
                fill: "#9ca3af",
              }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip
              formatter={(value) =>
                typeof value === "number" ? intl.format(value) : value
              }
            />

            {results.map((_, i) => (
              <Line
                key={i}
                type="monotone"
                dataKey={`s${i}`}
                name={labels?.[i] ?? `Result ${i + 1}`}
                stroke={colors[i % colors.length]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                hide={!visible[i]}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {results.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {results.map((_r, i) => {
            const label = labels?.[i] ?? `Result ${i + 1}`;
            const color = colors[i % colors.length];
            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${
                  visible[i]
                    ? "bg-gray-100 border-gray-200"
                    : "bg-white border-transparent text-gray-400"
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: color }}
                />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

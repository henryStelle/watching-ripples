import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ResultProps } from "../types";

interface Props extends ResultProps {
  yearColors: string[];
}

interface TooltipPayload {
  value: number;
  name: string;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0);
  // Recharts lists bottom segment first; reverse so wave 1 appears at top
  const rows = [...payload].reverse().filter((p) => p.value > 0);
  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm px-3 py-2 text-xs text-gray-700 min-w-35">
      <p className="font-semibold mb-2">End of Year {label}</p>
      <p className="mb-1 text-gray-500">Total: {total}</p>
      {rows.map((p, i) => (
        <p key={i} className="flex items-center gap-1">
          <span
            className="inline-block rounded-full shrink-0"
            style={{ width: 8, height: 8, background: p.color }}
          />
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

/**
 * LinearGrowthChart
 *
 * Stacked bar chart — one bar per year, total height = cumulative people
 * reached. Each segment of the stack represents one wave year's contribution,
 * coloured to match the ring diagram. The uniform segment heights make the
 * linear growth rate immediately visible: every new year adds one more same-
 * sized layer to the stack.
 */
export function LinearGrowthChart({ result, yearColors }: Props) {
  const { yearlyState } = result;
  const numWaves = yearlyState.length;

  // How many new people arrived in each wave year (index 0 = wave year 1)
  const waveNewPeople = yearlyState.map((state, i) => {
    const prev = i === 0 ? 0 : yearlyState[i - 1].influenced;
    return state.influenced - prev;
  });

  // One row per bar (year). Each row carries every wave's contribution:
  // wave K contributes its new-people count for all bar-years >= K, else 0.
  const data = yearlyState.map((_, barIdx) => {
    const row: Record<string, number> = { year: barIdx + 1 };
    for (let wIdx = 0; wIdx < numWaves; wIdx++) {
      row[`wave${wIdx + 1}`] = wIdx <= barIdx ? waveNewPeople[wIdx] : 0;
    }
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
        barCategoryGap="20%"
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
            offset: -2,
            fontSize: 11,
            fill: "#9ca3af",
          }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
          width={32}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f3f4f6" }} />
        {Array.from({ length: numWaves }, (_, wIdx) => (
          <Bar
            key={wIdx}
            dataKey={`wave${wIdx + 1}`}
            name={`Wave ${wIdx + 1}`}
            stackId="total"
            fill={yearColors[wIdx + 1] ?? yearColors[yearColors.length - 1]}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

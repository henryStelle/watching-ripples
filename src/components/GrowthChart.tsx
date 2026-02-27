import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GrowthChartProps {
  data: { year: string; people: number }[];
}

export default function GrowthChart({ data }: GrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
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
  );
}

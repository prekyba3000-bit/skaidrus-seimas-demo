import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";

interface VotingTrendChartProps {
  data: Array<{
    name: string;
    for: number;
    against: number;
    abstain: number;
  }>;
}

// Custom tooltip with glassmorphism styling
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      for: number;
      against: number;
      abstain: number;
    };
    name: string;
    value: number;
    color: string;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1b2a38] backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-white font-semibold mb-2">
          {payload[0].payload.name}
        </p>
        {payload.map((entry, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function VotingTrendChart({ data }: VotingTrendChartProps) {
  return (
    <Card className="bg-surface-dark border-surface-border p-4 md:p-6">
      <h3 className="text-white text-lg font-bold mb-4">
        Balsavimo Tendencjos
      </h3>
      <div className="h-64 md:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} stackOffset="sign">
            <CartesianGrid strokeDasharray="3 3" stroke="#233648" />
            <XAxis
              dataKey="name"
              stroke="#92adc9"
              tick={{ fill: "#92adc9", fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="#92adc9" tick={{ fill: "#92adc9", fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="for" stackId="a" fill="#10b981" name="Už" />
            <Bar dataKey="against" stackId="a" fill="#ef4444" name="Prieš" />
            <Bar
              dataKey="abstain"
              stackId="a"
              fill="#6b7280"
              name="Susilaikė"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

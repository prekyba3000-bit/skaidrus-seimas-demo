import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

interface SessionHeatmapProps {
  data: Array<{
    date: string;
    sessionCount: number;
    attendanceRate: number;
  }>;
}

// Custom tooltip with glassmorphism styling
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      date: string;
      sessionCount: number;
      attendanceRate: number;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1b2a38] backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-white font-semibold mb-2">{data.date}</p>
        <p className="text-sm text-[#92adc9]">
          Sesijų skaičius: <span className="text-white font-bold">{data.sessionCount}</span>
        </p>
        <p className="text-sm text-[#92adc9]">
          Lankomumas: <span className="text-white font-bold">{data.attendanceRate.toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export function SessionHeatmap({ data }: SessionHeatmapProps) {
  return (
    <Card className="bg-surface-dark border-surface-border p-4 md:p-6">
      <h3 className="text-white text-lg font-bold mb-4">Seimo Sesijų Aktyvumas</h3>
      <div className="h-64 md:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#233648" />
            <XAxis 
              dataKey="date" 
              stroke="#92adc9"
              tick={{ fill: '#92adc9', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="#92adc9" tick={{ fill: '#92adc9', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sessionCount" fill="#3b82f6" name="Sesijų skaičius" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

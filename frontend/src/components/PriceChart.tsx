import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export interface PricePoint {
  timestamp: string;
  yesPrice: number;
  noPrice: number;
}

interface ChartRow {
  time: string;
  yes: number;
}

function formatTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface TooltipEntry {
  value?: number;
}
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-gray-200 bg-white px-3 py-2 text-xs shadow dark:border-dark-border dark:bg-dark-card">
      <p className="font-semibold text-classhi-green">{payload[0]?.value}%</p>
      <p className="text-gray-400 dark:text-[#8A8A90]">{label}</p>
    </div>
  );
}

interface PriceChartProps {
  data: PricePoint[];
  currentYesPrice: number;
}

export function PriceChart({ data, currentYesPrice }: PriceChartProps) {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const handler = () =>
      setIsDark(document.documentElement.classList.contains('dark'));
    window.addEventListener('themechange', handler);
    return () => window.removeEventListener('themechange', handler);
  }, []);

  const chartData: ChartRow[] = data.map((p) => ({
    time: formatTime(p.timestamp),
    yes: p.yesPrice,
  }));

  const gridColor = isDark ? '#2a2a2e' : '#E5E7EB';
  const tickColor = isDark ? '#8A8A90' : '#9CA3AF';

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5 dark:border-dark-border dark:bg-dark-card">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-[#111111] dark:text-white">Chance</span>
        <span className="text-2xl font-bold text-classhi-green">{currentYesPrice}%</span>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-gray-400 dark:text-[#8A8A90]">
          No price history yet — place the first bet!
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="yesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00A86B" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00A86B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: tickColor }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 11, fill: tickColor }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="yes"
              stroke="#00A86B"
              strokeWidth={2}
              fill="url(#yesGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#00A86B', strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

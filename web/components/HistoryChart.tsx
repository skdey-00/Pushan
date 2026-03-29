'use client';

import { TrafficEvent } from '@/lib/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface HistoryChartProps {
  events: TrafficEvent[];
}

export default function HistoryChart({ events }: HistoryChartProps) {
  // Prepare data for chart - take last 20 events
  const chartData = events
    .slice(0, 20)
    .reverse()
    .map((event) => {
      const dateStr = event.timestamp || event.created_at;
      return {
        time: dateStr ? new Date(dateStr).toLocaleTimeString() : '--:--',
        score: event.traffic_score ?? 0,
        cars: event.car_count ?? 0,
        queue: event.queue_level ?? 0,
      };
    });

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Traffic Score History</h2>

      {chartData.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No events recorded yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="#94a3b8"
              label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#3B82F6"
              strokeWidth={2}
              name="Traffic Score"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="cars"
              stroke="#10B981"
              strokeWidth={2}
              name="Car Count"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="queue"
              stroke="#F59E0B"
              strokeWidth={2}
              name="Queue Level"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

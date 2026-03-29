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
    .map((event) => ({
      time: new Date(event.created_at).toLocaleTimeString(),
      score: event.traffic_score,
      cars: event.car_count,
      queue: event.queue_level,
    }));

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Traffic Score History</h2>

      {chartData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No events recorded yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
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

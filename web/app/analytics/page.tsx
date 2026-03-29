'use client';

import React, { useEffect, useState } from 'react';
import { fetchRecentEvents } from '@/lib/api';
import { TrafficEvent } from '@/lib/types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Clock, Activity, AlertTriangle } from 'lucide-react';

export default function AnalyticsPage() {
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const limit = timeRange === '24h' ? 100 : timeRange === '7d' ? 500 : 2000;
      const data = await fetchRecentEvents(limit);
      setEvents(data);
      setLoading(false);
    };

    loadData();
  }, [timeRange]);

  // Process data for charts
  const hourlyData = (() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      score: 0,
      vehicles: 0,
      count: 0,
    }));

    events.forEach((event) => {
      const hour = new Date(event.created_at).getHours();
      hours[hour].score += event.traffic_score;
      hours[hour].vehicles += event.car_count;
      hours[hour].count += 1;
    });

    return hours.map((h) => ({
      hour: h.hour,
      avgScore: h.count ? Number((h.score / h.count).toFixed(1)) : 0,
      avgVehicles: h.count ? Math.round(h.vehicles / h.count) : 0,
    }));
  })();

  const signalDistribution = (() => {
    const dist = { RED: 0, YELLOW: 0, GREEN: 0 };
    events.forEach((e) => {
      if (e.signal in dist) dist[e.signal as keyof typeof dist]++;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  })();

  const queueDistribution = (() => {
    const ranges = [
      { name: '0-2 (Light)', min: 0, max: 2, count: 0 },
      { name: '3-4 (Moderate)', min: 3, max: 4, count: 0 },
      { name: '5-6 (Heavy)', min: 5, max: 6, count: 0 },
    ];
    events.forEach((e) => {
      const range = ranges.find((r) => e.queue_level >= r.min && e.queue_level <= r.max);
      if (range) range.count++;
    });
    return ranges;
  })();

  const stats = {
    totalEvents: events.length,
    avgScore: events.length
      ? Number((events.reduce((sum, e) => sum + e.traffic_score, 0) / events.length).toFixed(1))
      : 0,
    overrideCount: events.filter((e) => e.is_override).length,
    peakHour: hourlyData.reduce((max, h) =>
      h.avgScore > max.avgScore ? h : max, hourlyData[0] || { hour: 'N/A', avgScore: 0, avgVehicles: 0 }
    ),
  };

  const COLORS = ['#ef4444', '#eab308', '#22c55e'];
  const QUEUE_COLORS = ['#22c55e', '#eab308', '#ef4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">📊 Analytics Dashboard</h1>
              <p className="text-slate-400 mt-1">Detailed traffic analysis and insights</p>
            </div>
            <div className="flex gap-2">
              {(['24h', '7d', '30d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    timeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Events</p>
                <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Avg Score</p>
                <p className="text-2xl font-bold text-white">{stats.avgScore}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Overrides</p>
                <p className="text-2xl font-bold text-white">{stats.overrideCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Peak Hour</p>
                <p className="text-2xl font-bold text-white">{stats.peakHour.hour}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Score Over Time */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Traffic Score by Hour</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hour" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Vehicle Count by Hour */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Vehicle Count by Hour</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hour" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                />
                <Legend />
                <Bar dataKey="avgVehicles" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Signal Distribution */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Signal Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={signalDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {signalDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Queue Level Distribution */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Queue Level Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={queueDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {queueDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={QUEUE_COLORS[index % QUEUE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import LiveFeed from '@/components/LiveFeed';
import TrafficState from '@/components/TrafficState';
import TrafficSignal from '@/components/TrafficSignal';
import OverridePanel from '@/components/OverridePanel';
import HistoryChart from '@/components/HistoryChart';
import HistoryTable from '@/components/HistoryTable';
import AlertBanner from '@/components/AlertBanner';
import SystemHealth from '@/components/SystemHealth';
import MetricsCard from '@/components/MetricsCard';
import { SystemState, TrafficEvent } from '@/lib/types';
import { fetchRecentEvents, fetchSystemState } from '@/lib/api';
import { Activity, Users, Gauge, TrendingUp, Clock } from 'lucide-react';

export default function Home() {
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [tunnelUrl, setTunnelUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fetch initial system state
  useEffect(() => {
    const fetchState = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL;
        if (!apiUrl) {
          console.warn('Flask API URL not configured');
          setLoading(false);
          return;
        }
        const response = await fetch(`${apiUrl}/status`);
        if (response.ok) {
          const state = await response.json();
          setSystemState(state);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching state:', error);
        setLoading(false);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fetch tunnel URL from system state (via Flask API)
  useEffect(() => {
    const fetchTunnelUrl = async () => {
      try {
        const state = await fetchSystemState();
        if (state.tunnel_url) {
          setTunnelUrl(state.tunnel_url);
        }
      } catch (error) {
        console.error('Error fetching tunnel URL:', error);
      }
    };

    fetchTunnelUrl();
    const interval = setInterval(fetchTunnelUrl, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // Fetch initial events
  useEffect(() => {
    const fetchEvents = async () => {
      const data = await fetchRecentEvents(50);
      setEvents(data);
    };

    fetchEvents();

    // Subscribe to new events via WebSocket (optional, falls back gracefully)
    let ws: WebSocket | null = null;
    try {
      const wsUrl = process.env.NEXT_PUBLIC_FLASK_API_URL?.replace('http://', 'ws://').replace('https://', 'wss://');
      if (wsUrl) {
        ws = new WebSocket(`${wsUrl}/ws`);

        ws.onopen = () => {
          console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
          try {
            const newEvent = JSON.parse(event.data);
            setEvents((prev) => [newEvent, ...prev].slice(0, 50));
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
        };
      }
    } catch (error) {
      console.error('WebSocket initialization failed:', error);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Calculate metrics from events
  const todayEvents = events.filter((e) => {
    const eventDate = new Date(e.created_at).toDateString();
    const today = new Date().toDateString();
    return eventDate === today;
  });

  const avgQueueLevel =
    todayEvents.length > 0
      ? (todayEvents.reduce((sum, e) => sum + e.queue_level, 0) / todayEvents.length).toFixed(1)
      : '0.0';

  const peakScore = todayEvents.length > 0
    ? Math.max(...todayEvents.map((e) => e.traffic_score))
    : 0;

  const lastUpdate = systemState?.last_update
    ? `${Math.floor((Date.now() - new Date(systemState.last_update).getTime()) / 1000 / 60)}m ago`
    : 'Never';

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">🚦 Traffic Command Center</h1>
              <p className="text-slate-400 mt-1">Real-time adaptive traffic signal management</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/analytics"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Analytics
              </Link>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        {systemState && systemState.traffic_score >= 12 && (
          <AlertBanner score={systemState.traffic_score} />
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricsCard
            icon={Users}
            title="Vehicles Today"
            value={todayEvents.reduce((sum, e) => sum + e.car_count, 0)}
            color="blue"
          />
          <MetricsCard
            icon={Gauge}
            title="Avg Queue Level"
            value={avgQueueLevel}
            unit="/6"
            color="yellow"
          />
          <MetricsCard
            icon={Activity}
            title="Peak Score"
            value={peakScore.toFixed(1)}
            color="red"
          />
          <MetricsCard
            icon={TrendingUp}
            title="Signals Changed"
            value={todayEvents.length}
            color="green"
          />
          <MetricsCard
            icon={Clock}
            title="Last Update"
            value={lastUpdate}
            color="gray"
          />
        </div>

        {/* Top Row: Live Feed + Traffic Signal + System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <LiveFeed tunnelUrl={tunnelUrl} />
          </div>
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 h-full">
              <h2 className="text-xl font-semibold text-white mb-6">Current Signal</h2>
              {systemState ? (
                <TrafficSignal
                  signal={systemState.current_signal}
                  duration={systemState.override?.active ? systemState.override.remaining_seconds : undefined}
                />
              ) : (
                <div className="animate-pulse space-y-4">
                  <div className="h-20 bg-slate-700 rounded"></div>
                  <div className="h-8 bg-slate-700 rounded"></div>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-1">
            <SystemHealth state={systemState} />
          </div>
        </div>

        {/* Traffic State Details */}
        <TrafficState state={systemState} />

        {/* Override Panel */}
        <OverridePanel
          onOverrideSet={(data) => {
            console.log('Override set:', data);
            // Refresh system state after override
            setTimeout(() => {
              const apiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL;
              if (apiUrl) {
                fetch(`${apiUrl}/status`)
                  .then((res) => res.json())
                  .then((data) => setSystemState(data))
                  .catch((err) => console.error('Error refreshing state:', err));
              }
            }, 500);
          }}
        />

        {/* History Chart */}
        <HistoryChart events={events} />

        {/* History Table */}
        <HistoryTable events={events} />

        {/* Footer */}
        <div className="text-center text-slate-500 py-6">
          <p className="text-sm">
            Adaptive Traffic Signal System • Built with ESP32, YOLOv8, Next.js, and Supabase
          </p>
        </div>
      </div>
    </main>
  );
}

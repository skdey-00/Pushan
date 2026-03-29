'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
import { fetchRecentEvents, fetchSystemState, checkHealth, setOverride, clearOverride } from '@/lib/api';
import { Activity, Users, Gauge, TrendingUp, Clock, Wifi, WifiOff, AlertCircle } from 'lucide-react';

export default function Home() {
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [tunnelUrl, setTunnelUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Fetch system state with connection tracking
  const fetchState = useCallback(async () => {
    try {
      const state = await fetchSystemState();
      if (state && Object.keys(state).length > 0) {
        setSystemState(state as SystemState);
        setApiConnected(true);
        setConnectionError(null);
      } else {
        setApiConnected(false);
        setConnectionError('API returned empty response');
      }
    } catch (error) {
      console.error('Error fetching state:', error);
      setApiConnected(false);
      setConnectionError('Cannot connect to API');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch initial system state and poll
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, [fetchState]);

  // Fetch events periodically
  useEffect(() => {
    const fetchEvents = async () => {
      const data = await fetchRecentEvents(50);
      setEvents(data);
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 5000); // Update every 5s
    return () => clearInterval(interval);
  }, []);

  // Calculate metrics from events
  const todayEvents = events.filter((e) => {
    const eventDate = new Date(e.timestamp || e.created_at || '').toDateString();
    const today = new Date().toDateString();
    return eventDate === today;
  });

  const avgQueueLevel =
    todayEvents.length > 0
      ? (todayEvents.reduce((sum, e) => sum + (e.queue_level || 0), 0) / todayEvents.length).toFixed(1)
      : '0.0';

  const peakScore = todayEvents.length > 0
    ? Math.max(...todayEvents.map((e) => e.traffic_score || 0))
    : 0;

  const lastUpdate = systemState?.last_update
    ? `${Math.floor((Date.now() - new Date(systemState.last_update).getTime()) / 1000 / 60)}m ago`
    : systemState ? 'Just now' : 'Never';

  // Handle override
  const handleOverride = async (signal: string, speedLimit: number) => {
    try {
      await setOverride(signal, speedLimit);
      await fetchState(); // Refresh state
    } catch (error) {
      console.error('Override failed:', error);
      throw error;
    }
  };

  const handleClearOverride = async () => {
    try {
      await clearOverride();
      await fetchState(); // Refresh state
    } catch (error) {
      console.error('Clear override failed:', error);
      throw error;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">🚦 Traffic Command Center</h1>
                {apiConnected ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    <Wifi className="w-3 h-3" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                    <WifiOff className="w-3 h-3" />
                    Disconnected
                  </span>
                )}
              </div>
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

        {/* Connection Error Banner */}
        {!loading && !apiConnected && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-yellow-200 font-medium">API Not Connected</p>
              <p className="text-yellow-300/70 text-sm">
                Make sure the traffic controller is running. Check your local setup or tunnel URL.
              </p>
            </div>
          </div>
        )}

        {/* Alert Banner */}
        {systemState && systemState.traffic_score >= 12 && (
          <AlertBanner score={systemState.traffic_score} />
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricsCard
            icon={Users}
            title="Vehicles Today"
            value={todayEvents.reduce((sum, e) => sum + (e.car_count || 0), 0)}
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
            title="Events Logged"
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
          onOverrideSet={handleOverride}
          onOverrideClear={handleClearOverride}
        />

        {/* History Chart */}
        <HistoryChart events={events} />

        {/* History Table */}
        <HistoryTable events={events} />

        {/* Footer */}
        <div className="text-center text-slate-500 py-6">
          <p className="text-sm">
            Adaptive Traffic Signal System • Built with ESP32, YOLOv8, Next.js
          </p>
        </div>
      </div>
    </main>
  );
}

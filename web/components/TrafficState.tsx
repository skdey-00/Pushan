'use client';

import { SystemState } from '@/lib/types';
import { Activity, Users, Signal, Gauge } from 'lucide-react';

interface TrafficStateProps {
  state: SystemState | null;
}

export default function TrafficState({ state }: TrafficStateProps) {
  if (!state) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const signalColor = {
    RED: 'bg-red-500',
    YELLOW: 'bg-yellow-500',
    GREEN: 'bg-green-500',
  }[state.current_signal] || 'bg-gray-500';

  const signalText = {
    RED: 'Stop',
    YELLOW: 'Caution',
    GREEN: 'Go',
  }[state.current_signal];

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <h2 className="text-lg font-semibold">Traffic State</h2>

      {/* Current Signal */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-gray-600">
          <Signal className="w-4 h-4" />
          <span className="text-sm">Current Signal</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${signalColor} shadow-lg`}></div>
          <div>
            <div className="text-2xl font-bold">{state.current_signal}</div>
            <div className="text-sm text-gray-500">{signalText}</div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <Users className="w-4 h-4" />
            <span>Vehicles</span>
          </div>
          <div className="text-2xl font-bold">{state.car_count}</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <Gauge className="w-4 h-4" />
            <span>Queue</span>
          </div>
          <div className="text-2xl font-bold">
            {state.queue_level}<span className="text-sm text-gray-500">/6</span>
          </div>
        </div>
      </div>

      {/* Speed Limit */}
      <div className="bg-blue-50 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-blue-700 font-medium">Speed Limit</div>
            <div className="text-3xl font-bold text-blue-900">
              {state.speed_limit} <span className="text-lg">km/h</span>
            </div>
          </div>
          <Gauge className="w-12 h-12 text-blue-500" />
        </div>
      </div>

      {/* Traffic Score */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
          <Activity className="w-4 h-4" />
          <span>Traffic Score</span>
        </div>
        <div className="flex items-end gap-2">
          <div className="text-2xl font-bold">
            {typeof state.traffic_score === 'number' ? state.traffic_score.toFixed(1) : '0.0'}
          </div>
          <div className="text-sm text-gray-500 mb-1">
            {state.traffic_score < 3 ? 'Light' :
             state.traffic_score < 7 ? 'Moderate' :
             state.traffic_score < 12 ? 'Heavy' :
             state.traffic_score < 17 ? 'Congested' : 'Severe'}
          </div>
        </div>
      </div>

      {/* Override Indicator */}
      {state.is_override && state.override?.active && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-orange-800">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Manual Override Active</span>
          </div>
          <div className="text-sm text-orange-700 mt-1">
            Expires in {state.override.remaining_seconds}s
          </div>
        </div>
      )}
    </div>
  );
}

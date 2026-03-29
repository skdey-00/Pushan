'use client';

import { SystemState } from '@/lib/types';
import { Wifi, WifiOff, Activity } from 'lucide-react';

interface SystemHealthProps {
  state: SystemState | null;
}

export default function SystemHealth({ state }: SystemHealthProps) {
  if (!state) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const lastUpdate = state.last_update
    ? new Date(state.last_update).toLocaleString()
    : 'Never';

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        System Health
      </h2>

      <div className="space-y-3">
        {/* Camera Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium">Camera Node</div>
            <div className="text-sm text-gray-500">ESP32-CAM</div>
          </div>
          {state.devices_online.camera ? (
            <div className="flex items-center gap-2 text-green-600">
              <Wifi className="w-5 h-5" />
              <span className="text-sm font-medium">Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <WifiOff className="w-5 h-5" />
              <span className="text-sm font-medium">Offline</span>
            </div>
          )}
        </div>

        {/* Dev Board Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium">Signal Controller</div>
            <div className="text-sm text-gray-500">ESP32 Dev Board</div>
          </div>
          {state.devices_online.devboard ? (
            <div className="flex items-center gap-2 text-green-600">
              <Wifi className="w-5 h-5" />
              <span className="text-sm font-medium">Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <WifiOff className="w-5 h-5" />
              <span className="text-sm font-medium">Offline</span>
            </div>
          )}
        </div>

        {/* Last Update */}
        <div className="pt-2 border-t border-gray-200">
          <div className="text-sm text-gray-500">Last Update</div>
          <div className="text-sm font-medium">{lastUpdate}</div>
        </div>

        {/* Heartbeat */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">System Heartbeat</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

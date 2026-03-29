'use client';

import { SystemState } from '@/lib/types';

interface TrafficSignalProps {
  signal: 'RED' | 'YELLOW' | 'GREEN';
  duration?: number;
}

export default function TrafficSignal({ signal, duration }: TrafficSignalProps) {
  const signals = ['RED', 'YELLOW', 'GREEN'] as const;

  const getSignalStyle = (sig: typeof signal) => {
    const isActive = sig === signal;

    const baseStyle = "w-20 h-20 rounded-full transition-all duration-300";

    const colorStyles = {
      RED: isActive
        ? "bg-red-500 shadow-[0_0_30px_#ef4444,0_0_60px_#ef4444] animate-pulse"
        : "bg-red-900/30",
      YELLOW: isActive
        ? "bg-yellow-400 shadow-[0_0_30px_#eab308,0_0_60px_#eab308] animate-pulse"
        : "bg-yellow-900/30",
      GREEN: isActive
        ? "bg-green-500 shadow-[0_0_30px_#22c55e,0_0_60px_#22c55e] animate-pulse"
        : "bg-green-900/30",
    };

    return `${baseStyle} ${colorStyles[sig]}`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Traffic Light Housing */}
      <div className="bg-gray-900 rounded-3xl p-6 shadow-2xl border-4 border-gray-800">
        <div className="flex flex-col gap-4">
          {signals.map((sig) => (
            <div key={sig} className={getSignalStyle(sig)} />
          ))}
        </div>
      </div>

      {/* Signal Info */}
      <div className="text-center space-y-2">
        <div className="text-4xl font-bold text-white">{signal}</div>
        {duration !== undefined && (
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-blue-300 text-sm">Duration: {duration}s remaining</span>
          </div>
        )}
      </div>
    </div>
  );
}

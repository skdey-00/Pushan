'use client';

import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
}

export default function MetricsCard({
  icon: Icon,
  title,
  value,
  unit,
  trend,
  color = 'blue',
}: MetricsCardProps) {
  const colorStyles = {
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  const iconColors = {
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    gray: 'text-gray-600',
  };

  return (
    <div className={`rounded-xl border p-4 transition-all hover:shadow-lg ${colorStyles[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-5 h-5 ${iconColors[color]}`} />
            <span className="text-sm font-medium opacity-80">{title}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{value}</span>
            {unit && <span className="text-sm opacity-70">{unit}</span>}
          </div>
          {trend && (
            <div className="mt-2 text-sm flex items-center gap-1">
              <span className={`font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value >= 0 ? '+' : ''}{trend.value}
              </span>
              <span className="opacity-70">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

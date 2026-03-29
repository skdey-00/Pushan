'use client';

import { AlertTriangle } from 'lucide-react';

interface AlertBannerProps {
  score: number;
}

export default function AlertBanner({ score }: AlertBannerProps) {
  const getAlertMessage = () => {
    if (score >= 17) {
      return {
        level: 'Critical',
        message: 'Severe congestion detected. Maximum traffic control active.',
        bgClass: 'bg-red-500',
        borderClass: 'border-red-600',
      };
    } else if (score >= 12) {
      return {
        level: 'High',
        message: 'Heavy traffic detected. Consider alternate routes.',
        bgClass: 'bg-orange-500',
        borderClass: 'border-orange-600',
      };
    }
    return null;
  };

  const alert = getAlertMessage();

  if (!alert) {
    return null;
  }

  return (
    <div className={`${alert.bgClass} ${alert.borderClass} border-2 rounded-lg shadow-lg p-4 text-white`}>
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 flex-shrink-0" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{alert.level} Alert</span>
            <span className="text-sm opacity-90">(Score: {score.toFixed(1)})</span>
          </div>
          <div className="text-sm mt-1 opacity-95">{alert.message}</div>
        </div>
      </div>
    </div>
  );
}

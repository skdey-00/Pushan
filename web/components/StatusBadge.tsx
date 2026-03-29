'use client';

import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'warning';
  label?: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = {
    online: {
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      border: 'border-green-500/30',
      dot: 'bg-green-400',
    },
    offline: {
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      dot: 'bg-red-400',
    },
    warning: {
      icon: AlertCircle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/30',
      dot: 'bg-yellow-400',
    },
  };

  const { icon: Icon, color, bg, border, dot } = config[status];

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${bg} ${border}`}>
      <div className={`w-2 h-2 rounded-full ${dot} animate-pulse`} />
      <Icon className={`w-4 h-4 ${color}`} />
      {label && <span className={`text-sm font-medium ${color}`}>{label}</span>}
    </div>
  );
}

'use client';

import { TrafficEvent } from '@/lib/types';

interface HistoryTableProps {
  events: TrafficEvent[];
}

export default function HistoryTable({ events }: HistoryTableProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Event History</h2>

      {events.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No events recorded yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 font-medium text-slate-300">Time</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Signal</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Cars</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Queue</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Score</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Speed</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Override</th>
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 20).map((event, idx) => {
                const dateStr = event.timestamp || event.created_at;
                return (
                  <tr key={event.id || idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-slate-300">
                      {dateStr ? new Date(dateStr).toLocaleString() : '--'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.signal === 'RED' ? 'bg-red-500/20 text-red-400' :
                        event.signal === 'YELLOW' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {event.signal || '--'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{event.car_count ?? 0}</td>
                    <td className="py-3 px-4 text-slate-300">{event.queue_level ?? 0}/6</td>
                    <td className="py-3 px-4 font-medium text-slate-200">{(event.traffic_score ?? 0).toFixed(1)}</td>
                    <td className="py-3 px-4 text-slate-300">{event.speed_limit ?? 0} km/h</td>
                    <td className="py-3 px-4">
                      {event.is_override ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
                          Yes
                        </span>
                      ) : (
                        <span className="text-slate-500">No</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

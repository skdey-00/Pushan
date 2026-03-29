'use client';

import { TrafficEvent } from '@/lib/types';

interface HistoryTableProps {
  events: TrafficEvent[];
}

export default function HistoryTable({ events }: HistoryTableProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Event History</h2>

      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No events recorded yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Signal</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Cars</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Queue</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Score</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Speed</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Override</th>
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 20).map((event) => (
                <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {new Date(event.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      event.signal === 'RED' ? 'bg-red-100 text-red-800' :
                      event.signal === 'YELLOW' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {event.signal}
                    </span>
                  </td>
                  <td className="py-3 px-4">{event.car_count}</td>
                  <td className="py-3 px-4">{event.queue_level}/6</td>
                  <td className="py-3 px-4 font-medium">{event.traffic_score.toFixed(1)}</td>
                  <td className="py-3 px-4">{event.speed_limit} km/h</td>
                  <td className="py-3 px-4">
                    {event.is_override ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Yes
                      </span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

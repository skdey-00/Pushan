'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface OverridePanelProps {
  onOverrideSet: (data: { signal: string; speedLimit: number }) => void;
}

export default function OverridePanel({ onOverrideSet }: OverridePanelProps) {
  const [signal, setSignal] = useState<'RED' | 'YELLOW' | 'GREEN'>('RED');
  const [speedLimit, setSpeedLimit] = useState<20 | 30 | 40 | 60 | 80>(40);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const setOverride = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { setOverride: apiSetOverride } = await import('@/lib/api');
      await apiSetOverride(signal, speedLimit);
      setMessage({ type: 'success', text: `Override set: ${signal} @ ${speedLimit}km/h` });
      onOverrideSet({ signal, speedLimit });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Network error. Is the API running?' });
    } finally {
      setLoading(false);
    }
  };

  const clearOverride = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { clearOverride: apiClearOverride } = await import('@/lib/api');
      await apiClearOverride();
      setMessage({ type: 'success', text: 'Override cleared' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Network error. Is the API running?' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-semibold">Manual Override</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Signal Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Signal
          </label>
          <select
            value={signal}
            onChange={(e) => setSignal(e.target.value as 'RED' | 'YELLOW' | 'GREEN')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="RED">Red</option>
            <option value="YELLOW">Yellow</option>
            <option value="GREEN">Green</option>
          </select>
        </div>

        {/* Speed Limit Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Speed Limit (km/h)
          </label>
          <select
            value={speedLimit}
            onChange={(e) => setSpeedLimit(Number(e.target.value) as 20 | 30 | 40 | 60 | 80)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={40}>40</option>
            <option value={60}>60</option>
            <option value={80}>80</option>
          </select>
        </div>

        {/* Set Override Button */}
        <div className="flex items-end">
          <button
            onClick={setOverride}
            disabled={loading}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Setting...' : 'Set Override'}
          </button>
        </div>

        {/* Clear Override Button */}
        <div className="flex items-end">
          <button
            onClick={clearOverride}
            disabled={loading}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Clearing...' : 'Clear Override'}
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>Override lasts 60 seconds. After expiry, AI control automatically resumes.</p>
      </div>
    </div>
  );
}

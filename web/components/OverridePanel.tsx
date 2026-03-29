'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface OverridePanelProps {
  onOverrideSet: (signal: string, speedLimit: number) => Promise<void>;
  onOverrideClear: () => Promise<void>;
}

export default function OverridePanel({ onOverrideSet, onOverrideClear }: OverridePanelProps) {
  const [signal, setSignal] = useState<'RED' | 'YELLOW' | 'GREEN'>('RED');
  const [speedLimit, setSpeedLimit] = useState<20 | 30 | 40 | 60 | 80>(40);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSetOverride = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await onOverrideSet(signal, speedLimit);
      setMessage({ type: 'success', text: `Override set: ${signal} @ ${speedLimit}km/h` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Network error. Is the API running?' });
    } finally {
      setLoading(false);
    }
  };

  const handleClearOverride = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await onOverrideClear();
      setMessage({ type: 'success', text: 'Override cleared' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Network error. Is the API running?' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-orange-400" />
        <h2 className="text-lg font-semibold text-white">Manual Override</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Signal Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Signal
          </label>
          <select
            value={signal}
            onChange={(e) => setSignal(e.target.value as 'RED' | 'YELLOW' | 'GREEN')}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
          >
            <option value="RED">Red</option>
            <option value="YELLOW">Yellow</option>
            <option value="GREEN">Green</option>
          </select>
        </div>

        {/* Speed Limit Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Speed Limit (km/h)
          </label>
          <select
            value={speedLimit}
            onChange={(e) => setSpeedLimit(Number(e.target.value) as 20 | 30 | 40 | 60 | 80)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
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
            onClick={handleSetOverride}
            disabled={loading}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Setting...' : 'Set Override'}
          </button>
        </div>

        {/* Clear Override Button */}
        <div className="flex items-end">
          <button
            onClick={handleClearOverride}
            disabled={loading}
            className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Clearing...' : 'Clear Override'}
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="mt-4 text-sm text-slate-400">
        <p>Override lasts 60 seconds. After expiry, AI control automatically resumes.</p>
      </div>
    </div>
  );
}

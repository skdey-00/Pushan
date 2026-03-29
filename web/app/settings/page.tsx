'use client';

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, AlertTriangle } from 'lucide-react';

interface Settings {
  junctionName: string;
  flaskApiUrl: string;
  alertThreshold: number;
  dataRetentionDays: number;
  overrideTimeout: number;
  enableNotifications: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  junctionName: 'MG Road Junction',
  flaskApiUrl: process.env.NEXT_PUBLIC_FLASK_API_URL || '',
  alertThreshold: 12,
  dataRetentionDays: 30,
  overrideTimeout: 60,
  enableNotifications: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('trafficSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Save to localStorage
      localStorage.setItem('trafficSettings', JSON.stringify(settings));

      // You could also save to Supabase here if you have a settings table
      // For now, localStorage is sufficient for client-side settings

      setSaving(false);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setSaving(false);
      setMessage({ type: 'error', text: 'Failed to save settings' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('trafficSettings');
    setMessage({ type: 'success', text: 'Settings reset to defaults' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to clear all traffic event logs? This action cannot be undone.')) {
      return;
    }

    setClearing(true);
    setMessage(null);

    try {
      const { clearLogs } = await import('@/lib/api');
      await clearLogs();
      setMessage({ type: 'success', text: 'All logs cleared successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to clear logs. Check your connection.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setClearing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <SettingsIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Settings</h1>
              <p className="text-slate-400">Configure your traffic signal system</p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 space-y-6">
          {/* Junction Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Junction Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Junction Name
                </label>
                <input
                  type="text"
                  value={settings.junctionName}
                  onChange={(e) => setSettings({ ...settings, junctionName: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter junction name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Flask API URL (Read-only)
                </label>
                <input
                  type="text"
                  value={settings.flaskApiUrl || 'Not configured'}
                  disabled
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
                />
                <p className="text-slate-400 text-sm mt-1">
                  Configure via NEXT_PUBLIC_FLASK_API_URL environment variable
                </p>
              </div>
            </div>
          </div>

          {/* Alert Settings */}
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Alert Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Traffic Score Alert Threshold
                </label>
                <input
                  type="number"
                  value={settings.alertThreshold}
                  onChange={(e) =>
                    setSettings({ ...settings, alertThreshold: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="20"
                />
                <p className="text-slate-400 text-sm mt-1">
                  Alert banner appears when traffic score exceeds this value
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Enable Notifications</p>
                  <p className="text-slate-400 text-sm">
                    Receive browser notifications for high congestion
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSettings({ ...settings, enableNotifications: !settings.enableNotifications })
                  }
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    settings.enableNotifications ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.enableNotifications ? 'left-8' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* System Configuration */}
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">System Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Override Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={settings.overrideTimeout}
                  onChange={(e) =>
                    setSettings({ ...settings, overrideTimeout: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="30"
                  max="300"
                />
                <p className="text-slate-400 text-sm mt-1">
                  Manual override duration before auto-resume
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Data Retention (days)
                </label>
                <input
                  type="number"
                  value={settings.dataRetentionDays}
                  onChange={(e) =>
                    setSettings({ ...settings, dataRetentionDays: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="7"
                  max="365"
                />
                <p className="text-slate-400 text-sm mt-1">
                  How long to keep traffic event logs
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-700">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Defaults
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/30 p-6 mt-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h3>
          <p className="text-slate-300 mb-4">
            Clear all traffic event logs from the database. This action cannot be undone.
          </p>
          <button
            onClick={handleClearLogs}
            disabled={clearing}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed transition-colors"
          >
            {clearing ? 'Clearing...' : 'Clear All Logs'}
          </button>
        </div>
      </div>
    </main>
  );
}

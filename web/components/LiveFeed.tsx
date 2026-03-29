'use client';

import { useState, useEffect } from 'react';
import { Camera, CameraOff } from 'lucide-react';

interface LiveFeedProps {
  tunnelUrl: string;
}

export default function LiveFeed({ tunnelUrl }: LiveFeedProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Fetch camera URL from system state
    const fetchTunnelUrl = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/status`);
        if (response.ok) {
          const state = await response.json();
          if (state.tunnel_url) {
            setImageUrl(`${state.tunnel_url}/stream`);
          }
        }
      } catch (err) {
        console.error('Error fetching tunnel URL:', err);
      }
    };

    fetchTunnelUrl();
  }, []);

  // Auto-refresh image every second
  useEffect(() => {
    if (!imageUrl) return;

    const interval = setInterval(() => {
      setImageUrl(`${imageUrl}?t=${Date.now()}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [imageUrl]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Live Camera Feed
        </h2>
        <div className={`flex items-center gap-1 text-sm ${loading ? 'text-gray-400' : 'text-green-600'}`}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              Connecting...
            </>
          ) : error ? (
            <>
              <CameraOff className="w-4 h-4" />
              Offline
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              Live
            </>
          )}
        </div>
      </div>

      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Traffic Camera Feed"
            className="w-full h-full object-cover"
            onLoad={() => {
              setLoading(false);
              setError(false);
            }}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <CameraOff className="w-12 h-12 mx-auto mb-2" />
              <p>Camera not configured</p>
              <p className="text-sm mt-1">Set tunnel URL in Supabase</p>
            </div>
          </div>
        )}
      </div>

      {!imageUrl && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          <p className="font-medium">Setup Required:</p>
          <p className="mt-1">
            Run cloudflared tunnel and update the tunnel_url in Supabase system_state table.
          </p>
        </div>
      )}
    </div>
  );
}

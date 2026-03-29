-- ============================================================
-- SUPABASE SETUP SCRIPT
-- Adaptive Traffic Signal System
-- ============================================================
-- Run this in Supabase SQL Editor
-- ============================================================

-- Create traffic_events table
CREATE TABLE IF NOT EXISTS traffic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  car_count INTEGER,
  queue_level INTEGER,
  traffic_score NUMERIC,
  signal TEXT,
  speed_limit INTEGER,
  is_override BOOLEAN DEFAULT false
);

-- Enable Realtime on traffic_events
ALTER PUBLICATION supabase_realtime ADD TABLE traffic_events;

-- Set replica identity for full updates
ALTER TABLE traffic_events REPLICA IDENTITY FULL;

-- Create system_state table
CREATE TABLE IF NOT EXISTS system_state (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime on system_state
ALTER PUBLICATION supabase_realtime ADD TABLE system_state;

-- Set replica identity for full updates
ALTER TABLE system_state REPLICA IDENTITY FULL;

-- Insert initial heartbeat
INSERT INTO system_state (key, value) VALUES ('heartbeat', now()::text)
ON CONFLICT (key) DO NOTHING;

-- Insert placeholder for tunnel_url (update this after cloudflared is running)
INSERT INTO system_state (key, value) VALUES ('tunnel_url', '')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_traffic_events_created_at ON traffic_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_traffic_events_signal ON traffic_events(signal);

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check tables were created
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('traffic_events', 'system_state');

-- Check Realtime is enabled
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- View empty tables
SELECT * FROM traffic_events;
SELECT * FROM system_state;

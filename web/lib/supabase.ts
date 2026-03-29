/**
 * Supabase client configuration
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Subscribe to traffic events in real-time
 */
export function subscribeToTrafficEvents(
  callback: (payload: { new: any }) => void
) {
  if (!supabase) return { unsubscribe: () => {} };
  return supabase
    .channel('traffic_events')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'traffic_events',
      },
      callback
    )
    .subscribe();
}

/**
 * Fetch recent traffic events
 */
export async function fetchRecentEvents(limit = 50) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('traffic_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return data;
}

/**
 * Fetch system state from database
 */
export async function fetchSystemState() {
  if (!supabase) return {};
  const { data, error } = await supabase
    .from('system_state')
    .select('*');

  if (error) {
    console.error('Error fetching system state:', error);
    return {};
  }

  const state: Record<string, string> = {};
  data.forEach((row: any) => {
    state[row.key] = row.value;
  });

  return state;
}

/**
 * Subscribe to system state changes
 */
export function subscribeToSystemState(
  callback: (payload: { new: any }) => void
) {
  if (!supabase) return { unsubscribe: () => {} };
  return supabase
    .channel('system_state')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'system_state',
      },
      callback
    )
    .subscribe();
}

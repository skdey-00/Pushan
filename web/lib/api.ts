/**
 * API client for Flask backend
 * This replaces Supabase for deployments that don't want to use it
 */

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL;
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_FLASK_API_URL environment variable is not set');
  }
  return apiUrl;
};

/**
 * Fetch system state from Flask API
 */
export async function fetchSystemState(): Promise<Record<string, any>> {
  try {
    const response = await fetch(`${getApiUrl()}/status`);
    if (!response.ok) {
      throw new Error(`Failed to fetch system state: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching system state:', error);
    return {};
  }
}

/**
 * Fetch recent traffic events from Flask API
 */
export async function fetchRecentEvents(limit: number = 50): Promise<any[]> {
  try {
    const response = await fetch(`${getApiUrl()}/events?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }
    const data = await response.json();
    return data.events || data || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

/**
 * Set traffic signal override
 */
export async function setOverride(signal: string, speedLimit: number): Promise<any> {
  const response = await fetch(`${getApiUrl()}/override`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signal, speed_limit: speedLimit }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'API error' }));
    throw new Error(error.error || 'Failed to set override');
  }

  return response.json();
}

/**
 * Clear traffic signal override
 */
export async function clearOverride(): Promise<any> {
  const response = await fetch(`${getApiUrl()}/clear_override`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'API error' }));
    throw new Error(error.error || 'Failed to clear override');
  }

  return response.json();
}

/**
 * Clear all event logs
 */
export async function clearLogs(): Promise<any> {
  const response = await fetch(`${getApiUrl()}/clear-logs`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'API error' }));
    throw new Error(error.error || 'Failed to clear logs');
  }

  return response.json();
}

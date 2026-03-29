/**
 * Type definitions for the Traffic Signal System
 */

export interface SensorState {
  s25: number;
  s50: number;
  s75: number;
}

export interface SystemState {
  car_count: number;
  sensors: SensorState;
  queue_level: number;
  traffic_score: number;
  current_signal: 'RED' | 'YELLOW' | 'GREEN';
  speed_limit: number;
  is_override: boolean;
  last_update: string;
  devices_online: {
    camera: boolean;
    devboard: boolean;
  };
  override?: {
    active: boolean;
    signal: string | null;
    speed_limit: number | null;
    remaining_seconds: number;
  };
}

export interface TrafficEvent {
  id?: string;
  created_at?: string;
  timestamp?: string;
  car_count?: number;
  queue_level?: number;
  traffic_score?: number;
  signal?: string;
  speed_limit?: number;
  is_override?: boolean;
  type?: string;
}

export interface OverrideRequest {
  signal: 'RED' | 'YELLOW' | 'GREEN';
  speed_limit: 20 | 30 | 40 | 60 | 80;
}

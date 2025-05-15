
// Device status types
export type DeviceStatus = 'available' | 'inUse' | 'outOfService';

// Device type
export interface GameDevice {
  id: string;
  name: string;
  type: string;
  deviceId?: string; // Optional QR code or unique identifier
  status: DeviceStatus;
  timerDefault: number; // Default time in minutes
}

// Active session type
export interface GameSession {
  deviceId: string;
  startTime: Date;
  duration: number; // in minutes
  endTime: Date;
  isPaused: boolean;
  pausedTimeRemaining?: number; // Time remaining when paused (in seconds)
}

// Usage log entry
export interface UsageLog {
  id: string;
  deviceId: string;
  deviceName: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  completed: boolean; // Whether session completed normally or was ended early
}

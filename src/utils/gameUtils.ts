
import { DeviceStatus } from "@/types/models";

// Format time as MM:SS
export const formatTime = (seconds: number): string => {
  if (seconds <= 0) return "00:00";
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// Calculate end time by adding minutes to current time
export const calculateEndTime = (minutes: number): Date => {
  const endTime = new Date();
  endTime.setMinutes(endTime.getMinutes() + minutes);
  return endTime;
};

// Get the appropriate CSS class for a device status
export const getStatusClass = (status: DeviceStatus): string => {
  switch (status) {
    case "available":
      return "device-status-available";
    case "inUse":
      return "device-status-in-use";
    case "outOfService":
      return "device-status-out-of-service";
    default:
      return "";
  }
};

// Generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Play alert sound
export const playAlertSound = () => {
  const audio = new Audio("data:audio/wav;base64,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");
  audio.play();
};

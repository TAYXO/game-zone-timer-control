
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  GameDevice, 
  GameSession, 
  UsageLog,
  DeviceStatus 
} from "@/types/models";
import { generateId, calculateEndTime, playAlertSound } from "@/utils/gameUtils";
import { useToast } from "@/components/ui/use-toast";

interface GameZoneContextType {
  devices: GameDevice[];
  activeSessions: GameSession[];
  usageLogs: UsageLog[];
  addDevice: (device: Omit<GameDevice, "id" | "status">) => void;
  editDevice: (device: GameDevice) => void;
  deleteDevice: (deviceId: string) => void;
  startSession: (deviceId: string, duration: number) => void;
  stopSession: (deviceId: string) => void;
  pauseSession: (deviceId: string) => void;
  resumeSession: (deviceId: string) => void;
  extendSession: (deviceId: string, additionalMinutes: number) => void;
  changeDeviceStatus: (deviceId: string, status: DeviceStatus) => void;
}

export const GameZoneContext = createContext<GameZoneContextType | undefined>(undefined);

export const useGameZone = () => {
  const context = useContext(GameZoneContext);
  if (!context) {
    throw new Error("useGameZone must be used within a GameZoneProvider");
  }
  return context;
};

export const GameZoneProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [devices, setDevices] = useState<GameDevice[]>(() => {
    const savedDevices = localStorage.getItem("gameZoneDevices");
    return savedDevices ? JSON.parse(savedDevices) : [];
  });
  
  const [activeSessions, setActiveSessions] = useState<GameSession[]>(() => {
    const savedSessions = localStorage.getItem("gameZoneActiveSessions");
    if (!savedSessions) return [];
    
    const parsed = JSON.parse(savedSessions);
    // Convert string dates back to Date objects
    return parsed.map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: new Date(session.endTime),
    }));
  });
  
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>(() => {
    const savedLogs = localStorage.getItem("gameZoneUsageLogs");
    if (!savedLogs) return [];
    
    const parsed = JSON.parse(savedLogs);
    // Convert string dates back to Date objects
    return parsed.map((log: any) => ({
      ...log,
      startTime: new Date(log.startTime),
      endTime: new Date(log.endTime),
    }));
  });

  const { toast } = useToast();
  
  // Save to local storage when state changes
  useEffect(() => {
    localStorage.setItem("gameZoneDevices", JSON.stringify(devices));
  }, [devices]);
  
  useEffect(() => {
    localStorage.setItem("gameZoneActiveSessions", JSON.stringify(activeSessions));
  }, [activeSessions]);
  
  useEffect(() => {
    localStorage.setItem("gameZoneUsageLogs", JSON.stringify(usageLogs));
  }, [usageLogs]);
  
  // Check for finished sessions
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      const finishedSessions = activeSessions.filter(session => 
        !session.isPaused && new Date(session.endTime) <= now
      );
      
      if (finishedSessions.length > 0) {
        finishedSessions.forEach(session => {
          const device = devices.find(d => d.id === session.deviceId);
          if (device) {
            // Play alert sound
            playAlertSound();
            
            // Show toast notification
            toast({
              title: "Time's up!",
              description: `Session for ${device.name} has ended.`,
              variant: "destructive",
            });
            
            // Stop the session and update logs
            stopSession(session.deviceId);
          }
        });
      }
    }, 1000); // Check every second
    
    return () => clearInterval(intervalId);
  }, [activeSessions, devices]);
  
  const addDevice = (device: Omit<GameDevice, "id" | "status">) => {
    const newDevice: GameDevice = {
      ...device,
      id: generateId(),
      status: "available"
    };
    
    setDevices(prevDevices => [...prevDevices, newDevice]);
    
    toast({
      title: "Device Added",
      description: `${device.name} has been added to your game zone.`,
    });
  };
  
  const editDevice = (updatedDevice: GameDevice) => {
    setDevices(prevDevices => 
      prevDevices.map(device => 
        device.id === updatedDevice.id ? updatedDevice : device
      )
    );
    
    toast({
      title: "Device Updated",
      description: `${updatedDevice.name} has been updated.`,
    });
  };
  
  const deleteDevice = (deviceId: string) => {
    // First ensure no active sessions for this device
    const hasActiveSession = activeSessions.some(session => session.deviceId === deviceId);
    
    if (hasActiveSession) {
      stopSession(deviceId);
    }
    
    const deviceToDelete = devices.find(d => d.id === deviceId);
    setDevices(prevDevices => prevDevices.filter(device => device.id !== deviceId));
    
    if (deviceToDelete) {
      toast({
        title: "Device Deleted",
        description: `${deviceToDelete.name} has been removed.`,
      });
    }
  };
  
  const startSession = (deviceId: string, duration: number) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;
    
    // Update device status
    changeDeviceStatus(deviceId, "inUse");
    
    const startTime = new Date();
    const endTime = calculateEndTime(duration);
    
    const newSession: GameSession = {
      deviceId,
      startTime,
      duration,
      endTime,
      isPaused: false,
    };
    
    // Remove any existing session for this device
    setActiveSessions(prev => [
      ...prev.filter(session => session.deviceId !== deviceId),
      newSession
    ]);
    
    toast({
      title: "Session Started",
      description: `Timer started for ${device.name} - ${duration} minutes.`,
    });
  };
  
  const stopSession = (deviceId: string) => {
    const session = activeSessions.find(s => s.deviceId === deviceId);
    const device = devices.find(d => d.id === deviceId);
    
    if (session && device) {
      // Update device status
      changeDeviceStatus(deviceId, "available");
      
      // Create usage log
      const now = new Date();
      const actualDuration = Math.round(
        (now.getTime() - session.startTime.getTime()) / (1000 * 60)
      );
      
      const log: UsageLog = {
        id: generateId(),
        deviceId,
        deviceName: device.name,
        startTime: session.startTime,
        endTime: now,
        duration: actualDuration,
        completed: now >= session.endTime,
      };
      
      setUsageLogs(prev => [...prev, log]);
      
      // Remove session
      setActiveSessions(prev => 
        prev.filter(s => s.deviceId !== deviceId)
      );
      
      toast({
        title: "Session Ended",
        description: `Session for ${device.name} has been ended.`,
      });
    }
  };
  
  const pauseSession = (deviceId: string) => {
    setActiveSessions(prev => 
      prev.map(session => {
        if (session.deviceId === deviceId && !session.isPaused) {
          const now = new Date();
          const remainingMs = session.endTime.getTime() - now.getTime();
          const remainingSecs = Math.max(0, Math.floor(remainingMs / 1000));
          
          return {
            ...session,
            isPaused: true,
            pausedTimeRemaining: remainingSecs
          };
        }
        return session;
      })
    );
    
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      toast({
        title: "Session Paused",
        description: `Timer for ${device.name} has been paused.`,
      });
    }
  };
  
  const resumeSession = (deviceId: string) => {
    setActiveSessions(prev => 
      prev.map(session => {
        if (session.deviceId === deviceId && session.isPaused) {
          const now = new Date();
          const newEndTime = new Date(
            now.getTime() + (session.pausedTimeRemaining || 0) * 1000
          );
          
          return {
            ...session,
            isPaused: false,
            endTime: newEndTime,
            pausedTimeRemaining: undefined
          };
        }
        return session;
      })
    );
    
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      toast({
        title: "Session Resumed",
        description: `Timer for ${device.name} has been resumed.`,
      });
    }
  };
  
  const extendSession = (deviceId: string, additionalMinutes: number) => {
    setActiveSessions(prev => 
      prev.map(session => {
        if (session.deviceId === deviceId) {
          if (session.isPaused) {
            // If paused, extend the paused time
            const additionalSeconds = additionalMinutes * 60;
            return {
              ...session,
              pausedTimeRemaining: (session.pausedTimeRemaining || 0) + additionalSeconds,
              duration: session.duration + additionalMinutes
            };
          } else {
            // If running, extend the end time
            const newEndTime = new Date(session.endTime);
            newEndTime.setMinutes(newEndTime.getMinutes() + additionalMinutes);
            
            return {
              ...session,
              endTime: newEndTime,
              duration: session.duration + additionalMinutes
            };
          }
        }
        return session;
      })
    );
    
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      toast({
        title: "Session Extended",
        description: `Added ${additionalMinutes} minutes to ${device.name}.`,
      });
    }
  };
  
  const changeDeviceStatus = (deviceId: string, status: DeviceStatus) => {
    setDevices(prev => 
      prev.map(device => 
        device.id === deviceId 
          ? { ...device, status } 
          : device
      )
    );
  };
  
  const contextValue: GameZoneContextType = {
    devices,
    activeSessions,
    usageLogs,
    addDevice,
    editDevice,
    deleteDevice,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    extendSession,
    changeDeviceStatus
  };
  
  return (
    <GameZoneContext.Provider value={contextValue}>
      {children}
    </GameZoneContext.Provider>
  );
};

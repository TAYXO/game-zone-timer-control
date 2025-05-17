
import React, { createContext, useState, useContext, useEffect } from "react";
import { GameDevice, DeviceStatus, GameSession, UsageLog } from "@/types/models";
import { generateId } from "@/utils/gameUtils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GameZoneContextType {
  devices: GameDevice[];
  activeSessions: GameSession[];
  usageLogs: UsageLog[];
  addDevice: (deviceData: Omit<GameDevice, "id" | "status">) => Promise<void>;
  editDevice: (device: GameDevice) => Promise<void>;
  deleteDevice: (deviceId: string) => Promise<void>;
  startSession: (deviceId: string, duration: number) => void;
  stopSession: (deviceId: string) => void;
  pauseSession: (deviceId: string) => void;
  resumeSession: (deviceId: string) => void;
  extendSession: (deviceId: string, additionalMinutes: number) => void;
  loading: boolean;
}

const GameZoneContext = createContext<GameZoneContextType | undefined>(undefined);

export const GameZoneProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [devices, setDevices] = useState<GameDevice[]>([]);
  const [activeSessions, setActiveSessions] = useState<GameSession[]>([]);
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load devices from Supabase on component mount
  useEffect(() => {
    async function loadDevices() {
      try {
        const { data, error } = await supabase
          .from('game_devices')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Map database fields to our GameDevice type
          const mappedDevices: GameDevice[] = data.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type,
            deviceId: item.device_id,
            status: item.status as DeviceStatus,
            timerDefault: item.timer_default
          }));
          setDevices(mappedDevices);
        }
      } catch (error: any) {
        console.error("Error loading devices:", error.message);
        toast({
          title: "Error loading devices",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadDevices();
  }, [toast]);

  // Add a new device
  const addDevice = async (deviceData: Omit<GameDevice, "id" | "status">) => {
    try {
      // Map to database schema
      const dbDevice = {
        name: deviceData.name,
        type: deviceData.type,
        device_id: deviceData.deviceId,
        timer_default: deviceData.timerDefault,
        status: "available" as DeviceStatus,
      };
      
      const { data, error } = await supabase
        .from('game_devices')
        .insert([dbDevice])
        .select();
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Map database response to our GameDevice type
        const newDevice: GameDevice = {
          id: data[0].id,
          name: data[0].name,
          type: data[0].type,
          deviceId: data[0].device_id,
          status: data[0].status as DeviceStatus,
          timerDefault: data[0].timer_default
        };
        
        setDevices(prev => [...prev, newDevice]);
        toast({
          title: "Device Added",
          description: `${deviceData.name} has been added successfully.`,
        });
      }
    } catch (error: any) {
      console.error("Error adding device:", error.message);
      toast({
        title: "Error adding device",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Edit an existing device
  const editDevice = async (device: GameDevice) => {
    try {
      // Map to database schema
      const dbDevice = {
        id: device.id,
        name: device.name,
        type: device.type,
        device_id: device.deviceId,
        status: device.status,
        timer_default: device.timerDefault
      };
      
      const { error } = await supabase
        .from('game_devices')
        .update(dbDevice)
        .eq('id', device.id);
      
      if (error) {
        throw error;
      }
      
      setDevices(prev => 
        prev.map(d => d.id === device.id ? device : d)
      );
      
      toast({
        title: "Device Updated",
        description: `${device.name} has been updated successfully.`,
      });
    } catch (error: any) {
      console.error("Error updating device:", error.message);
      toast({
        title: "Error updating device",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Delete a device
  const deleteDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('game_devices')
        .delete()
        .eq('id', deviceId);
      
      if (error) {
        throw error;
      }
      
      setDevices(prev => prev.filter(d => d.id !== deviceId));
      toast({
        title: "Device Deleted",
        description: "Device has been removed successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting device:", error.message);
      toast({
        title: "Error deleting device",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Start a new game session
  const startSession = (deviceId: string, duration: number) => {
    const device = devices.find(d => d.id === deviceId);
    
    if (!device) {
      toast({
        title: "Error",
        description: "Device not found",
        variant: "destructive",
      });
      return;
    }
    
    // Check if device is already in use
    if (device.status !== "available") {
      toast({
        title: "Device Unavailable",
        description: "This device is not available for use",
        variant: "destructive",
      });
      return;
    }
    
    const now = new Date();
    const endTime = new Date(now.getTime() + duration * 60000); // Convert minutes to milliseconds
    
    const newSession: GameSession = {
      deviceId,
      startTime: now,
      duration,
      endTime,
      isPaused: false,
    };
    
    // Update device status
    const updatedDevice = { ...device, status: "inUse" as DeviceStatus };
    
    // Update the database
    updateDeviceStatus(deviceId, "inUse");
    
    setActiveSessions(prev => [...prev, newSession]);
    setDevices(prev => prev.map(d => d.id === deviceId ? updatedDevice : d));
    
    toast({
      title: "Session Started",
      description: `${device.name} session started for ${duration} minutes.`,
    });
  };

  // Stop an active game session
  const stopSession = (deviceId: string) => {
    const session = activeSessions.find(s => s.deviceId === deviceId);
    const device = devices.find(d => d.id === deviceId);
    
    if (!session || !device) {
      return;
    }
    
    const now = new Date();
    const actualDuration = session.isPaused
      ? session.duration - Math.floor((session.pausedTimeRemaining || 0) / 60)
      : Math.floor((now.getTime() - session.startTime.getTime()) / 60000);
    
    // Create log entry
    const logEntry: UsageLog = {
      id: generateId(),
      deviceId,
      deviceName: device.name,
      startTime: session.startTime,
      endTime: now,
      duration: actualDuration,
      completed: now >= session.endTime,
    };
    
    // Update device status
    const updatedDevice = { ...device, status: "available" as DeviceStatus };
    
    // Update the database
    updateDeviceStatus(deviceId, "available");
    
    setUsageLogs(prev => [...prev, logEntry]);
    setActiveSessions(prev => prev.filter(s => s.deviceId !== deviceId));
    setDevices(prev => prev.map(d => d.id === deviceId ? updatedDevice : d));
    
    toast({
      title: "Session Ended",
      description: `${device.name} session has been completed.`,
    });
  };

  // Pause an active session
  const pauseSession = (deviceId: string) => {
    const sessionIndex = activeSessions.findIndex(s => s.deviceId === deviceId);
    
    if (sessionIndex === -1) {
      return;
    }
    
    const session = activeSessions[sessionIndex];
    
    if (session.isPaused) {
      return;
    }
    
    const now = new Date();
    const timeRemainingSec = Math.max(0, Math.floor((session.endTime.getTime() - now.getTime()) / 1000));
    
    const updatedSession = {
      ...session,
      isPaused: true,
      pausedTimeRemaining: timeRemainingSec,
    };
    
    const newSessions = [...activeSessions];
    newSessions[sessionIndex] = updatedSession;
    
    setActiveSessions(newSessions);
    
    toast({
      title: "Session Paused",
      description: `Remaining time: ${Math.floor(timeRemainingSec / 60)} minutes, ${timeRemainingSec % 60} seconds.`,
    });
  };

  // Resume a paused session
  const resumeSession = (deviceId: string) => {
    const sessionIndex = activeSessions.findIndex(s => s.deviceId === deviceId);
    
    if (sessionIndex === -1) {
      return;
    }
    
    const session = activeSessions[sessionIndex];
    
    if (!session.isPaused) {
      return;
    }
    
    const now = new Date();
    const remainingMs = (session.pausedTimeRemaining || 0) * 1000;
    const newEndTime = new Date(now.getTime() + remainingMs);
    
    const updatedSession = {
      ...session,
      isPaused: false,
      endTime: newEndTime,
      pausedTimeRemaining: undefined,
    };
    
    const newSessions = [...activeSessions];
    newSessions[sessionIndex] = updatedSession;
    
    setActiveSessions(newSessions);
    
    toast({
      title: "Session Resumed",
      description: `Session will end at ${newEndTime.toLocaleTimeString()}.`,
    });
  };

  // Extend an active session
  const extendSession = (deviceId: string, additionalMinutes: number) => {
    const sessionIndex = activeSessions.findIndex(s => s.deviceId === deviceId);
    
    if (sessionIndex === -1) {
      return;
    }
    
    const session = activeSessions[sessionIndex];
    let updatedSession;
    
    if (session.isPaused) {
      // If paused, add to the remaining time
      const additionalSeconds = additionalMinutes * 60;
      updatedSession = {
        ...session,
        duration: session.duration + additionalMinutes,
        pausedTimeRemaining: (session.pausedTimeRemaining || 0) + additionalSeconds,
      };
    } else {
      // If not paused, extend the end time
      const newEndTime = new Date(session.endTime.getTime() + additionalMinutes * 60000);
      updatedSession = {
        ...session,
        duration: session.duration + additionalMinutes,
        endTime: newEndTime,
      };
    }
    
    const newSessions = [...activeSessions];
    newSessions[sessionIndex] = updatedSession;
    
    setActiveSessions(newSessions);
    
    toast({
      title: "Session Extended",
      description: `Added ${additionalMinutes} minutes to the session.`,
    });
  };

  // Helper function to update device status in database
  const updateDeviceStatus = async (deviceId: string, status: DeviceStatus) => {
    try {
      await supabase
        .from('game_devices')
        .update({ status })
        .eq('id', deviceId);
    } catch (error) {
      console.error("Error updating device status:", error);
    }
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
    loading
  };

  return (
    <GameZoneContext.Provider value={contextValue}>
      {children}
    </GameZoneContext.Provider>
  );
};

export const useGameZone = () => {
  const context = useContext(GameZoneContext);
  if (!context) {
    throw new Error("useGameZone must be used within a GameZoneProvider");
  }
  return context;
};

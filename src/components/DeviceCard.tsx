
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { GameDevice, GameSession } from "@/types/models";
import { useGameZone } from "@/context/GameZoneContext";
import { formatTime, getStatusClass } from "@/utils/gameUtils";
import TimerControls from "./TimerControls";
import { Play, Pause, Square, Clock } from "lucide-react";

interface DeviceCardProps {
  device: GameDevice;
  onEdit: (device: GameDevice) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onEdit }) => {
  const { 
    activeSessions, 
    startSession, 
    stopSession, 
    pauseSession, 
    resumeSession, 
    extendSession 
  } = useGameZone();
  
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  
  const session = activeSessions.find(s => s.deviceId === device.id);
  
  // Calculate time remaining
  useEffect(() => {
    if (!session) {
      setTimeRemaining(0);
      return;
    }
    
    if (session.isPaused) {
      setTimeRemaining(session.pausedTimeRemaining || 0);
      return;
    }
    
    const intervalId = setInterval(() => {
      const now = new Date();
      const diffMs = session.endTime.getTime() - now.getTime();
      const remainingSecs = Math.max(0, Math.floor(diffMs / 1000));
      setTimeRemaining(remainingSecs);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [session]);
  
  const handleStart = (minutes: number) => {
    startSession(device.id, minutes);
  };
  
  const handleStop = () => {
    stopSession(device.id);
  };
  
  const handlePauseResume = () => {
    if (session?.isPaused) {
      resumeSession(device.id);
    } else {
      pauseSession(device.id);
    }
  };
  
  const handleExtend = (minutes: number) => {
    extendSession(device.id, minutes);
    setShowExtendDialog(false);
  };
  
  const isActive = !!session;
  const isPaused = session?.isPaused;
  
  return (
    <Card className="game-device-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{device.name}</CardTitle>
          <Badge className={getStatusClass(device.status)}>
            {device.status === "available" ? "Available" : 
              device.status === "inUse" ? "In Use" : "Out of Service"}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {device.type}
          {device.deviceId && ` • ID: ${device.deviceId}`}
        </div>
      </CardHeader>
      <CardContent>
        {isActive ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock size={16} />
                <span className="text-sm">Time left:</span>
              </div>
              <div className={`timer-display ${timeRemaining < 60 ? "timer-alert" : ""}`}>
                {formatTime(timeRemaining)}
              </div>
            </div>
            
            <div className="flex justify-between space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handlePauseResume}
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>
              
              <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="flex-1"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Extend
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add time to session</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-2">
                    {[5, 10, 15, 30].map(mins => (
                      <Button 
                        key={mins} 
                        onClick={() => handleExtend(mins)}
                      >
                        +{mins} mins
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="destructive" 
                size="sm"
                className="flex-1"
                onClick={handleStop}
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>
          </div>
        ) : (
          <TimerControls 
            onStart={handleStart}
            defaultTime={device.timerDefault}
            disabled={device.status !== "available"}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DeviceCard;

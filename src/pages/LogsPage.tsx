
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGameZone } from "@/context/GameZoneContext";
import { usePIN } from "@/context/PINContext";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

const LogsPage = () => {
  const { usageLogs, devices, clearUsageLogs } = useGameZone();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | "all">("all");
  const { showPINPrompt } = usePIN();
  const { toast } = useToast();
  
  const filteredLogs = selectedDeviceId === "all"
    ? usageLogs
    : usageLogs.filter(log => log.deviceId === selectedDeviceId);
  
  const sortedLogs = [...filteredLogs].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString();
  };

  const handleClearLogs = () => {
    showPINPrompt(() => {
      if (selectedDeviceId === "all") {
        clearUsageLogs();
        toast({
          title: "Logs Cleared",
          description: "All usage logs have been cleared",
        });
      } else {
        clearUsageLogs(selectedDeviceId);
        toast({
          title: "Logs Cleared",
          description: `Usage logs for selected device have been cleared`,
        });
      }
    }, "Please enter your PIN to clear logs");
  };
  
  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Usage Logs</h1>
          <p className="text-muted-foreground">
            Track device usage and session history
          </p>
        </div>
        <Button 
          variant="destructive" 
          onClick={handleClearLogs}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear Logs
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedDeviceId === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDeviceId("all")}
            >
              All Devices
            </Button>
            
            {devices.map(device => (
              <Button
                key={device.id}
                variant={selectedDeviceId === device.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDeviceId(device.id)}
              >
                {device.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Session History</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedLogs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No usage logs available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.deviceName}</TableCell>
                      <TableCell>{formatDate(log.startTime)}</TableCell>
                      <TableCell>{formatDate(log.endTime)}</TableCell>
                      <TableCell>{log.duration} mins</TableCell>
                      <TableCell>
                        {log.completed ? (
                          <span className="text-gaming-available">Completed</span>
                        ) : (
                          <span className="text-gaming-inUse">Ended early</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsPage;

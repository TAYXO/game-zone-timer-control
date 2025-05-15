
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Settings } from "lucide-react";
import { useGameZone } from "@/context/GameZoneContext";
import DeviceCard from "@/components/DeviceCard";
import DeviceForm from "@/components/DeviceForm";
import { GameDevice } from "@/types/models";

const DevicesPage = () => {
  const { devices } = useGameZone();
  const [showAddForm, setShowAddForm] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState<GameDevice | undefined>(undefined);
  
  const handleEditDevice = (device: GameDevice) => {
    setDeviceToEdit(device);
  };
  
  const handleCloseModal = () => {
    setDeviceToEdit(undefined);
  };
  
  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gaming Devices</h1>
          <p className="text-muted-foreground">
            Manage your game zone devices and sessions
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Device
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Status Overview</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <StatusCard 
            title="Available" 
            count={devices.filter(d => d.status === "available").length}
            className="border-gaming-available/30 bg-gaming-available/10"
          />
          <StatusCard 
            title="In Use" 
            count={devices.filter(d => d.status === "inUse").length}
            className="border-gaming-inUse/30 bg-gaming-inUse/10"
          />
          <StatusCard 
            title="Out of Service" 
            count={devices.filter(d => d.status === "outOfService").length}
            className="border-gaming-outOfService/30 bg-gaming-outOfService/10"
          />
        </div>
      </div>
      
      {devices.length === 0 ? (
        <Card className="bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
            <Gamepad className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="font-medium text-lg">No devices added yet</h3>
              <p className="text-muted-foreground">
                Start by adding your gaming devices to manage them
              </p>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Device
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <DeviceCard 
              key={device.id} 
              device={device}
              onEdit={() => handleEditDevice(device)} 
            />
          ))}
        </div>
      )}
      
      {/* Add device form */}
      <DeviceForm 
        open={showAddForm} 
        onOpenChange={setShowAddForm} 
      />
      
      {/* Edit device form */}
      <DeviceForm 
        open={!!deviceToEdit} 
        onOpenChange={handleCloseModal} 
        editDevice={deviceToEdit} 
      />
    </div>
  );
};

// Status card component
interface StatusCardProps {
  title: string;
  count: number;
  className?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, count, className }) => {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="text-sm font-medium mb-1">{title}</div>
        <div className="text-2xl font-bold">{count}</div>
      </CardContent>
    </Card>
  );
};

// Gamepad icon component
const Gamepad = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="6" y1="12" x2="10" y2="12" />
    <line x1="8" y1="10" x2="8" y2="14" />
    <line x1="15" y1="13" x2="15.01" y2="13" />
    <line x1="18" y1="11" x2="18.01" y2="11" />
    <rect x="2" y="6" width="20" height="12" rx="2" />
  </svg>
);

export default DevicesPage;

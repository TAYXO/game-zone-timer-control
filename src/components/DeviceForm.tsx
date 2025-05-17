
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GameDevice } from "@/types/models";
import { useToast } from "@/components/ui/use-toast";
import { useGameZone } from "@/context/GameZoneContext";
import { Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeviceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editDevice?: GameDevice;
}

const DeviceForm: React.FC<DeviceFormProps> = ({ 
  open, 
  onOpenChange, 
  editDevice 
}) => {
  const [name, setName] = React.useState(editDevice?.name || "");
  const [type, setType] = React.useState(editDevice?.type || "console");
  const [deviceId, setDeviceId] = React.useState(editDevice?.deviceId || "");
  const [timerDefault, setTimerDefault] = React.useState(
    editDevice?.timerDefault.toString() || "30"
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  
  const { addDevice, editDevice: updateDevice, deleteDevice } = useGameZone();
  const { toast } = useToast();
  
  React.useEffect(() => {
    if (open) {
      setName(editDevice?.name || "");
      setType(editDevice?.type || "console");
      setDeviceId(editDevice?.deviceId || "");
      setTimerDefault(editDevice?.timerDefault.toString() || "30");
    }
  }, [open, editDevice]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Device name is required.",
        variant: "destructive",
      });
      return;
    }
    
    if (editDevice) {
      // Update existing device
      updateDevice({
        ...editDevice,
        name,
        type,
        deviceId: deviceId.trim() || undefined,
        timerDefault: parseInt(timerDefault)
      });
    } else {
      // Add new device
      addDevice({
        name,
        type,
        deviceId: deviceId.trim() || undefined,
        timerDefault: parseInt(timerDefault)
      });
    }
    
    onOpenChange(false);
  };
  
  const handleDeleteDevice = () => {
    if (editDevice) {
      deleteDevice(editDevice.id);
      onOpenChange(false);
    }
  };
  
  const deviceTypes = [
    { value: "console", label: "Console" },
    { value: "arcade", label: "Arcade" },
    { value: "vr", label: "VR" },
    { value: "pc", label: "PC" },
    { value: "racing", label: "Racing Rig" },
    { value: "other", label: "Other" }
  ];
  
  const timeOptions = [5, 15, 30, 45, 60, 90, 120];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editDevice ? "Edit Device" : "Add New Device"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Device Name</Label>
              <Input
                id="name"
                placeholder="PS5, Xbox, Racing Rig..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Device Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  {deviceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deviceId">
                Device ID/QR Code (Optional)
              </Label>
              <Input
                id="deviceId"
                placeholder="Optional identifier"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timerDefault">Default Timer (minutes)</Label>
              <Select 
                value={timerDefault} 
                onValueChange={setTimerDefault}
              >
                <SelectTrigger id="timerDefault">
                  <SelectValue placeholder="Select default time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time.toString()}>
                      {time} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <div>
              {editDevice && (
                <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      type="button" 
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the device
                        and remove it from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteDevice}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editDevice ? "Save Changes" : "Add Device"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceForm;

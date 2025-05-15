
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play } from "lucide-react";

interface TimerControlsProps {
  onStart: (minutes: number) => void;
  defaultTime?: number;
  disabled?: boolean;
}

const TimerControls: React.FC<TimerControlsProps> = ({ 
  onStart, 
  defaultTime = 30,
  disabled = false
}) => {
  const [selectedTime, setSelectedTime] = useState<number>(defaultTime);
  
  const timeOptions = [5, 15, 30, 45, 60, 90, 120];
  
  const handleTimeChange = (value: string) => {
    setSelectedTime(parseInt(value));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Select
          value={selectedTime.toString()}
          onValueChange={handleTimeChange}
          disabled={disabled}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select time" />
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
      
      <Button 
        className="w-full" 
        onClick={() => onStart(selectedTime)}
        disabled={disabled}
      >
        <Play className="mr-2 h-4 w-4" />
        Start Session
      </Button>
    </div>
  );
};

export default TimerControls;


import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { GameDevice, GameSession } from "@/types/models";
import { useGameZone } from "@/context/GameZoneContext";
import { usePOS } from "@/context/POSContext";
import { formatTime, getStatusClass } from "@/utils/gameUtils";
import TimerControls from "./TimerControls";
import { Play, Pause, Square, Clock, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  
  const { products, addToCart, processTransaction } = usePOS();
  
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  
  const session = activeSessions.find(s => s.deviceId === device.id);
  const gameTimeProducts = products.filter(p => p.category === 'gameTime');
  
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
    if (!selectedProduct) {
      setShowPaymentDialog(true);
      return;
    }
    
    // Process the transaction first
    const product = products.find(p => p.id === selectedProduct);
    if (product) {
      addToCart(product);
      processTransaction(paymentMethod, customerName || undefined);
      
      // Then start the session
      startSession(device.id, product.duration || minutes);
      
      // Reset dialog states
      setSelectedProduct("");
      setCustomerName("");
      setShowPaymentDialog(false);
    }
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
    // Find appropriate product for extension
    const extensionProduct = gameTimeProducts.find(p => p.duration === minutes);
    
    if (extensionProduct) {
      addToCart(extensionProduct);
      processTransaction(paymentMethod, customerName || undefined);
      extendSession(device.id, minutes);
    } else {
      // Just extend the session if no matching product
      extendSession(device.id, minutes);
    }
    
    setShowExtendDialog(false);
  };
  
  const handlePaymentSubmit = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (product) {
      addToCart(product);
      processTransaction(paymentMethod, customerName || undefined);
      
      // Start the session
      startSession(device.id, product.duration || 30); // Default to 30 min if no duration
      
      // Reset dialog states
      setSelectedProduct("");
      setCustomerName("");
      setShowPaymentDialog(false);
    }
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
                  
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium">Select time package:</label>
                      <Select 
                        value={selectedProduct} 
                        onValueChange={setSelectedProduct}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a package" />
                        </SelectTrigger>
                        <SelectContent>
                          {gameTimeProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - ${product.price.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Customer name (optional):</label>
                      <Input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Payment method:</label>
                      <Select 
                        value={paymentMethod} 
                        onValueChange={(value) => setPaymentMethod(value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="mobile">Mobile Payment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
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
          <div>
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start Gaming Session</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Select time package:</label>
                    <Select 
                      value={selectedProduct} 
                      onValueChange={setSelectedProduct}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a package" />
                      </SelectTrigger>
                      <SelectContent>
                        {gameTimeProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ${product.price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Customer name (optional):</label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Payment method:</label>
                    <Select 
                      value={paymentMethod} 
                      onValueChange={(value) => setPaymentMethod(value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="mobile">Mobile Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button onClick={() => setShowPaymentDialog(false)} variant="outline">Cancel</Button>
                  <Button onClick={handlePaymentSubmit}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Pay and Start Session
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button 
              className="w-full" 
              onClick={() => setShowPaymentDialog(true)}
              disabled={device.status !== "available"}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Start New Session
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeviceCard;

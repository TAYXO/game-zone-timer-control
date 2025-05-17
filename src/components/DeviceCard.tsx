
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
import { Play, Pause, Square, Clock, DollarSign, Plus, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  
  const { products, addProduct, addToCart, processTransaction } = usePOS();
  
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [customDuration, setCustomDuration] = useState<number>(30);
  const [customPrice, setCustomPrice] = useState<number>(5);
  const [selectedTab, setSelectedTab] = useState<string>("packages");
  
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
    if (selectedTab === "packages" && !selectedProduct) {
      setShowPaymentDialog(true);
      return;
    }
    
    if (selectedTab === "custom") {
      // Create a custom product
      const customProductData = {
        name: `${customDuration} Minutes - Custom`,
        price: customPrice,
        category: 'gameTime' as const,
        deviceId: device.id,
        duration: customDuration
      };
      
      // Add to products
      addProduct(customProductData).then((newProduct) => {
        if (newProduct) {
          addToCart(newProduct);
          processTransaction(paymentMethod, customerName || undefined);
          startSession(device.id, customDuration);
        }
      });
    } else {
      // Process selected product
      const product = products.find(p => p.id === selectedProduct);
      if (product) {
        addToCart(product);
        processTransaction(paymentMethod, customerName || undefined);
        startSession(device.id, product.duration || minutes);
      }
    }
    
    // Reset dialog states
    setSelectedProduct("");
    setCustomDuration(30);
    setCustomPrice(5);
    setCustomerName("");
    setSelectedTab("packages");
    setShowPaymentDialog(false);
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
    if (selectedTab === "custom") {
      // Create a custom product for extension
      const customProductData = {
        name: `${customDuration} Minutes Extension - Custom`,
        price: customPrice,
        category: 'gameTime' as const,
        deviceId: device.id,
        duration: customDuration
      };
      
      // Add to products
      addProduct(customProductData).then((newProduct) => {
        if (newProduct) {
          addToCart(newProduct);
          processTransaction(paymentMethod, customerName || undefined);
          extendSession(device.id, customDuration);
        }
      });
    } else {
      // Find appropriate product for extension
      const extensionProduct = gameTimeProducts.find(p => p.id === selectedProduct);
      
      if (extensionProduct) {
        addToCart(extensionProduct);
        processTransaction(paymentMethod, customerName || undefined);
        extendSession(device.id, extensionProduct.duration || minutes);
      } else if (minutes > 0) {
        // Just extend the session if no matching product but minutes provided
        extendSession(device.id, minutes);
      }
    }
    
    setShowExtendDialog(false);
    setSelectedTab("packages");
    setSelectedProduct("");
    setCustomDuration(30);
    setCustomPrice(5);
  };
  
  const handlePaymentSubmit = () => {
    if (selectedTab === "custom") {
      // Create a custom product
      const customProductData = {
        name: `${customDuration} Minutes - Custom`,
        price: customPrice,
        category: 'gameTime' as const,
        deviceId: device.id,
        duration: customDuration
      };
      
      // Add to products
      addProduct(customProductData);
      
      // Start the session
      startSession(device.id, customDuration);
    } else {
      const product = products.find(p => p.id === selectedProduct);
      if (product) {
        addToCart(product);
        processTransaction(paymentMethod, customerName || undefined);
        
        // Start the session
        startSession(device.id, product.duration || 30);
      }
    }
    
    // Reset dialog states
    setSelectedProduct("");
    setCustomDuration(30);
    setCustomPrice(5);
    setCustomerName("");
    setSelectedTab("packages");
    setShowPaymentDialog(false);
  };
  
  const isActive = !!session;
  const isPaused = session?.isPaused;
  
  return (
    <Card className="game-device-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{device.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getStatusClass(device.status)}>
              {device.status === "available" ? "Available" : 
                device.status === "inUse" ? "In Use" : "Out of Service"}
            </Badge>
            {device.status !== "inUse" && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => onEdit(device)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
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
                  
                  <Tabs 
                    defaultValue="packages" 
                    value={selectedTab} 
                    onValueChange={setSelectedTab}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-2 mb-4">
                      <TabsTrigger value="packages">Time Packages</TabsTrigger>
                      <TabsTrigger value="custom">Custom Price</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="packages" className="space-y-4">
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
                    </TabsContent>
                    
                    <TabsContent value="custom" className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Duration (minutes):</label>
                        <Input
                          type="number"
                          value={customDuration}
                          onChange={(e) => setCustomDuration(Number(e.target.value))}
                          min={5}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Price ($):</label>
                        <Input
                          type="number"
                          value={customPrice}
                          onChange={(e) => setCustomPrice(Number(e.target.value))}
                          min={1}
                          step={0.01}
                          className="mt-1"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div>
                    <label className="text-sm font-medium">Customer name (optional):</label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                      className="mt-1"
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
                  
                  <DialogFooter>
                    <Button onClick={() => setShowExtendDialog(false)} variant="outline">Cancel</Button>
                    <Button onClick={() => handleExtend(0)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time
                    </Button>
                  </DialogFooter>
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
                
                <Tabs 
                  defaultValue="packages" 
                  value={selectedTab} 
                  onValueChange={setSelectedTab}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="packages">Time Packages</TabsTrigger>
                    <TabsTrigger value="custom">Custom Price</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="packages" className="space-y-4">
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
                  </TabsContent>
                  
                  <TabsContent value="custom" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Duration (minutes):</label>
                      <Input
                        type="number"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(Number(e.target.value))}
                        min={5}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Price ($):</label>
                      <Input
                        type="number"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(Number(e.target.value))}
                        min={1}
                        step={0.01}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="space-y-4 mt-4">
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

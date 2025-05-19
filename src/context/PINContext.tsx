
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const PIN_KEY = "app_pin";
const PIN_LAST_ACTIVITY = "last_activity";
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

interface PINContextType {
  isLocked: boolean;
  isPINSet: boolean;
  validatePIN: (pin: string) => boolean;
  setPIN: (pin: string) => void;
  lockScreen: () => void;
  unlockScreen: (pin: string) => boolean;
  showPINPrompt: (action: () => void, message: string) => void;
}

interface PINPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const PINContext = createContext<PINContextType | undefined>(undefined);

// PIN Prompt component
const PINPrompt: React.FC<PINPromptProps> = ({ isOpen, onClose, onConfirm, message }) => {
  const [pin, setPin] = useState("");
  const { validatePIN } = usePIN();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (validatePIN(pin)) {
      onConfirm();
      onClose();
    } else {
      toast({
        title: "Invalid PIN",
        description: "The PIN you entered is incorrect",
        variant: "destructive",
      });
      setPin("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setPin("");
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm with PIN</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <InputOTP
            maxLength={4}
            value={pin}
            onChange={setPin}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, index) => (
                  <InputOTPSlot key={index} {...slot} index={index} />
                ))}
              </InputOTPGroup>
            )}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={pin.length < 4}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const usePIN = () => {
  const context = useContext(PINContext);
  if (!context) {
    throw new Error("usePIN must be used within a PINProvider");
  }
  return context;
};

export const PINProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [isPINSet, setIsPINSet] = useState(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [pinPromptOpen, setPinPromptOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [promptMessage, setPromptMessage] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if PIN exists and set initial state
  useEffect(() => {
    const storedPIN = localStorage.getItem(PIN_KEY);
    const pinSet = !!storedPIN;
    setIsPINSet(pinSet);
    
    // If PIN is not set and not on PIN page, redirect to PIN management
    if (!pinSet && location.pathname !== "/pin-management" && location.pathname !== "/lock") {
      navigate("/pin-management");
      toast({
        title: "PIN Setup Required",
        description: "Please set up a PIN to secure your application",
      });
    }
    
    // If PIN is not set, don't lock the screen
    if (!pinSet) {
      setIsLocked(false);
    }
  }, [location.pathname]);
  
  // Track user activity
  useEffect(() => {
    const updateLastActivity = () => {
      const now = Date.now();
      localStorage.setItem(PIN_LAST_ACTIVITY, now.toString());
      setLastActivity(now);
    };
    
    // Monitor user activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateLastActivity);
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateLastActivity);
      });
    };
  }, []);
  
  // Check for inactivity
  useEffect(() => {
    if (!isPINSet) return;
    
    const checkInactivity = () => {
      const lastActivityTime = parseInt(localStorage.getItem(PIN_LAST_ACTIVITY) || Date.now().toString());
      const now = Date.now();
      
      if (now - lastActivityTime > INACTIVITY_TIMEOUT && !isLocked) {
        lockScreen();
        toast({
          title: "Screen Locked",
          description: "The application has been locked due to inactivity",
        });
      }
    };
    
    const interval = setInterval(checkInactivity, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [isPINSet, isLocked, toast]);
  
  const validatePIN = (pin: string): boolean => {
    const storedPIN = localStorage.getItem(PIN_KEY);
    return pin === storedPIN;
  };
  
  const setPIN = (pin: string) => {
    localStorage.setItem(PIN_KEY, pin);
    setIsPINSet(true);
    setIsLocked(false);
    toast({
      title: "PIN Set",
      description: "Your PIN has been set successfully",
    });
  };
  
  const lockScreen = () => {
    if (isPINSet) {
      setIsLocked(true);
      navigate('/lock', { state: { from: location.pathname } });
    }
  };
  
  const unlockScreen = (pin: string): boolean => {
    const isValid = validatePIN(pin);
    if (isValid) {
      setIsLocked(false);
      localStorage.setItem(PIN_LAST_ACTIVITY, Date.now().toString());
    } else {
      toast({
        title: "Invalid PIN",
        description: "The PIN you entered is incorrect",
        variant: "destructive",
      });
    }
    return isValid;
  };

  const showPINPrompt = (action: () => void, message: string) => {
    setPendingAction(() => action);
    setPromptMessage(message);
    setPinPromptOpen(true);
  };

  const handlePinPromptClose = () => {
    setPinPromptOpen(false);
    setPendingAction(null);
    setPromptMessage("");
  };

  const handlePinPromptConfirm = () => {
    if (pendingAction) {
      pendingAction();
    }
  };

  const value = {
    isLocked,
    isPINSet,
    validatePIN,
    setPIN,
    lockScreen,
    unlockScreen,
    showPINPrompt,
  };

  return (
    <PINContext.Provider value={value}>
      {children}
      <PINPrompt
        isOpen={pinPromptOpen}
        onClose={handlePinPromptClose}
        onConfirm={handlePinPromptConfirm}
        message={promptMessage}
      />
    </PINContext.Provider>
  );
};

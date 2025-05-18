
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
}

const PINContext = createContext<PINContextType | undefined>(undefined);

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
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if PIN exists and set initial state
  useEffect(() => {
    const storedPIN = localStorage.getItem(PIN_KEY);
    const pinSet = !!storedPIN;
    setIsPINSet(pinSet);
    
    // If PIN is not set, don't lock the screen
    if (!pinSet) {
      setIsLocked(false);
    }
  }, []);
  
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
      navigate('/lock');
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

  const value = {
    isLocked,
    isPINSet,
    validatePIN,
    setPIN,
    lockScreen,
    unlockScreen,
  };

  return <PINContext.Provider value={value}>{children}</PINContext.Provider>;
};

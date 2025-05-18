
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePIN } from "@/context/PINContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Lock } from "lucide-react";

const PINLockPage: React.FC = () => {
  const [pin, setPin] = useState("");
  const [setupMode, setSetupMode] = useState(false);
  const [confirmPin, setConfirmPin] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const { isPINSet, unlockScreen, setPIN } = usePIN();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  useEffect(() => {
    // If no PIN is set, go into setup mode
    if (!isPINSet) {
      setSetupMode(true);
    }
  }, [isPINSet]);

  const handlePinSubmit = () => {
    if (setupMode) {
      if (!showConfirm) {
        setShowConfirm(true);
        return;
      } else {
        if (pin === confirmPin) {
          setPIN(pin);
          navigate(from);
        } else {
          setPin("");
          setConfirmPin("");
          setShowConfirm(false);
        }
      }
    } else {
      if (unlockScreen(pin)) {
        navigate(from);
      } else {
        setPin("");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <CardTitle>
            {setupMode
              ? showConfirm
                ? "Confirm PIN"
                : "Create PIN"
              : "Enter PIN"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <InputOTP
              maxLength={4}
              value={showConfirm ? confirmPin : pin}
              onChange={showConfirm ? setConfirmPin : setPin}
              render={({ slots }) => (
                <InputOTPGroup>
                  {slots.map((slot, index) => (
                    <InputOTPSlot key={index} {...slot} index={index} />
                  ))}
                </InputOTPGroup>
              )}
            />

            <Button 
              className="w-full" 
              onClick={handlePinSubmit}
              disabled={(showConfirm ? confirmPin.length < 4 : pin.length < 4)}
            >
              {setupMode
                ? showConfirm
                  ? "Set PIN"
                  : "Next"
                : "Unlock"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PINLockPage;

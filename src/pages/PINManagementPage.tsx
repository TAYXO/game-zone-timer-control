
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePIN } from "@/context/PINContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Shield, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const PINManagementPage: React.FC = () => {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [stage, setStage] = useState<"current" | "new" | "confirm">("current");
  const { validatePIN, setPIN, isPINSet } = usePIN();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // If no PIN is set, go directly to new PIN stage
    if (!isPINSet) {
      setStage("new");
    }
  }, [isPINSet]);

  const handleVerifyCurrentPIN = () => {
    if (validatePIN(currentPin)) {
      setStage("new");
      toast({
        title: "PIN Verified",
        description: "Please enter your new PIN",
      });
    } else {
      toast({
        title: "Invalid PIN",
        description: "The current PIN you entered is incorrect",
        variant: "destructive",
      });
      setCurrentPin("");
    }
  };

  const handleSetNewPIN = () => {
    if (stage === "new") {
      setStage("confirm");
    } else if (stage === "confirm") {
      if (newPin === confirmPin) {
        setPIN(newPin);
        toast({
          title: "PIN Updated",
          description: "Your PIN has been successfully updated",
        });
        navigate("/");
      } else {
        toast({
          title: "PIN Mismatch",
          description: "The PINs you entered do not match. Please try again.",
          variant: "destructive",
        });
        setNewPin("");
        setConfirmPin("");
        setStage("new");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="container flex items-center justify-center py-10">
        <Card className="w-[400px]">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              {stage === "confirm" ? (
                <ShieldCheck className="h-10 w-10 text-primary" />
              ) : (
                <Shield className="h-10 w-10 text-primary" />
              )}
            </div>
            <CardTitle>
              {isPINSet
                ? stage === "current"
                  ? "Enter Current PIN"
                  : stage === "new"
                  ? "Enter New PIN"
                  : "Confirm New PIN"
                : stage === "new"
                ? "Create New PIN"
                : "Confirm New PIN"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6">
              {stage === "current" && isPINSet && (
                <>
                  <InputOTP
                    maxLength={4}
                    value={currentPin}
                    onChange={setCurrentPin}
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
                    onClick={handleVerifyCurrentPIN}
                    disabled={currentPin.length < 4}
                  >
                    Verify PIN
                  </Button>
                </>
              )}

              {stage === "new" && (
                <>
                  <InputOTP
                    maxLength={4}
                    value={newPin}
                    onChange={setNewPin}
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
                    onClick={handleSetNewPIN}
                    disabled={newPin.length < 4}
                  >
                    Next
                  </Button>
                </>
              )}

              {stage === "confirm" && (
                <>
                  <InputOTP
                    maxLength={4}
                    value={confirmPin}
                    onChange={setConfirmPin}
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
                    onClick={handleSetNewPIN}
                    disabled={confirmPin.length < 4}
                  >
                    Set PIN
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PINManagementPage;

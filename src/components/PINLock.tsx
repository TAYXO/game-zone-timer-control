
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PINLockProps {
  onPINSubmit: (pin: string) => void;
}

const PINLock: React.FC<PINLockProps> = ({ onPINSubmit }) => {
  const [pin, setPin] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (pin.length === 4) {
      onPINSubmit(pin);
    } else {
      toast({
        title: 'Invalid PIN',
        description: 'Please enter a 4-digit PIN',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <CardTitle>Enter PIN</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
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

            <Button 
              className="w-full" 
              onClick={handleSubmit}
              disabled={pin.length < 4}
            >
              Unlock
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PINLock;

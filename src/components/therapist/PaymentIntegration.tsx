import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Shield, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentIntegrationProps {
  sessionId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentIntegration = ({ sessionId, amount, onSuccess, onCancel }: PaymentIntegrationProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would integrate with Stripe
      // const response = await supabase.functions.invoke('create-payment', {
      //   body: { sessionId, amount }
      // });
      
      toast({
        title: "Payment Successful!",
        description: "Your therapy session has been booked and confirmed.",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "There was an issue processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Payment Summary</h4>
            <Badge variant="secondary">Session ID: {sessionId.slice(0, 8)}</Badge>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session fee:</span>
              <span>${amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Processing fee:</span>
              <span>$2.99</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${(amount + 2.99).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Shield className="h-4 w-4" />
            <span>Secure payment powered by Stripe</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full"
              size="lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isProcessing ? "Processing..." : `Pay $${(amount + 2.99).toFixed(2)}`}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isProcessing}
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Your payment information is secure and encrypted</span>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          By completing this payment, you agree to our terms of service and cancellation policy.
        </p>
      </div>
    </div>
  );
};

export default PaymentIntegration;
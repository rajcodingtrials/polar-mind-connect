import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Shield, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentIntegrationProps {
  sessionId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentIntegration = ({ sessionId, amount, onSuccess, onCancel }: PaymentIntegrationProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Calculate amount in cents
      const totalAmount = Math.round((amount + 2.99) * 100);
      
      const baseUrl = window.location.origin;
      
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          amount: totalAmount,
          currency: "usd",
          description: `Therapy Session - Session ID: ${sessionId.slice(0, 8)}`,
          customer_email: user.email,
          success_url: `${baseUrl}/payment-success?session_id=${sessionId}`,
          cancel_url: `${baseUrl}/payment-cancelled?session_id=${sessionId}`,
          metadata: {
            user_id: user.id,
            session_id: sessionId,
          }
        }
      });

      if (error) throw error;

      console.log("Full Stripe response:", data);
      console.log("Checkout URL:", data?.checkout_url);

      if (data?.checkout_url) {
        console.log("Attempting redirect to:", data.checkout_url);
        
        // Store URL for fallback
        setFallbackUrl(data.checkout_url);
        
        // Redirect to Stripe Checkout
        window.location.href = data.checkout_url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "There was an issue processing your payment. Please try again.",
        variant: "destructive",
      });
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
              {isProcessing ? "Redirecting to Stripe..." : `Pay $${(amount + 2.99).toFixed(2)}`}
            </Button>
            
            {fallbackUrl && (
              <div className="text-center text-sm">
                <p className="text-muted-foreground mb-2">Not redirected automatically?</p>
                <Button 
                  onClick={() => window.open(fallbackUrl, '_blank')}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Click here to complete payment
                </Button>
              </div>
            )}
            
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
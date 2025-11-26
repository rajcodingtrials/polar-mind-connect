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
  type?: 'session' | 'lesson';
  description?: string;
}

const PaymentIntegration = ({ sessionId, amount, onSuccess, onCancel, type = 'session', description }: PaymentIntegrationProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePayment = async () => {
    console.log("🔵 handlePayment called");
    console.log("Session ID:", sessionId);
    console.log("Amount:", amount);
    
    setIsProcessing(true);
    console.log("🔵 isProcessing set to true");
    
    try {
      console.log("🔵 Getting user...");
      const { data: { user } } = await supabase.auth.getUser();
      console.log("🔵 User:", user?.email);
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Calculate amount in cents
      const totalAmount = Math.round((amount + 2.99) * 100);
      console.log("🔵 Total amount in cents:", totalAmount);
      
      const baseUrl = window.location.origin;
      console.log("🔵 Base URL:", baseUrl);
      
      const defaultDescription = type === 'lesson' 
        ? `Lesson Purchase - Lesson ID: ${sessionId.slice(0, 8)}`
        : `Therapy Session - Session ID: ${sessionId.slice(0, 8)}`;
      
      const requestBody = {
        amount: totalAmount,
        currency: "usd",
        description: description || defaultDescription,
        customer_email: user.email,
        success_url: `${baseUrl}/payment-success?${type === 'lesson' ? 'lesson_id' : 'session_id'}=${sessionId}`,
        cancel_url: `${baseUrl}/payment-cancelled?${type === 'lesson' ? 'lesson_id' : 'session_id'}=${sessionId}`,
        metadata: {
          user_id: user.id,
          [type === 'lesson' ? 'lesson_id' : 'session_id']: sessionId,
          purchase_type: type,
        }
      };
      console.log("🔵 Request body:", requestBody);
      
      console.log("🔵 Calling create-stripe-checkout edge function...");
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: requestBody
      });
      console.log("🔵 Edge function response received");
      console.log("🔵 Data:", data);
      console.log("🔵 Error:", error);

      if (error) {
        console.error("🔴 Edge function error:", error);
        throw error;
      }

      console.log("🔵 Full Stripe response:", data);
      console.log("🔵 Checkout URL:", data?.checkout_url);

      if (data?.checkout_url) {
        console.log("🔵 Attempting redirect to:", data.checkout_url);
        
        // Store URL for fallback
        setFallbackUrl(data.checkout_url);
        console.log("🔵 Fallback URL set");
        
        // Redirect to Stripe Checkout
        console.log("🔵 Redirecting via window.location.href...");
        window.location.href = data.checkout_url;
        console.log("🔵 Redirect initiated");
      } else {
        console.error("🔴 No checkout URL in response");
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("🔴 Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "There was an issue processing your payment. Please try again.",
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
            <Badge variant="secondary">
              {type === 'lesson' ? 'Lesson' : 'Session'} ID: {sessionId.slice(0, 8)}
            </Badge>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {type === 'lesson' ? 'Lesson price:' : 'Session fee:'}
              </span>
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
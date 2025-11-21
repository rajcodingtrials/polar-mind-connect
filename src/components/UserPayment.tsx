import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Shield, Lock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface UserPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  fixedAmount?: number;
  description?: string;
}

const UserPayment = ({ isOpen, onClose, fixedAmount = 50, description = "Payment" }: UserPaymentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState(fixedAmount.toString());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to make a payment.",
      });
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create a Stripe Checkout session via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          amount: Math.round(paymentAmount * 100), // Convert to cents
          currency: 'usd',
          description: description,
          customer_email: user.email,
          success_url: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/payment-cancelled`,
          metadata: {
            user_id: user.id,
            payment_type: 'fixed_payment',
          },
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        // Check if it's a function not found error
        if (error.message?.includes('Function not found') || error.message?.includes('failed to send')) {
          throw new Error("Payment service is not available. Please contact support or try again later.");
        }
        throw error;
      }

      if (!data) {
        throw new Error("No response from payment service");
      }

      if (data.error) {
        throw new Error(data.error || "Payment service error");
      }

      if (data.checkout_url) {
        setIsRedirecting(true);
        // Redirect to Stripe Checkout
        window.location.href = data.checkout_url;
      } else {
        throw new Error("No checkout URL returned from payment service");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      const errorMessage = error.message || error.error?.message || "There was an issue processing your payment. Please try again.";
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: errorMessage,
      });
      setIsProcessing(false);
      setIsRedirecting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Make a Payment
          </DialogTitle>
          <DialogDescription>
            Complete your payment securely using Stripe Connect
          </DialogDescription>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Payment Details</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className="pl-8"
                  disabled={isProcessing || isRedirecting}
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">${parseFloat(amount || "0").toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing fee:</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${parseFloat(amount || "0").toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secure payment powered by Stripe Connect</span>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isProcessing || isRedirecting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={isProcessing || isRedirecting || !amount || parseFloat(amount || "0") <= 0}
                className="flex-1"
                size="lg"
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Redirecting...
                  </>
                ) : isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay ${parseFloat(amount || "0").toFixed(2)}
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
              <Lock className="h-3 w-3" />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default UserPayment;


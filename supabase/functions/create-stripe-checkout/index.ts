import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StripeCheckoutRequest {
  amount: number; // Amount in cents
  currency?: string;
  description?: string;
  customer_email?: string;
  success_url: string;
  cancel_url: string;
  metadata?: Record<string, string>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      amount,
      currency = "usd",
      description = "Payment",
      customer_email,
      success_url,
      cancel_url,
      metadata = {},
    }: StripeCheckoutRequest = await req.json();

    // Validate amount
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Stripe Checkout Session with line_items
    const params = new URLSearchParams({
      "payment_method_types[]": "card",
      "mode": "payment",
      "success_url": success_url,
      "cancel_url": cancel_url,
      "line_items[0][price_data][currency]": currency,
      "line_items[0][price_data][unit_amount]": amount.toString(),
      "line_items[0][price_data][product_data][name]": description,
      "line_items[0][quantity]": "1",
    });

    if (customer_email) {
      params.append("customer_email", customer_email);
    }

    // Add metadata
    Object.entries(metadata).forEach(([key, value]) => {
      params.append(`metadata[${key}]`, value);
    });

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.text();
      console.error("Stripe API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to create checkout session", details: errorData }),
        { status: stripeResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const session = await stripeResponse.json();

    // Optionally save payment record to database
    if (metadata.user_id) {
      try {
        await supabase.from("payments").insert({
          user_id: metadata.user_id,
          amount: amount / 100, // Convert from cents to dollars
          currency: currency,
          description: description,
          stripe_session_id: session.id,
          status: "pending",
          metadata: metadata,
        });
      } catch (dbError) {
        console.error("Error saving payment record:", dbError);
        // Don't fail the request if database insert fails
      }
    }

    return new Response(
      JSON.stringify({
        checkout_url: session.url,
        session_id: session.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error creating Stripe checkout:", error);
    const errorMessage = error?.message || error?.toString() || "Internal server error";
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error?.stack || undefined
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);


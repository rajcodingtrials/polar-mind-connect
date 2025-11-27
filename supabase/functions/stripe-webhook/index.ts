import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!signature) {
      console.error("No signature provided");
      return new Response(
        JSON.stringify({ error: "No signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.text();
    
    console.log("🔵 Webhook received, signature:", signature?.substring(0, 20) + "...");
    
    // Verify webhook signature using Stripe's standard method
    const encoder = new TextEncoder();
    const timestamp = signature.split(',')[0].split('=')[1];
    const receivedSignature = signature.split(',')[1].split('=')[1];
    const signedPayload = `${timestamp}.${body}`;
    
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const expectedSignature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    );
    
    const expectedHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedHex !== receivedSignature) {
      console.error("❌ Webhook signature verification failed");
      console.error("Expected:", expectedHex.substring(0, 20) + "...");
      console.error("Received:", receivedSignature.substring(0, 20) + "...");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Webhook signature verified");
    const event = JSON.parse(body);
    console.log("Stripe webhook event:", event.type);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Payment successful for session:", session.id);

        // Update payment record
        const { error: paymentError } = await supabase
          .from("payments")
          .update({
            status: "completed",
            stripe_payment_intent_id: session.payment_intent,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_session_id", session.id);

        if (paymentError) {
          console.error("Error updating payment:", paymentError);
        }

        // Update therapy session status and send confirmation emails
        const sessionId = session.metadata?.session_id;
        if (sessionId) {
          // Fetch session details
          const { data: sessionData, error: fetchError } = await supabase
            .from("therapy_sessions")
            .select(`
              *,
              therapists (
                id,
                first_name,
                last_name,
                timezone,
                email
              ),
              profiles:client_id (
                email,
                name
              )
            `)
            .eq("id", sessionId)
            .single();

          if (fetchError) {
            console.error("Error fetching session:", fetchError);
          } else {
            // Update session status
            const { error: sessionError } = await supabase
              .from("therapy_sessions")
              .update({
                payment_status: "completed",
                status: "confirmed",
                updated_at: new Date().toISOString(),
              })
              .eq("id", sessionId);

            if (sessionError) {
              console.error("Error updating therapy session:", sessionError);
            } else {
              console.log("Therapy session confirmed:", sessionId);

              // Create Zoom meeting
              try {
                const { data: zoomData, error: zoomError } = await supabase.functions.invoke('create-zoom-meeting', {
                  body: {
                    sessionId: sessionId,
                    sessionDate: sessionData.session_date,
                    startTime: sessionData.start_time,
                    durationMinutes: sessionData.duration_minutes,
                    therapistName: `${sessionData.therapists.first_name} ${sessionData.therapists.last_name}`,
                    clientName: sessionData.profiles?.name || sessionData.profiles?.email || 'Client',
                    timezone: sessionData.therapists.timezone || 'UTC',
                  }
                });

                if (zoomError) {
                  console.error("Error creating Zoom meeting:", zoomError);
                } else {
                  console.log("Zoom meeting created:", zoomData);
                }
              } catch (zoomErr) {
                console.error("Zoom meeting creation failed:", zoomErr);
              }

              // Send booking confirmation email to client
              try {
                await supabase.functions.invoke('send-booking-confirmation', {
                  body: {
                    sessionId: sessionId,
                    clientEmail: sessionData.profiles?.email || '',
                    clientName: sessionData.profiles?.name || sessionData.profiles?.email || '',
                    therapistName: `${sessionData.therapists.first_name} ${sessionData.therapists.last_name}`,
                    sessionDate: sessionData.session_date,
                    sessionTime: sessionData.start_time,
                    duration: sessionData.duration_minutes,
                    sessionType: sessionData.session_type,
                    price: sessionData.price_paid,
                  }
                });
                console.log("Booking confirmation email sent to client");
              } catch (emailErr) {
                console.error("Error sending client email:", emailErr);
              }

              // Send notification email to therapist
              try {
                await supabase.functions.invoke('send-therapist-notification', {
                  body: {
                    sessionId: sessionId,
                    therapistId: sessionData.therapists.id,
                    clientName: sessionData.profiles?.name || sessionData.profiles?.email || 'New Client',
                    sessionDate: sessionData.session_date,
                    sessionTime: sessionData.start_time,
                    duration: sessionData.duration_minutes,
                    sessionType: sessionData.session_type,
                    amount: sessionData.price_paid,
                    clientNotes: sessionData.client_notes,
                  }
                });
                console.log("Therapist notification email sent");
              } catch (emailErr) {
                console.error("Error sending therapist email:", emailErr);
              }
            }
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log("PaymentIntent succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log("PaymentIntent failed:", paymentIntent.id);

        // Update payment record to failed
        const { error } = await supabase
          .from("payments")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (error) {
          console.error("Error updating payment to failed:", error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);

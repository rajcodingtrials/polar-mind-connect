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
  console.log("🚀 Webhook handler started, method:", req.method);
  
  if (req.method === "OPTIONS") {
    console.log("⚪ OPTIONS request - returning CORS headers");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📥 Processing webhook request...");
    
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    console.log("🔐 Webhook secret exists:", !!webhookSecret);
    console.log("✍️ Signature exists:", !!signature);

    if (!webhookSecret) {
      console.error("❌ STRIPE_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!signature) {
      console.error("❌ No signature provided");
      return new Response(
        JSON.stringify({ error: "No signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.text();
    console.log("📦 Received body length:", body.length);
    console.log("🔵 Webhook received, signature:", signature?.substring(0, 20) + "...");
    
    // Verify webhook signature using Stripe's standard method
    console.log("🔍 Starting signature verification...");
    const encoder = new TextEncoder();
    const timestamp = signature.split(',')[0].split('=')[1];
    const receivedSignature = signature.split(',')[1].split('=')[1];
    const signedPayload = `${timestamp}.${body}`;
    
    console.log("⏰ Timestamp:", timestamp);
    
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

    console.log("✅ Webhook signature verified successfully");
    const event = JSON.parse(body);
    console.log("📨 Stripe webhook event type:", event.type);
    console.log("🆔 Event ID:", event.id);

    // Handle the event
    console.log("🎯 Handling event type:", event.type);
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("💳 Payment successful for session:", session.id);
        console.log("📋 Session metadata:", JSON.stringify(session.metadata));

        // Extract coupon/discount information
        let couponData: Record<string, any> = {};
        if (session.total_details?.amount_discount > 0) {
          console.log("🎟️ Discount detected:", session.total_details.amount_discount);
          couponData = {
            coupon_used: true,
            actual_discount_cents: session.total_details.amount_discount,
          };
          
          // Extract coupon details from discounts array
          if (session.discounts && session.discounts.length > 0) {
            const discount = session.discounts[0];
            console.log("🎟️ Discount details:", JSON.stringify(discount));
            
            if (discount.coupon) {
              couponData.coupon_id = discount.coupon.id;
              couponData.coupon_name = discount.coupon.name;
              couponData.discount_percent = discount.coupon.percent_off;
              couponData.discount_amount_cents = discount.coupon.amount_off;
            }
            if (discount.promotion_code) {
              couponData.promotion_code = discount.promotion_code;
            }
          }
          console.log("🎟️ Coupon data to store:", JSON.stringify(couponData));
        }

        // Fetch existing payment to merge metadata
        const { data: existingPayment } = await supabase
          .from("payments")
          .select("metadata")
          .eq("stripe_session_id", session.id)
          .single();

        const existingMetadata = existingPayment?.metadata || {};
        const mergedMetadata = { ...existingMetadata, ...couponData };

        // Update payment record with coupon data
        console.log("💾 Updating payment record...");
        const { error: paymentError } = await supabase
          .from("payments")
          .update({
            status: "completed",
            stripe_payment_intent_id: session.payment_intent,
            metadata: mergedMetadata,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_session_id", session.id);

        if (paymentError) {
          console.error("❌ Error updating payment:", paymentError);
        } else {
          console.log("✅ Payment record updated successfully with coupon data");
        }

        // Update therapy session status and send confirmation emails
        const sessionId = session.metadata?.session_id;
        console.log("🔍 Looking for therapy session ID:", sessionId);
        
        if (sessionId) {
          console.log("📥 Fetching therapy session details...");
          // Fetch session details (explicitly include client_notes)
          const { data: sessionData, error: fetchError } = await supabase
            .from("therapy_sessions")
            .select(`
              *,
              client_notes,
              therapists (
                id,
                first_name,
                last_name,
                timezone,
                email
              )
            `)
            .eq("id", sessionId)
            .single();

          if (fetchError) {
            console.error("❌ Error fetching session:", fetchError);
          } else {
            console.log("✅ Session data fetched:", JSON.stringify(sessionData));
            
            // Fetch client profile separately to ensure correct email
            const { data: clientProfile, error: profileError } = await supabase
              .from("profiles")
              .select("id, email, name")
              .eq("id", sessionData.client_id)
              .single();
            
            if (profileError) {
              console.error("❌ Error fetching client profile:", profileError);
            }
            
            console.log("📧 Client profile fetched:", JSON.stringify(clientProfile));
            console.log("📧 Client email:", clientProfile?.email);
            console.log("👨‍⚕️ Therapist email:", sessionData.therapists?.email);
            
            // Update session status
            console.log("💾 Updating therapy session status...");
            const { error: sessionError } = await supabase
              .from("therapy_sessions")
              .update({
                payment_status: "paid",
                status: "confirmed",
                updated_at: new Date().toISOString(),
              })
              .eq("id", sessionId);

            if (sessionError) {
              console.error("❌ Error updating therapy session:", sessionError);
            } else {
              console.log("✅ Therapy session confirmed:", sessionId);

              // Create Zoom meeting
              console.log("🎥 Creating Zoom meeting...");
              try {
                const { data: zoomData, error: zoomError } = await supabase.functions.invoke('create-zoom-meeting', {
                  body: {
                    sessionId: sessionId,
                    sessionDate: sessionData.session_date,
                    startTime: sessionData.start_time,
                    durationMinutes: sessionData.duration_minutes,
                    therapistName: `${sessionData.therapists.first_name} ${sessionData.therapists.last_name}`,
                    clientName: clientProfile?.name || clientProfile?.email || 'Client',
                    timezone: sessionData.therapists.timezone || 'UTC',
                  }
                });

                if (zoomError) {
                  console.error("❌ Error creating Zoom meeting:", zoomError);
                } else {
                  console.log("✅ Zoom meeting created:", zoomData);
                }
              } catch (zoomErr) {
                console.error("❌ Zoom meeting creation failed:", zoomErr);
              }

              // Send booking confirmation email to client (using Polariz profile email only)
              const clientEmail = clientProfile?.email;
              const clientName = clientProfile?.name || 'Client';
              
              console.log("📧 Sending booking confirmation email to client...");
              console.log("📧 Client email from profiles:", clientEmail);
              console.log("📧 Client name from profiles:", clientName);
              
              if (!clientEmail) {
                console.error("❌ No client email found in profiles table - cannot send booking confirmation");
                console.error("❌ Client ID:", sessionData.client_id);
              } else {
                try {
                  const { data: bookingEmailResult, error: bookingEmailError } = await supabase.functions.invoke('send-booking-confirmation', {
                    body: {
                      sessionId: sessionId,
                      clientEmail: clientEmail,
                      clientName: clientName,
                      therapistName: `${sessionData.therapists.first_name} ${sessionData.therapists.last_name}`,
                      sessionDate: sessionData.session_date,
                      sessionTime: sessionData.start_time,
                      duration: sessionData.duration_minutes,
                      sessionType: sessionData.session_type,
                      price: sessionData.price_paid,
                    }
                  });
                  
                  if (bookingEmailError) {
                    console.error("❌ Error from send-booking-confirmation:", bookingEmailError);
                  } else {
                    console.log("✅ Booking confirmation email sent to client:", JSON.stringify(bookingEmailResult));
                  }
                } catch (emailErr) {
                  console.error("❌ Exception sending client email:", emailErr);
                }
              }

              // Send notification email to therapist
              console.log("📧 Sending notification email to therapist...");
              console.log("📝 Client notes:", sessionData.client_notes || '(none)');
              try {
                await supabase.functions.invoke('send-therapist-notification', {
                  body: {
                    sessionId: sessionId,
                    therapistId: sessionData.therapists.id,
                    clientName: clientProfile?.name || clientProfile?.email || 'New Client',
                    sessionDate: sessionData.session_date,
                    sessionTime: sessionData.start_time,
                    duration: sessionData.duration_minutes,
                    sessionType: sessionData.session_type,
                    amount: sessionData.price_paid,
                    clientNotes: sessionData.client_notes || null,
                  }
                });
                console.log("✅ Therapist notification email sent");
              } catch (emailErr) {
                console.error("❌ Error sending therapist email:", emailErr);
              }
            }
          }
        } else {
          console.log("⚠️ No session_id found in metadata");
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log("✅ PaymentIntent succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log("❌ PaymentIntent failed:", paymentIntent.id);

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
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    console.log("✅ Webhook processed successfully, returning 200");
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("❌ Webhook error:", error);
    console.error("Stack trace:", error.stack);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);

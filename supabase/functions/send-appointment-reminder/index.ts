import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  sessionId: string;
  clientEmail: string;
  clientName: string;
  therapistName: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  sessionType: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      sessionId,
      clientEmail,
      clientName,
      therapistName,
      sessionDate,
      sessionTime,
      duration,
      sessionType,
    }: ReminderRequest = await req.json();

    console.log("Sending appointment reminder email to:", clientEmail);

    // Format the date for better readability
    const sessionDateTime = new Date(`${sessionDate}T${sessionTime}`);
    const formattedDate = sessionDateTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Calculate hours until appointment
    const now = new Date();
    const hoursUntil = Math.round((sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60));

    const emailResponse = await resend.emails.send({
      from: "Polariz Therapy <reminders@polariz.com>",
      to: [clientEmail],
      subject: "Reminder: Your Therapy Session Tomorrow",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f59e0b; margin: 0; font-size: 28px;">Session Reminder</h1>
              <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Your therapy session is coming up soon</p>
            </div>
            
            <div style="background-color: #fef3c7; padding: 25px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
              <h2 style="color: #92400e; margin: 0 0 15px 0; font-size: 20px;">⏰ ${hoursUntil} hours to go!</h2>
              <p style="color: #92400e; margin: 0; font-size: 16px;">Your appointment with ${therapistName} is scheduled for tomorrow.</p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #1e40af; margin: 0 0 20px 0; font-size: 18px;">Session Details</h3>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Client:</strong> ${clientName}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Therapist:</strong> ${therapistName}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Date:</strong> ${formattedDate}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Time:</strong> ${sessionTime}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Duration:</strong> ${duration} minutes
              </div>
              
              <div style="margin-bottom: 0;">
                <strong style="color: #374151;">Session Type:</strong> ${sessionType}
              </div>
            </div>
            
            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 25px;">
              <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 16px;">Preparation Tips</h3>
              <ul style="color: #047857; margin: 0; padding-left: 20px;">
                <li>Arrive 5-10 minutes early</li>
                <li>Prepare any topics or questions you'd like to discuss</li>
                <li>Ensure you're in a quiet, private space for your session</li>
                <li>Have water nearby and make yourself comfortable</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; margin: 0 0 15px 0;">Need to reschedule or have questions?</p>
              <a href="mailto:support@polariz.com" style="background-color: #f59e0b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin-right: 10px;">Contact Support</a>
              <a href="tel:+1234567890" style="background-color: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Call Us</a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; margin: 0; font-size: 14px;">
                We look forward to seeing you tomorrow!<br>
                Polariz Therapy Team
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Appointment reminder email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-appointment-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
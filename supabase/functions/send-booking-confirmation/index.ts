import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  sessionId: string;
  clientEmail: string;
  clientName: string;
  therapistName: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  sessionType: string;
  price: number;
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
      price,
    }: BookingConfirmationRequest = await req.json();

    console.log("Sending booking confirmation email to:", clientEmail);

    // Format the date and time for better readability
    const formattedDate = new Date(sessionDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Fetch email template from database
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, html_content')
      .eq('template_name', 'booking_confirmation_client')
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      console.error('Failed to fetch email template:', templateError);
      throw new Error('Email template not found');
    }

    // Replace variables in template - support both formats
    const variables = {
      client_name: clientName,
      clientName,
      therapist_name: therapistName,
      therapistName,
      session_date: formattedDate,
      sessionDate: formattedDate,
      session_time: sessionTime,
      sessionTime,
      duration: duration.toString(),
      session_type: sessionType,
      sessionType,
      price: price.toString(),
      booking_id: sessionId,
      dashboard_url: 'https://polariz.ai/dashboard'
    };

    let htmlContent = template.html_content;
    let subject = template.subject;

    // Replace all variables in the template
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, value);
      subject = subject.replace(regex, value);
    });

    const emailResponse = await resend.emails.send({
      from: "Polariz <noreply@polariz.ai>",
      to: [clientEmail],
      subject,
      html: htmlContent,
    });

    console.log("Booking confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-confirmation function:", error);
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
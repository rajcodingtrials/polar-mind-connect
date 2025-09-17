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

    // Fetch email template from database
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, html_content')
      .eq('template_name', 'appointment_reminder')
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      console.error('Failed to fetch email template:', templateError);
      throw new Error('Email template not found');
    }

    // Replace variables in template
    const variables = {
      clientName,
      therapistName,
      sessionDate: formattedDate,
      sessionTime,
      duration: duration.toString(),
      sessionType,
      hoursUntil: hoursUntil.toString()
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
      from: "Polariz Therapy <reminders@polariz.com>",
      to: [clientEmail],
      subject,
      html: htmlContent,
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
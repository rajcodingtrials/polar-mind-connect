import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TherapistNotificationRequest {
  sessionId: string;
  therapistId: string;
  clientName: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  sessionType: string;
  amount: number;
  clientNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      sessionId,
      therapistId,
      clientName,
      sessionDate,
      sessionTime,
      duration,
      sessionType,
      amount,
      clientNotes
    }: TherapistNotificationRequest = await req.json();

    console.log('Processing therapist notification for session:', sessionId);

    // Fetch therapist details
    const { data: therapist, error: therapistError } = await supabase
      .from('therapists')
      .select('name, email, first_name, last_name')
      .eq('id', therapistId)
      .single();

    if (therapistError || !therapist) {
      console.error('Error fetching therapist:', therapistError);
      throw new Error('Therapist not found');
    }

    if (!therapist.email) {
      console.error('Therapist email not found');
      throw new Error('Therapist email not configured');
    }

    // Fetch email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, html_content')
      .eq('template_name', 'therapist_booking_notification')
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      console.error('Error fetching email template:', templateError);
      throw new Error('Email template not found');
    }

    // Format the session date for better readability
    const formattedDate = new Date(sessionDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Prepare template variables
    const therapistName = therapist.name || `${therapist.first_name || ''} ${therapist.last_name || ''}`.trim() || 'Doctor';
    const templateVars = {
      therapist_name: therapistName,
      client_name: clientName,
      session_date: formattedDate,
      session_time: sessionTime,
      duration: duration.toString(),
      session_type: sessionType,
      amount: amount.toFixed(2),
      client_notes: clientNotes || ''
    };

    // Replace placeholders in subject and content
    let emailSubject = template.subject;
    let emailContent = template.html_content;

    Object.entries(templateVars).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      emailSubject = emailSubject.replace(new RegExp(placeholder, 'g'), value);
      emailContent = emailContent.replace(new RegExp(placeholder, 'g'), value);
    });

    // Handle conditional sections (client notes)
    if (clientNotes && clientNotes.trim()) {
      emailContent = emailContent.replace(/{{#client_notes}}([\s\S]*?){{\/client_notes}}/g, '$1');
    } else {
      emailContent = emailContent.replace(/{{#client_notes}}([\s\S]*?){{\/client_notes}}/g, '');
    }

    console.log('Sending therapist notification to:', therapist.email);

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Therapy Platform <noreply@resend.dev>",
      to: [therapist.email],
      subject: emailSubject,
      html: emailContent,
    });

    console.log("Therapist notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      message: "Therapist notification sent successfully",
      emailId: emailResponse.data?.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-therapist-notification function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
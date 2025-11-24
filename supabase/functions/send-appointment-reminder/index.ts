import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.2.0";
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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId }: ReminderRequest = await req.json();

    console.log("Processing appointment reminder for session:", sessionId);

    // Fetch session details with therapist and client information
    const { data: session, error: sessionError } = await supabase
      .from('therapy_sessions')
      .select(`
        *,
        therapists!inner(name, email, first_name, last_name),
        profiles!inner(name, email)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('Error fetching session details:', sessionError);
      throw new Error('Session not found');
    }

    // Fetch both client and therapist email templates
    const { data: clientTemplate, error: clientTemplateError } = await supabase
      .from('email_templates')
      .select('subject, html_content')
      .eq('template_name', 'appointment_reminder_client')
      .eq('is_active', true)
      .single();

    const { data: therapistTemplate, error: therapistTemplateError } = await supabase
      .from('email_templates')
      .select('subject, html_content')
      .eq('template_name', 'appointment_reminder_therapist')
      .eq('is_active', true)
      .single();

    if (clientTemplateError || !clientTemplate) {
      console.error('Error fetching client email template:', clientTemplateError);
      throw new Error('Client email template not found');
    }

    if (therapistTemplateError || !therapistTemplate) {
      console.error('Error fetching therapist email template:', therapistTemplateError);
      throw new Error('Therapist email template not found');
    }

    // Format the session date for better readability
    const sessionDate = new Date(session.session_date);
    const formattedDate = sessionDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const therapistName = session.therapists.name || 
      `${session.therapists.first_name || ''} ${session.therapists.last_name || ''}`.trim() || 
      'Your Therapist';

    // Prepare template variables - support both formats
    const templateVars = {
      client_name: session.profiles.name || 'Valued Client',
      clientName: session.profiles.name || 'Valued Client',
      therapist_name: therapistName,
      therapistName: therapistName,
      session_date: formattedDate,
      sessionDate: formattedDate,
      session_time: session.start_time,
      sessionTime: session.start_time,
      duration: session.duration_minutes.toString(),
      session_type: session.session_type,
      sessionType: session.session_type
    };

    // Send email to client
    let clientEmailSubject = clientTemplate.subject;
    let clientEmailContent = clientTemplate.html_content;

    Object.entries(templateVars).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      clientEmailSubject = clientEmailSubject.replace(new RegExp(placeholder, 'g'), value);
      clientEmailContent = clientEmailContent.replace(new RegExp(placeholder, 'g'), value);
    });

    console.log('Sending appointment reminder to client:', session.profiles.email);

    const clientEmailResponse = await resend.emails.send({
      from: "Therapy Platform <noreply@resend.dev>",
      to: [session.profiles.email],
      subject: clientEmailSubject,
      html: clientEmailContent,
    });

    console.log("Client appointment reminder sent successfully:", clientEmailResponse);

    // Send email to therapist
    let therapistEmailSubject = therapistTemplate.subject;
    let therapistEmailContent = therapistTemplate.html_content;

    Object.entries(templateVars).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      therapistEmailSubject = therapistEmailSubject.replace(new RegExp(placeholder, 'g'), value);
      therapistEmailContent = therapistEmailContent.replace(new RegExp(placeholder, 'g'), value);
    });

    if (session.therapists.email) {
      console.log('Sending appointment reminder to therapist:', session.therapists.email);

      const therapistEmailResponse = await resend.emails.send({
        from: "Therapy Platform <noreply@resend.dev>",
        to: [session.therapists.email],
        subject: therapistEmailSubject,
        html: therapistEmailContent,
      });

      console.log("Therapist appointment reminder sent successfully:", therapistEmailResponse);
    } else {
      console.warn('Therapist email not found, skipping therapist reminder');
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Appointment reminders sent successfully to both client and therapist"
    }), {
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
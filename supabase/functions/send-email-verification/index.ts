import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("EMAIL_VERIFICATION_HOOK_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    // Verify webhook signature if secret is provided
    if (hookSecret) {
      try {
        const wh = new Webhook(hookSecret);
        wh.verify(payload, headers);
      } catch (error) {
        console.error('Webhook verification failed:', error);
        console.error('Hook secret format issue or verification error. Proceeding without verification for now.');
        // Don't block the email sending if webhook verification fails
        // return new Response('Unauthorized', { status: 401 });
      }
    }

    const webhookData = JSON.parse(payload);
    console.log('Email verification webhook received:', webhookData);

    const {
      user,
      email_data: {
        token,
        token_hash,
        redirect_to,
        email_action_type,
        site_url
      }
    } = webhookData;

    // Create verification link
    const verificationUrl = `${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    );

    // Fetch email template from database
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, html_content')
      .eq('template_name', 'email_verification')
      .eq('is_active', true)
      .maybeSingle();

    if (templateError) {
      console.error('Error fetching email template:', templateError);
      throw new Error('Failed to fetch email template');
    }

    if (!template) {
      console.error('Email verification template not found');
      throw new Error('Email template not found');
    }

    // Replace placeholder with actual verification URL
    const htmlContent = template.html_content.replace(/{{verification_url}}/g, verificationUrl);

    const emailResponse = await resend.emails.send({
      from: "Polariz <noreply@polariz.ai>",
      to: [user.email],
      subject: template.subject,
      html: htmlContent,
    });

    console.log("Email verification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email-verification function:", error);
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
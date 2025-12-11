import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.2.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Processing password reset request for email:', email);

    // Initialize Supabase client with service role key for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    );

    // Generate password reset token using Supabase Admin API
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/reset-password`,
      },
    });

    if (resetError || !resetData) {
      console.error('Error generating password reset link:', resetError);
      // Don't reveal if email exists or not for security reasons
      // Return success even if user doesn't exist
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "If an account exists with this email, a password reset link has been sent." 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the reset URL from the properties
    const resetUrl = resetData.properties?.action_link;

    if (!resetUrl) {
      console.error('No reset URL generated');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "If an account exists with this email, a password reset link has been sent." 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch email template from database
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, html_content')
      .eq('template_name', 'password_reset')
      .eq('is_active', true)
      .maybeSingle();

    if (templateError) {
      console.error('Error fetching email template:', templateError);
      throw new Error('Failed to fetch email template');
    }

    if (!template) {
      console.error('Password reset email template not found');
      throw new Error('Email template not found');
    }

    // Get user information for personalization
    let userName = email.split('@')[0] || 'User';
    try {
      const { data: userData } = await supabase.auth.admin.getUserByEmail(email);
      if (userData?.user) {
        const userMetadata = userData.user.user_metadata || userData.user.raw_user_meta_data || {};
        const firstName = userMetadata.first_name || '';
        const lastName = userMetadata.last_name || '';
        if (firstName || lastName) {
          userName = `${firstName} ${lastName}`.trim() || userName;
        }
      }
    } catch (error) {
      console.log('Could not fetch user metadata, using email-based name:', error);
      // Continue with email-based name
    }

    // Replace placeholders in template
    let htmlContent = template.html_content
      .replace(/{{reset_url}}/g, resetUrl)
      .replace(/{{user_name}}/g, userName);

    let emailSubject = template.subject;

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Polariz <noreply@polariz.ai>",
      to: [email],
      subject: emailSubject,
      html: htmlContent,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "If an account exists with this email, a password reset link has been sent.",
        emailId: emailResponse.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    // Return success to prevent email enumeration attacks
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "If an account exists with this email, a password reset link has been sent." 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);


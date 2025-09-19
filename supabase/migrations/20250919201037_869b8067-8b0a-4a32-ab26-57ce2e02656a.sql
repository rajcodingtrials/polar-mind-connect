-- Insert the email verification template into the email_templates table
INSERT INTO email_templates (
  template_name,
  subject,
  html_content,
  description,
  variables,
  is_active
) VALUES (
  'email_verification',
  'Verify your email address - Polariz',
  '<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Polariz</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #2563eb; margin-bottom: 10px;">Welcome to Polariz!</h1>
      <p style="font-size: 18px; color: #666;">Please verify your email address</p>
    </div>
    
    <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
      <h2 style="margin-top: 0; color: #1e293b;">Verify Your Email Address</h2>
      <p style="margin-bottom: 25px;">Thank you for signing up! To complete your registration and secure your account, please verify your email address by clicking the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{verification_url}}" 
           style="background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666; margin-bottom: 0;">
        If the button doesn''t work, you can copy and paste this link into your browser:
      </p>
      <p style="font-size: 12px; color: #2563eb; word-break: break-all; background: #f1f5f9; padding: 10px; border-radius: 4px; margin-top: 10px;">
        {{verification_url}}
      </p>
    </div>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 30px;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>Security Note:</strong> This verification link will expire in 24 hours for your security.
      </p>
    </div>
    
    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #666; font-size: 14px;">
      <p style="margin-bottom: 10px;">
        If you didn''t create an account with Polariz, you can safely ignore this email.
      </p>
      <p style="margin: 0;">
        Best regards,<br>
        The Polariz Team
      </p>
    </div>
  </body>
</html>',
  'Email verification template for new user signups',
  '["verification_url"]'::jsonb,
  true
);
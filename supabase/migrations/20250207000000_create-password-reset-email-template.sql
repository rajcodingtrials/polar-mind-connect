-- Insert password reset email template
INSERT INTO public.email_templates (
  template_name,
  subject,
  html_content,
  description,
  variables,
  is_active
) VALUES (
  'password_reset',
  'Reset Your Password - Polariz',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Polariz</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
    <div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 40px 32px; text-align: center;">
      <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <img src="https://gsnsjrfudxyczpldbkzc.supabase.co/storage/v1/object/public/avatars/polariz_icon_only_white.png" alt="Polariz" style="width: 48px; height: 48px;" />
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Polariz</h1>
      </div>
      <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0;">AI-Powered Speech Therapy</p>
    </div>
    
    <div style="padding: 40px 32px;">
      <h2 style="color: #1F2937; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Reset Your Password 🔒</h2>
      <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi {{user_name}},
      </p>
      <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        We received a request to reset your password for your Polariz account. Click the button below to create a new password:
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{reset_url}}" style="display: inline-block; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
          Reset My Password
        </a>
      </div>
      
      <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
        Or copy and paste this link into your browser:<br>
        <span style="color: #EF4444; word-break: break-all;">{{reset_url}}</span>
      </p>
      
      <div style="margin-top: 40px; padding: 24px; background-color: #FEF2F2; border-radius: 8px; border-left: 4px solid #EF4444;">
        <h3 style="color: #1F2937; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">Important Security Information</h3>
        <ul style="color: #4B5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>This link will expire in 1 hour for your security</li>
          <li>If you didn''t request a password reset, please ignore this email</li>
          <li>Your password will remain unchanged if you don''t click the link</li>
        </ul>
      </div>
      
      <div style="margin-top: 32px; padding: 16px; background-color: #FEF3C7; border-radius: 8px; border: 1px solid #FDE047;">
        <p style="color: #92400E; font-size: 14px; margin: 0; line-height: 1.6;">
          <strong>🔒 Security Note:</strong> If you didn''t request this password reset, please contact our support team immediately at <a href="mailto:support@polariz.ai" style="color: #EF4444; text-decoration: none;">support@polariz.ai</a>
        </p>
      </div>
    </div>
    
    <div style="background-color: #F9FAFB; padding: 24px 32px; border-top: 1px solid #E5E7EB; text-align: center;">
      <p style="color: #6B7280; font-size: 14px; margin: 0 0 8px 0;">
        Need help? Contact us at <a href="mailto:support@polariz.ai" style="color: #EF4444; text-decoration: none;">support@polariz.ai</a>
      </p>
      <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
        © 2024 Polariz. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>',
  'Email template for password reset requests',
  '["reset_url", "user_name"]'::jsonb,
  true
)
ON CONFLICT (template_name) DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  description = EXCLUDED.description,
  variables = EXCLUDED.variables,
  is_active = EXCLUDED.is_active,
  updated_at = now();


-- Fix email verification template logo visibility
UPDATE public.email_templates
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Polariz</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
    <div style="background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); padding: 40px 32px; text-align: center;">
      <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 16px; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" style="width: 48px; height: 48px;">
          <path d="M12 2L14.5 9H21L15.5 13.5L17.5 20.5L12 16L6.5 20.5L8.5 13.5L3 9H9.5L12 2Z" fill="white" stroke="white" stroke-width="1"/>
        </svg>
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Polariz</h1>
      </div>
      <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0;">AI-Powered Speech Therapy</p>
    </div>
    
    <div style="padding: 40px 32px;">
      <h2 style="color: #1F2937; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Welcome to Polariz! 🌟</h2>
      <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        We''re excited to have you join our community. To get started with your personalized speech therapy journey, please verify your email address.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{verification_url}}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
          Verify My Email
        </a>
      </div>
      
      <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
        Or copy and paste this link into your browser:<br>
        <span style="color: #8B5CF6; word-break: break-all;">{{verification_url}}</span>
      </p>
      
      <div style="margin-top: 40px; padding: 24px; background-color: #F9FAFB; border-radius: 8px; border-left: 4px solid #8B5CF6;">
        <h3 style="color: #1F2937; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">What awaits you inside:</h3>
        <ul style="color: #4B5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>AI-powered speech therapy sessions</li>
          <li>Personalized learning paths</li>
          <li>Progress tracking and analytics</li>
          <li>Connect with professional therapists</li>
        </ul>
      </div>
      
      <div style="margin-top: 32px; padding: 16px; background-color: #FEF3C7; border-radius: 8px; border: 1px solid #FDE047;">
        <p style="color: #92400E; font-size: 14px; margin: 0; line-height: 1.6;">
          <strong>🔒 Security Note:</strong> This verification link will expire in 24 hours. If you didn''t create a Polariz account, please ignore this email.
        </p>
      </div>
    </div>
    
    <div style="background-color: #F9FAFB; padding: 24px 32px; border-top: 1px solid #E5E7EB; text-align: center;">
      <p style="color: #6B7280; font-size: 14px; margin: 0 0 8px 0;">
        Need help? Contact us at <a href="mailto:support@polariz.app" style="color: #8B5CF6; text-decoration: none;">support@polariz.app</a>
      </p>
      <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
        © 2024 Polariz. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>'
WHERE template_name = 'email_verification';
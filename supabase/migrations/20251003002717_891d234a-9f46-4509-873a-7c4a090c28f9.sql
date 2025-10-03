-- Insert the Polariz email verification template
INSERT INTO public.email_templates (
  template_name,
  subject,
  html_content,
  description,
  variables,
  is_active
) VALUES (
  'email_verification',
  'Welcome to Polariz! Verify Your Email 🎉',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; min-height: 100vh; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px;">
        <div style="width: 60px; height: 60px; background: #000000; border-radius: 16px; padding: 10px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); display: inline-flex; align-items: center; justify-content: center; border: 2px solid rgba(255, 255, 255, 0.3); vertical-align: middle;">
          <img src="https://gsnsjrfudxyczpldbkzc.supabase.co/storage/v1/object/public/cartoon-characters/polariz_icon_only_white.png" alt="Polariz Logo" style="width: 100%; height: 100%; object-fit: contain; filter: brightness(0) invert(1); display: block;" />
        </div>
        <span style="font-size: 32px; font-weight: 700; color: white; letter-spacing: -0.5px; vertical-align: middle; display: inline-block;">Polariz</span>
      </div>
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px; margin-top: 0;">Welcome to Polariz! 🎉</h1>
      <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400; margin: 0;">AI-powered speech therapy connecting families and professionals</p>
    </div>

    <!-- Content -->
    <div style="padding: 48px 40px;">
      <p style="font-size: 18px; color: #1a1a1a; font-weight: 600; margin-bottom: 16px; margin-top: 0;">Hi there!</p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 32px;">We''re thrilled to have you join Polariz! You''re just one click away from accessing our AI-powered platform that helps speech-delayed children find their voice, while connecting families with professional support.</p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{verification_url}}" style="display: inline-block; padding: 18px 48px; font-size: 16px; font-weight: 600; color: white; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; text-decoration: none; box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);">Verify My Email →</a>
      </div>

      <div style="height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 24px 0;"></div>

      <!-- What''s Next -->
      <div style="background: #f7fafc; border-radius: 16px; padding: 24px; margin: 32px 0;">
        <p style="font-size: 16px; font-weight: 600; color: #2d3748; margin-bottom: 16px; text-align: center; margin-top: 0;">What awaits you inside:</p>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-size: 14px;">
              <span style="margin-right: 12px; font-size: 18px;">🤖</span>
              <span>AI-powered speech exercises for children with speech delays</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-size: 14px;">
              <span style="margin-right: 12px; font-size: 18px;">👨‍⚕️</span>
              <span>Professional tools for speech therapists to support clients</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-size: 14px;">
              <span style="margin-right: 12px; font-size: 18px;">📊</span>
              <span>Progress tracking and detailed insights for families</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-size: 14px;">
              <span style="margin-right: 12px; font-size: 18px;">🔒</span>
              <span>Secure scheduling and communication platform</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Security Note -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 12px; margin: 24px 0;">
        <p style="font-size: 14px; font-weight: 600; color: #92400e; margin-bottom: 4px; margin-top: 0; display: flex; align-items: center;">🔒 Security Notice</p>
        <p style="font-size: 13px; color: #78350f; line-height: 1.5; margin: 0;">This verification link will expire in 24 hours for your protection. If you didn''t create a Polariz account, please ignore this email or contact our support team.</p>
      </div>

      <p style="margin-top: 32px; font-size: 14px; color: #718096; line-height: 1.6;">Having trouble with the button? Copy and paste this link into your browser:<br /><span style="color: #667eea; word-break: break-all;">{{verification_url}}</span></p>
    </div>

    <!-- Footer -->
    <div style="background: #f7fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 13px; color: #718096; line-height: 1.6; margin-bottom: 8px; margin-top: 0;"><strong>Need help?</strong> We''re here for you!<br />Reach out to us at <a href="mailto:support@polariz.ai" style="color: #667eea; text-decoration: none;">support@polariz.ai</a></p>
      
      <div style="height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 20px auto; max-width: 200px;"></div>
      
      <p style="font-size: 13px; color: #718096; line-height: 1.6; margin: 0;">© 2025 Polariz. All rights reserved.<br />Helping children find their voice through AI-powered speech therapy.</p>
    </div>
  </div>
</body>
</html>',
  'Welcome email template for new user email verification',
  '["verification_url"]'::jsonb,
  true
)
ON CONFLICT (template_name) 
DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  description = EXCLUDED.description,
  variables = EXCLUDED.variables,
  is_active = EXCLUDED.is_active,
  updated_at = now();
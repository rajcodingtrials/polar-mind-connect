-- Insert booking confirmation template for clients
INSERT INTO public.email_templates (
  template_name,
  subject,
  html_content,
  description,
  variables,
  is_active
) VALUES (
  'booking_confirmation_client',
  'Booking Confirmed! Your Therapy Session is Scheduled ✅',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; background: #ffffff; padding: 40px 20px; min-height: 100vh; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px;">
        <div style="width: 60px; height: 60px; background: #000000; border-radius: 16px; padding: 10px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); display: inline-flex; align-items: center; justify-content: center; border: 2px solid rgba(255, 255, 255, 0.3); vertical-align: middle;">
          <img src="https://gsnsjrfudxyczpldbkzc.supabase.co/storage/v1/object/public/cartoon-characters/polariz_icon_only_white.png" alt="Polariz Logo" style="width: 100%; height: 100%; object-fit: contain; filter: brightness(0) invert(1); display: block;" />
        </div>
        <span style="font-size: 32px; font-weight: 700; color: white; letter-spacing: -0.5px; vertical-align: middle; display: inline-block;">Polariz</span>
      </div>
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px; margin-top: 0;">Booking Confirmed! ✅</h1>
      <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400; margin: 0;">Your therapy session has been successfully scheduled</p>
    </div>

    <!-- Content -->
    <div style="padding: 48px 40px;">
      <p style="font-size: 18px; color: #1a1a1a; font-weight: 600; margin-bottom: 16px; margin-top: 0;">Hi {{client_name}}!</p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 32px;">Great news! Your therapy session with {{therapist_name}} has been confirmed. We''re looking forward to supporting you on your speech therapy journey.</p>

      <!-- Session Details -->
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 16px; padding: 28px; margin: 32px 0; border: 2px solid #10b981;">
        <p style="font-size: 18px; font-weight: 700; color: #065f46; margin-bottom: 20px; text-align: center; margin-top: 0;">📅 Session Details</p>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600; width: 40%;">Therapist:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{therapist_name}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600;">Date:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{session_date}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600;">Time:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{session_time}} ({{duration}} minutes)</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600;">Session Type:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{session_type}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600;">Booking ID:</td>
            <td style="padding: 12px 0; color: #718096; font-size: 13px; font-family: monospace;">{{booking_id}}</td>
          </tr>
        </table>
      </div>

      <!-- What to Prepare -->
      <div style="background: #f7fafc; border-radius: 16px; padding: 24px; margin: 32px 0;">
        <p style="font-size: 16px; font-weight: 600; color: #2d3748; margin-bottom: 16px; text-align: center; margin-top: 0;">Preparing for your session:</p>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-size: 14px;">
              <span style="margin-right: 12px; font-size: 18px;">💻</span>
              <span>Test your camera and microphone beforehand</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-size: 14px;">
              <span style="margin-right: 12px; font-size: 18px;">🌐</span>
              <span>Ensure a stable internet connection</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-size: 14px;">
              <span style="margin-right: 12px; font-size: 18px;">🤫</span>
              <span>Find a quiet, comfortable space</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-size: 14px;">
              <span style="margin-right: 12px; font-size: 18px;">📝</span>
              <span>Have any questions or concerns ready to discuss</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{dashboard_url}}" style="display: inline-block; padding: 18px 48px; font-size: 16px; font-weight: 600; color: white; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; text-decoration: none; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);">View in Dashboard →</a>
      </div>

      <div style="height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 24px 0;"></div>

      <!-- Important Note -->
      <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 12px; margin: 24px 0;">
        <p style="font-size: 14px; font-weight: 600; color: #1e40af; margin-bottom: 4px; margin-top: 0; display: flex; align-items: center;">📌 Need to Reschedule?</p>
        <p style="font-size: 13px; color: #1e3a8a; line-height: 1.5; margin: 0;">Please notify us at least 24 hours in advance if you need to reschedule or cancel your appointment. You can manage your booking through your dashboard or contact us at support@polariz.ai.</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f7fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 13px; color: #718096; line-height: 1.6; margin-bottom: 8px; margin-top: 0;"><strong>Questions or concerns?</strong> We''re here to help!<br />Contact us at <a href="mailto:support@polariz.ai" style="color: #10b981; text-decoration: none;">support@polariz.ai</a></p>
      
      <div style="height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 20px auto; max-width: 200px;"></div>
      
      <p style="font-size: 13px; color: #718096; line-height: 1.6; margin: 0;">© 2025 Polariz. All rights reserved.<br />Helping children find their voice through AI-powered speech therapy.</p>
    </div>
  </div>
</body>
</html>',
  'Booking confirmation email for clients',
  '["client_name", "therapist_name", "session_date", "session_time", "duration", "session_type", "booking_id", "dashboard_url"]'::jsonb,
  true
),
(
  'booking_confirmation_therapist',
  'New Booking: Session Scheduled with Client ✅',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; background: #ffffff; padding: 40px 20px; min-height: 100vh; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px;">
        <div style="width: 60px; height: 60px; background: #000000; border-radius: 16px; padding: 10px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); display: inline-flex; align-items: center; justify-content: center; border: 2px solid rgba(255, 255, 255, 0.3); vertical-align: middle;">
          <img src="https://gsnsjrfudxyczpldbkzc.supabase.co/storage/v1/object/public/cartoon-characters/polariz_icon_only_white.png" alt="Polariz Logo" style="width: 100%; height: 100%; object-fit: contain; filter: brightness(0) invert(1); display: block;" />
        </div>
        <span style="font-size: 32px; font-weight: 700; color: white; letter-spacing: -0.5px; vertical-align: middle; display: inline-block;">Polariz</span>
      </div>
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px; margin-top: 0;">New Booking! ✅</h1>
      <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400; margin: 0;">You have a new client session scheduled</p>
    </div>

    <!-- Content -->
    <div style="padding: 48px 40px;">
      <p style="font-size: 18px; color: #1a1a1a; font-weight: 600; margin-bottom: 16px; margin-top: 0;">Hi {{therapist_name}}!</p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 32px;">You have a new therapy session booked with {{client_name}}. Please review the session details below and prepare accordingly.</p>

      <!-- Session Details -->
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 16px; padding: 28px; margin: 32px 0; border: 2px solid #10b981;">
        <p style="font-size: 18px; font-weight: 700; color: #065f46; margin-bottom: 20px; text-align: center; margin-top: 0;">📅 Session Details</p>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600; width: 40%;">Client:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{client_name}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600;">Date:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{session_date}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600;">Time:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{session_time}} ({{duration}} minutes)</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600;">Session Type:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{session_type}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600;">Booking ID:</td>
            <td style="padding: 12px 0; color: #718096; font-size: 13px; font-family: monospace;">{{booking_id}}</td>
          </tr>
        </table>
      </div>

      <!-- Client Notes (if any) -->
      <div style="background: #f7fafc; border-radius: 16px; padding: 24px; margin: 32px 0;">
        <p style="font-size: 16px; font-weight: 600; color: #2d3748; margin-bottom: 12px; margin-top: 0;">Client Notes:</p>
        <p style="font-size: 14px; color: #4a5568; line-height: 1.6; margin: 0;">{{client_notes}}</p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{dashboard_url}}" style="display: inline-block; padding: 18px 48px; font-size: 16px; font-weight: 600; color: white; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; text-decoration: none; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);">View in Dashboard →</a>
      </div>

      <div style="height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 24px 0;"></div>

      <!-- Important Note -->
      <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 12px; margin: 24px 0;">
        <p style="font-size: 14px; font-weight: 600; color: #1e40af; margin-bottom: 4px; margin-top: 0; display: flex; align-items: center;">💼 Professional Reminder</p>
        <p style="font-size: 13px; color: #1e3a8a; line-height: 1.5; margin: 0;">Please review the client''s information and any special requirements before the session. If you need to reschedule, please notify the client at least 24 hours in advance through your dashboard.</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f7fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 13px; color: #718096; line-height: 1.6; margin-bottom: 8px; margin-top: 0;"><strong>Need support?</strong> We''re here to help!<br />Contact us at <a href="mailto:support@polariz.ai" style="color: #10b981; text-decoration: none;">support@polariz.ai</a></p>
      
      <div style="height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 20px auto; max-width: 200px;"></div>
      
      <p style="font-size: 13px; color: #718096; line-height: 1.6; margin: 0;">© 2025 Polariz. All rights reserved.<br />Helping children find their voice through AI-powered speech therapy.</p>
    </div>
  </div>
</body>
</html>',
  'Booking confirmation email for therapists',
  '["therapist_name", "client_name", "session_date", "session_time", "duration", "session_type", "booking_id", "client_notes", "dashboard_url"]'::jsonb,
  true
),
(
  'appointment_reminder_client',
  'Reminder: Your Therapy Session is Tomorrow ⏰',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; background: #ffffff; padding: 40px 20px; min-height: 100vh; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px;">
        <div style="width: 60px; height: 60px; background: #000000; border-radius: 16px; padding: 10px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); display: inline-flex; align-items: center; justify-content: center; border: 2px solid rgba(255, 255, 255, 0.3); vertical-align: middle;">
          <img src="https://gsnsjrfudxyczpldbkzc.supabase.co/storage/v1/object/public/cartoon-characters/polariz_icon_only_white.png" alt="Polariz Logo" style="width: 100%; height: 100%; object-fit: contain; filter: brightness(0) invert(1); display: block;" />
        </div>
        <span style="font-size: 32px; font-weight: 700; color: white; letter-spacing: -0.5px; vertical-align: middle; display: inline-block;">Polariz</span>
      </div>
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px; margin-top: 0;">Session Reminder ⏰</h1>
      <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400; margin: 0;">Your therapy session is coming up soon!</p>
    </div>

    <!-- Content -->
    <div style="padding: 48px 40px;">
      <p style="font-size: 18px; color: #1a1a1a; font-weight: 600; margin-bottom: 16px; margin-top: 0;">Hi {{client_name}}!</p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 32px;">This is a friendly reminder that you have a therapy session scheduled for tomorrow. We''re looking forward to seeing you!</p>

      <!-- Session Details -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 28px; margin: 32px 0; border: 2px solid #f59e0b;">
        <p style="font-size: 18px; font-weight: 700; color: #92400e; margin-bottom: 20px; text-align: center; margin-top: 0;">📅 Session Details</p>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; color: #92400e; font-size: 14px; font-weight: 600; width: 40%;">Therapist:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{therapist_name}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #92400e; font-size: 14px; font-weight: 600;">Date:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{session_date}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #92400e; font-size: 14px; font-weight: 600;">Time:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{session_time}} ({{duration}} minutes)</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #92400e; font-size: 14px; font-weight: 600;">Session Type:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{session_type}}</td>
          </tr>
        </table>
      </div>

      <!-- Quick Checklist -->
      <div style="background: #f7fafc; border-radius: 16px; padding: 24px; margin: 32px 0;">
        <p style="font-size: 16px; font-weight: 600; color: #2d3748; margin-bottom: 16px; text-align: center; margin-top: 0;">Quick checklist before your session:</p>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-size: 14px;">
              <span style="margin-right: 12px; font-size: 18px;">✅</span>
              <span>Camera and microphone tested and working</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-size: 14px;">
              <span style="margin-right: 12px; font-size: 18px;">✅</span>
              <span>Good internet connection confirmed</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-size: 14px;">
              <span style="margin-right: 12px; font-size: 18px;">✅</span>
              <span>Quiet space arranged</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-size: 14px;">
              <span style="margin-right: 12px; font-size: 18px;">✅</span>
              <span>Any materials or questions prepared</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{dashboard_url}}" style="display: inline-block; padding: 18px 48px; font-size: 16px; font-weight: 600; color: white; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; text-decoration: none; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);">View Session Details →</a>
      </div>

      <div style="height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 24px 0;"></div>

      <!-- Important Note -->
      <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 12px; margin: 24px 0;">
        <p style="font-size: 14px; font-weight: 600; color: #991b1b; margin-bottom: 4px; margin-top: 0; display: flex; align-items: center;">⚠️ Can''t Make It?</p>
        <p style="font-size: 13px; color: #7f1d1d; line-height: 1.5; margin: 0;">If you need to cancel or reschedule, please let us know as soon as possible. You can manage your booking through your dashboard or contact us at support@polariz.ai.</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f7fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 13px; color: #718096; line-height: 1.6; margin-bottom: 8px; margin-top: 0;"><strong>Need help?</strong> We''re here for you!<br />Contact us at <a href="mailto:support@polariz.ai" style="color: #f59e0b; text-decoration: none;">support@polariz.ai</a></p>
      
      <div style="height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 20px auto; max-width: 200px;"></div>
      
      <p style="font-size: 13px; color: #718096; line-height: 1.6; margin: 0;">© 2025 Polariz. All rights reserved.<br />Helping children find their voice through AI-powered speech therapy.</p>
    </div>
  </div>
</body>
</html>',
  'Appointment reminder email for clients',
  '["client_name", "therapist_name", "session_date", "session_time", "duration", "session_type", "dashboard_url"]'::jsonb,
  true
),
(
  'appointment_reminder_therapist',
  'Reminder: Client Session Tomorrow ⏰',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; background: #ffffff; padding: 40px 20px; min-height: 100vh; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px;">
        <div style="width: 60px; height: 60px; background: #000000; border-radius: 16px; padding: 10px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); display: inline-flex; align-items: center; justify-content: center; border: 2px solid rgba(255, 255, 255, 0.3); vertical-align: middle;">
          <img src="https://gsnsjrfudxyczpldbkzc.supabase.co/storage/v1/object/public/cartoon-characters/polariz_icon_only_white.png" alt="Polariz Logo" style="width: 100%; height: 100%; object-fit: contain; filter: brightness(0) invert(1); display: block;" />
        </div>
        <span style="font-size: 32px; font-weight: 700; color: white; letter-spacing: -0.5px; vertical-align: middle; display: inline-block;">Polariz</span>
      </div>
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px; margin-top: 0;">Session Reminder ⏰</h1>
      <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400; margin: 0;">You have a client session scheduled tomorrow</p>
    </div>

    <!-- Content -->
    <div style="padding: 48px 40px;">
      <p style="font-size: 18px; color: #1a1a1a; font-weight: 600; margin-bottom: 16px; margin-top: 0;">Hi {{therapist_name}}!</p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 32px;">This is a reminder that you have a therapy session with {{client_name}} scheduled for tomorrow. Please review the session details below.</p>

      <!-- Session Details -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 28px; margin: 32px 0; border: 2px solid #f59e0b;">
        <p style="font-size: 18px; font-weight: 700; color: #92400e; margin-bottom: 20px; text-align: center; margin-top: 0;">📅 Session Details</p>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; color: #92400e; font-size: 14px; font-weight: 600; width: 40%;">Client:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{client_name}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #92400e; font-size: 14px; font-weight: 600;">Date:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{session_date}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #92400e; font-size: 14px; font-weight: 600;">Time:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{session_time}} ({{duration}} minutes)</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #92400e; font-size: 14px; font-weight: 600;">Session Type:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{session_type}}</td>
          </tr>
        </table>
      </div>

      <!-- Quick Preparation -->
      <div style="background: #f7fafc; border-radius: 16px; padding: 24px; margin: 32px 0;">
        <p style="font-size: 16px; font-weight: 600; color: #2d3748; margin-bottom: 16px; text-align: center; margin-top: 0;">Session preparation checklist:</p>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-size: 14px;">
              <span style="margin-right: 12px; font-size: 18px;">📋</span>
              <span>Review client history and notes</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-size: 14px;">
              <span style="margin-right: 12px; font-size: 18px;">💻</span>
              <span>Test video conferencing equipment</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-size: 14px;">
              <span style="margin-right: 12px; font-size: 18px;">📚</span>
              <span>Prepare therapy materials and exercises</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568; font-size: 14px;">
              <span style="margin-right: 12px; font-size: 18px;">🤫</span>
              <span>Ensure professional, quiet environment</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{dashboard_url}}" style="display: inline-block; padding: 18px 48px; font-size: 16px; font-weight: 600; color: white; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; text-decoration: none; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);">View Client Details →</a>
      </div>

      <div style="height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 24px 0;"></div>

      <!-- Important Note -->
      <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 12px; margin: 24px 0;">
        <p style="font-size: 14px; font-weight: 600; color: #1e40af; margin-bottom: 4px; margin-top: 0; display: flex; align-items: center;">💼 Professional Note</p>
        <p style="font-size: 13px; color: #1e3a8a; line-height: 1.5; margin: 0;">If you need to reschedule this session, please notify the client as soon as possible through your dashboard or contact support@polariz.ai for assistance.</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f7fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 13px; color: #718096; line-height: 1.6; margin-bottom: 8px; margin-top: 0;"><strong>Need support?</strong> We''re here to help!<br />Contact us at <a href="mailto:support@polariz.ai" style="color: #f59e0b; text-decoration: none;">support@polariz.ai</a></p>
      
      <div style="height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 20px auto; max-width: 200px;"></div>
      
      <p style="font-size: 13px; color: #718096; line-height: 1.6; margin: 0;">© 2025 Polariz. All rights reserved.<br />Helping children find their voice through AI-powered speech therapy.</p>
    </div>
  </div>
</body>
</html>',
  'Appointment reminder email for therapists',
  '["therapist_name", "client_name", "session_date", "session_time", "duration", "session_type", "dashboard_url"]'::jsonb,
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
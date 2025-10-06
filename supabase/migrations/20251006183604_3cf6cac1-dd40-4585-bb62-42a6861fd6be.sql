-- Update booking confirmation template for clients
UPDATE public.email_templates
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); overflow: hidden;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
      <div style="display: inline-flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" style="width: 48px; height: 48px;">
          <path d="M12 2L14.5 9H21L15.5 13.5L17.5 20.5L12 16L6.5 20.5L8.5 13.5L3 9H9.5L12 2Z" fill="white" stroke="white" stroke-width="1"/>
        </svg>
        <span style="font-size: 32px; font-weight: 700; color: white; letter-spacing: -0.5px;">Polariz</span>
      </div>
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px;">Booking Confirmed! ✅</h1>
      <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">Your therapy session has been successfully scheduled</p>
    </div>
    
    <div style="padding: 48px 40px;">
      <p style="font-size: 18px; color: #1a1a1a; font-weight: 600; margin: 0 0 16px 0;">Hi {{clientName}}!</p>
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568; margin: 0 0 32px 0;">Great news! Your therapy session with {{therapistName}} has been confirmed. We''re looking forward to supporting you on your speech therapy journey.</p>
      
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 16px; padding: 28px; margin: 32px 0; border: 2px solid #10b981;">
        <p style="font-size: 18px; font-weight: 700; color: #065f46; margin: 0 0 20px 0; text-align: center;">📅 Session Details</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600; width: 40%;">Therapist:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{therapistName}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600;">Date:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{sessionDate}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600;">Time:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{sessionTime}} ({{duration}} minutes)</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600;">Session Type:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{sessionType}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600;">Price:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">${{price}}</td>
          </tr>
        </table>
      </div>
      
      <div style="background: #f7fafc; border-radius: 16px; padding: 24px; margin: 32px 0;">
        <p style="font-size: 16px; font-weight: 600; color: #2d3748; margin: 0 0 16px 0; text-align: center;">Preparing for your session:</p>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="display: flex; align-items: center; padding: 8px 0; color: #4a5568; font-size: 14px;">
            <span style="margin-right: 12px; font-size: 18px;">💻</span>
            <span>Test your camera and microphone beforehand</span>
          </li>
          <li style="display: flex; align-items: center; padding: 8px 0; color: #4a5568; font-size: 14px;">
            <span style="margin-right: 12px; font-size: 18px;">🌐</span>
            <span>Ensure a stable internet connection</span>
          </li>
          <li style="display: flex; align-items: center; padding: 8px 0; color: #4a5568; font-size: 14px;">
            <span style="margin-right: 12px; font-size: 18px;">🤫</span>
            <span>Find a quiet, comfortable space</span>
          </li>
          <li style="display: flex; align-items: center; padding: 8px 0; color: #4a5568; font-size: 14px;">
            <span style="margin-right: 12px; font-size: 18px;">📝</span>
            <span>Have any questions or concerns ready to discuss</span>
          </li>
        </ul>
      </div>
      
      <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 12px; margin: 24px 0;">
        <p style="font-size: 14px; font-weight: 600; color: #1e40af; margin: 0 0 4px 0; display: flex; align-items: center;">📌 Need to Reschedule?</p>
        <p style="font-size: 13px; color: #1e3a8a; line-height: 1.5; margin: 0;">Please notify us at least 24 hours in advance if you need to reschedule or cancel your appointment. Contact us at support@polariz.ai.</p>
      </div>
    </div>
    
    <div style="background: #f7fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 13px; color: #718096; line-height: 1.6; margin: 0 0 8px 0;">
        <strong>Questions or concerns?</strong> We''re here to help!<br />
        Contact us at <a href="mailto:support@polariz.ai" style="color: #10b981; text-decoration: none;">support@polariz.ai</a>
      </p>
      <div style="height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 20px auto; max-width: 200px;"></div>
      <p style="font-size: 13px; color: #718096; line-height: 1.6;">© 2025 Polariz. All rights reserved.<br />Helping children find their voice through AI-powered speech therapy.</p>
    </div>
  </div>
</body>
</html>',
subject = 'Booking Confirmed - Your Therapy Session ✅'
WHERE template_name = 'booking_confirmation';

-- Update appointment reminder template for clients
UPDATE public.email_templates
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); overflow: hidden;">
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
      <div style="display: inline-flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" style="width: 48px; height: 48px;">
          <path d="M12 2L14.5 9H21L15.5 13.5L17.5 20.5L12 16L6.5 20.5L8.5 13.5L3 9H9.5L12 2Z" fill="white" stroke="white" stroke-width="1"/>
        </svg>
        <span style="font-size: 32px; font-weight: 700; color: white; letter-spacing: -0.5px;">Polariz</span>
      </div>
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px;">Session Reminder ⏰</h1>
      <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">Your therapy session is coming up soon!</p>
    </div>
    
    <div style="padding: 48px 40px;">
      <p style="font-size: 18px; color: #1a1a1a; font-weight: 600; margin: 0 0 16px 0;">Hi {{clientName}}!</p>
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568; margin: 0 0 32px 0;">This is a friendly reminder that you have a therapy session scheduled for tomorrow. We''re looking forward to seeing you!</p>
      
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 28px; margin: 32px 0; border: 2px solid #f59e0b;">
        <p style="font-size: 18px; font-weight: 700; color: #92400e; margin: 0 0 20px 0; text-align: center;">📅 Session Details</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; color: #92400e; font-size: 14px; font-weight: 600; width: 40%;">Therapist:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{therapistName}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #92400e; font-size: 14px; font-weight: 600;">Date:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{sessionDate}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #92400e; font-size: 14px; font-weight: 600;">Time:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{sessionTime}} ({{duration}} minutes)</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #92400e; font-size: 14px; font-weight: 600;">Session Type:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{sessionType}}</td>
          </tr>
        </table>
      </div>
      
      <div style="background: #f7fafc; border-radius: 16px; padding: 24px; margin: 32px 0;">
        <p style="font-size: 16px; font-weight: 600; color: #2d3748; margin: 0 0 16px 0; text-align: center;">Quick checklist before your session:</p>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="display: flex; align-items: center; padding: 8px 0; color: #4a5568; font-size: 14px;">
            <span style="margin-right: 12px; font-size: 18px;">✅</span>
            <span>Camera and microphone tested and working</span>
          </li>
          <li style="display: flex; align-items: center; padding: 8px 0; color: #4a5568; font-size: 14px;">
            <span style="margin-right: 12px; font-size: 18px;">✅</span>
            <span>Good internet connection confirmed</span>
          </li>
          <li style="display: flex; align-items: center; padding: 8px 0; color: #4a5568; font-size: 14px;">
            <span style="margin-right: 12px; font-size: 18px;">✅</span>
            <span>Quiet space arranged</span>
          </li>
          <li style="display: flex; align-items: center; padding: 8px 0; color: #4a5568; font-size: 14px;">
            <span style="margin-right: 12px; font-size: 18px;">✅</span>
            <span>Any materials or questions prepared</span>
          </li>
        </ul>
      </div>
      
      <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 12px; margin: 24px 0;">
        <p style="font-size: 14px; font-weight: 600; color: #991b1b; margin: 0 0 4px 0; display: flex; align-items: center;">⚠️ Can''t Make It?</p>
        <p style="font-size: 13px; color: #7f1d1d; line-height: 1.5; margin: 0;">If you need to cancel or reschedule, please let us know as soon as possible. Contact us at support@polariz.ai.</p>
      </div>
    </div>
    
    <div style="background: #f7fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 13px; color: #718096; line-height: 1.6; margin: 0 0 8px 0;">
        <strong>Need help?</strong> We''re here for you!<br />
        Contact us at <a href="mailto:support@polariz.ai" style="color: #f59e0b; text-decoration: none;">support@polariz.ai</a>
      </p>
      <div style="height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 20px auto; max-width: 200px;"></div>
      <p style="font-size: 13px; color: #718096; line-height: 1.6;">© 2025 Polariz. All rights reserved.<br />Helping children find their voice through AI-powered speech therapy.</p>
    </div>
  </div>
</body>
</html>',
subject = 'Reminder: Your Therapy Session is Tomorrow ⏰'
WHERE template_name = 'appointment_reminder_client';

-- Update booking confirmation template for therapists
UPDATE public.email_templates
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); overflow: hidden;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
      <div style="display: inline-flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" style="width: 48px; height: 48px;">
          <path d="M12 2L14.5 9H21L15.5 13.5L17.5 20.5L12 16L6.5 20.5L8.5 13.5L3 9H9.5L12 2Z" fill="white" stroke="white" stroke-width="1"/>
        </svg>
        <span style="font-size: 32px; font-weight: 700; color: white; letter-spacing: -0.5px;">Polariz</span>
      </div>
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px;">New Booking Confirmed! ✅</h1>
      <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">A new therapy session has been scheduled with your client</p>
    </div>
    
    <div style="padding: 48px 40px;">
      <p style="font-size: 18px; color: #1a1a1a; font-weight: 600; margin: 0 0 16px 0;">Hi {{therapistName}}!</p>
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568; margin: 0 0 32px 0;">You have a new therapy session booked with {{clientName}}. Please review the session details below.</p>
      
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 16px; padding: 28px; margin: 32px 0; border: 2px solid #10b981;">
        <p style="font-size: 18px; font-weight: 700; color: #065f46; margin: 0 0 20px 0; text-align: center;">📅 Session Details</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600; width: 40%;">Client:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{clientName}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600;">Date:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{sessionDate}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600;">Time:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{sessionTime}} ({{duration}} minutes)</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600;">Session Type:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{sessionType}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #065f46; font-size: 14px; font-weight: 600;">Payment:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">${{price}}</td>
          </tr>
        </table>
      </div>
    </div>
    
    <div style="background: #f7fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 13px; color: #718096; line-height: 1.6; margin: 0 0 8px 0;">
        <strong>Questions?</strong> We''re here to help!<br />
        Contact us at <a href="mailto:support@polariz.ai" style="color: #10b981; text-decoration: none;">support@polariz.ai</a>
      </p>
      <div style="height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 20px auto; max-width: 200px;"></div>
      <p style="font-size: 13px; color: #718096; line-height: 1.6;">© 2025 Polariz. All rights reserved.<br />Helping children find their voice through AI-powered speech therapy.</p>
    </div>
  </div>
</body>
</html>',
subject = 'New Booking: Session Scheduled with Client ✅'
WHERE template_name = 'booking_confirmation_therapist';

-- Update appointment reminder template for therapists
UPDATE public.email_templates
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); overflow: hidden;">
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
      <div style="display: inline-flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" style="width: 48px; height: 48px;">
          <path d="M12 2L14.5 9H21L15.5 13.5L17.5 20.5L12 16L6.5 20.5L8.5 13.5L3 9H9.5L12 2Z" fill="white" stroke="white" stroke-width="1"/>
        </svg>
        <span style="font-size: 32px; font-weight: 700; color: white; letter-spacing: -0.5px;">Polariz</span>
      </div>
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px;">Session Reminder ⏰</h1>
      <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">You have a client session scheduled for tomorrow</p>
    </div>
    
    <div style="padding: 48px 40px;">
      <p style="font-size: 18px; color: #1a1a1a; font-weight: 600; margin: 0 0 16px 0;">Hi {{therapistName}}!</p>
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568; margin: 0 0 32px 0;">This is a friendly reminder that you have a therapy session scheduled for tomorrow with {{clientName}}.</p>
      
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 28px; margin: 32px 0; border: 2px solid #f59e0b;">
        <p style="font-size: 18px; font-weight: 700; color: #92400e; margin: 0 0 20px 0; text-align: center;">📅 Session Details</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; color: #92400e; font-size: 14px; font-weight: 600; width: 40%;">Client:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{clientName}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #92400e; font-size: 14px; font-weight: 600;">Date:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{sessionDate}}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #92400e; font-size: 14px; font-weight: 600;">Time:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{sessionTime}} ({{duration}} minutes)</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #92400e; font-size: 14px; font-weight: 600;">Session Type:</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px;">{{sessionType}}</td>
          </tr>
        </table>
      </div>
    </div>
    
    <div style="background: #f7fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 13px; color: #718096; line-height: 1.6; margin: 0 0 8px 0;">
        <strong>Need help?</strong> We''re here for you!<br />
        Contact us at <a href="mailto:support@polariz.ai" style="color: #f59e0b; text-decoration: none;">support@polariz.ai</a>
      </p>
      <div style="height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 20px auto; max-width: 200px;"></div>
      <p style="font-size: 13px; color: #718096; line-height: 1.6;">© 2025 Polariz. All rights reserved.<br />Helping children find their voice through AI-powered speech therapy.</p>
    </div>
  </div>
</body>
</html>',
subject = 'Reminder: Client Session Tomorrow ⏰'
WHERE template_name = 'appointment_reminder_therapist';
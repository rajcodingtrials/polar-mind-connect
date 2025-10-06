-- Fix all email templates with proper email-compatible HTML using tables and inline styles

-- Update booking_confirmation_client template
UPDATE email_templates 
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed - Polariz</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 48px 32px; text-align: center;">
              <div style="margin-bottom: 24px;">
                <svg width="48" height="48" viewBox="0 0 24 24" style="display: inline-block;">
                  <path d="M12 2L14.5 9H21L15.5 13.5L17.5 20.5L12 16L6.5 20.5L8.5 13.5L3 9H9.5L12 2Z" fill="white" stroke="white" stroke-width="1"/>
                </svg>
              </div>
              <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Polariz</h1>
              <h2 style="margin: 0 0 12px 0; color: #ffffff; font-size: 28px; font-weight: 700;">Booking Confirmed! ✅</h2>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.95); font-size: 16px;">Your therapy session has been successfully scheduled</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">Hi {{clientName}}!</h3>
              <p style="margin: 0 0 32px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Great news! Your therapy session with {{therapistName}} has been confirmed. We''re looking forward to supporting you on your speech therapy journey.</p>
              
              <!-- Session Details Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 3px solid #10b981; border-radius: 12px; background-color: #f0fdf4; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 24px;">
                    <h4 style="margin: 0 0 20px 0; color: #065f46; font-size: 20px; font-weight: 600;">📅 Session Details</h4>
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #065f46; font-size: 14px; font-weight: 600; width: 140px;">Therapist:</td>
                              <td style="color: #111827; font-size: 14px;">{{therapistName}}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #065f46; font-size: 14px; font-weight: 600; width: 140px;">Date:</td>
                              <td style="color: #111827; font-size: 14px;">{{sessionDate}}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #065f46; font-size: 14px; font-weight: 600; width: 140px;">Time:</td>
                              <td style="color: #111827; font-size: 14px;">{{sessionTime}}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #065f46; font-size: 14px; font-weight: 600; width: 140px;">Duration:</td>
                              <td style="color: #111827; font-size: 14px;">{{duration}} minutes</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #065f46; font-size: 14px; font-weight: 600; width: 140px;">Session Type:</td>
                              <td style="color: #111827; font-size: 14px;">{{sessionType}}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #065f46; font-size: 14px; font-weight: 600; width: 140px;">Price:</td>
                              <td style="color: #111827; font-size: 14px; font-weight: 700;">${{price}}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Preparation Tips -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 32px; border-radius: 8px;">
                <h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 18px; font-weight: 600;">💡 How to Prepare</h4>
                <ul style="margin: 0; padding-left: 20px; color: #1e3a8a;">
                  <li style="margin-bottom: 8px; line-height: 1.6;">Find a quiet, comfortable space for your session</li>
                  <li style="margin-bottom: 8px; line-height: 1.6;">Test your internet connection and audio/video setup</li>
                  <li style="margin-bottom: 8px; line-height: 1.6;">Have any relevant materials or notes ready</li>
                  <li style="margin-bottom: 0; line-height: 1.6;">Join a few minutes early to ensure everything is working</li>
                </ul>
              </div>
              
              <!-- Important Note -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;"><strong>Important:</strong> If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Need help? Contact us at <a href="mailto:support@polariz.ai" style="color: #10b981; text-decoration: none;">support@polariz.ai</a></p>
              <p style="margin: 0 0 16px 0; color: #9ca3af; font-size: 12px;">&copy; 2025 Polariz. All rights reserved.</p>
              <p style="margin: 0; font-size: 11px;">
                <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 8px;">Privacy Policy</a>
                <span style="color: #d1d5db;">|</span>
                <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 8px;">Terms of Service</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
WHERE template_name = 'booking_confirmation';

-- Update appointment_reminder_client template
UPDATE email_templates 
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Session Reminder - Polariz</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 48px 32px; text-align: center;">
              <div style="margin-bottom: 24px;">
                <svg width="48" height="48" viewBox="0 0 24 24" style="display: inline-block;">
                  <path d="M12 2L14.5 9H21L15.5 13.5L17.5 20.5L12 16L6.5 20.5L8.5 13.5L3 9H9.5L12 2Z" fill="white" stroke="white" stroke-width="1"/>
                </svg>
              </div>
              <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Polariz</h1>
              <h2 style="margin: 0 0 12px 0; color: #ffffff; font-size: 28px; font-weight: 700;">Session Reminder 🔔</h2>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.95); font-size: 16px;">Your session is coming up tomorrow!</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">Hi {{clientName}}!</h3>
              <p style="margin: 0 0 32px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">This is a friendly reminder that your therapy session with {{therapistName}} is scheduled for tomorrow. We''re looking forward to seeing you!</p>
              
              <!-- Session Details Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 3px solid #8b5cf6; border-radius: 12px; background-color: #faf5ff; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 24px;">
                    <h4 style="margin: 0 0 20px 0; color: #6b21a8; font-size: 20px; font-weight: 600;">📅 Session Details</h4>
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9d5ff;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #6b21a8; font-size: 14px; font-weight: 600; width: 140px;">Therapist:</td>
                              <td style="color: #111827; font-size: 14px;">{{therapistName}}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9d5ff;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #6b21a8; font-size: 14px; font-weight: 600; width: 140px;">Date:</td>
                              <td style="color: #111827; font-size: 14px;">{{sessionDate}}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9d5ff;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #6b21a8; font-size: 14px; font-weight: 600; width: 140px;">Time:</td>
                              <td style="color: #111827; font-size: 14px;">{{sessionTime}}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #6b21a8; font-size: 14px; font-weight: 600; width: 140px;">Duration:</td>
                              <td style="color: #111827; font-size: 14px;">{{duration}} minutes</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Quick Checklist -->
              <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 32px; border-radius: 8px;">
                <h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 18px; font-weight: 600;">✓ Quick Checklist</h4>
                <ul style="margin: 0; padding-left: 20px; color: #1e3a8a;">
                  <li style="margin-bottom: 8px; line-height: 1.6;">Check your internet connection</li>
                  <li style="margin-bottom: 8px; line-height: 1.6;">Test your audio and video</li>
                  <li style="margin-bottom: 8px; line-height: 1.6;">Prepare any questions or materials</li>
                  <li style="margin-bottom: 0; line-height: 1.6;">Find a quiet space</li>
                </ul>
              </div>
              
              <!-- Important Note -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;"><strong>Can''t make it?</strong> Please contact us as soon as possible to reschedule.</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Need help? Contact us at <a href="mailto:support@polariz.ai" style="color: #8b5cf6; text-decoration: none;">support@polariz.ai</a></p>
              <p style="margin: 0 0 16px 0; color: #9ca3af; font-size: 12px;">&copy; 2025 Polariz. All rights reserved.</p>
              <p style="margin: 0; font-size: 11px;">
                <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 8px;">Privacy Policy</a>
                <span style="color: #d1d5db;">|</span>
                <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 8px;">Terms of Service</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
WHERE template_name = 'appointment_reminder';

-- Update therapist_booking_notification template
UPDATE email_templates 
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking - Polariz</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 48px 32px; text-align: center;">
              <div style="margin-bottom: 24px;">
                <svg width="48" height="48" viewBox="0 0 24 24" style="display: inline-block;">
                  <path d="M12 2L14.5 9H21L15.5 13.5L17.5 20.5L12 16L6.5 20.5L8.5 13.5L3 9H9.5L12 2Z" fill="white" stroke="white" stroke-width="1"/>
                </svg>
              </div>
              <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Polariz</h1>
              <h2 style="margin: 0 0 12px 0; color: #ffffff; font-size: 28px; font-weight: 700;">New Booking! 📋</h2>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.95); font-size: 16px;">You have a new therapy session scheduled</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">Hi {{therapistName}}!</h3>
              <p style="margin: 0 0 32px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">You have a new booking from {{clientName}}. Please review the session details below.</p>
              
              <!-- Session Details Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 3px solid #0ea5e9; border-radius: 12px; background-color: #f0f9ff; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 24px;">
                    <h4 style="margin: 0 0 20px 0; color: #075985; font-size: 20px; font-weight: 600;">📅 Session Details</h4>
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #bae6fd;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #075985; font-size: 14px; font-weight: 600; width: 140px;">Client:</td>
                              <td style="color: #111827; font-size: 14px;">{{clientName}}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #bae6fd;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #075985; font-size: 14px; font-weight: 600; width: 140px;">Date:</td>
                              <td style="color: #111827; font-size: 14px;">{{sessionDate}}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #bae6fd;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #075985; font-size: 14px; font-weight: 600; width: 140px;">Time:</td>
                              <td style="color: #111827; font-size: 14px;">{{sessionTime}}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #bae6fd;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #075985; font-size: 14px; font-weight: 600; width: 140px;">Duration:</td>
                              <td style="color: #111827; font-size: 14px;">{{duration}} minutes</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #075985; font-size: 14px; font-weight: 600; width: 140px;">Session Type:</td>
                              <td style="color: #111827; font-size: 14px;">{{sessionType}}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Client Notes (if any) -->
              {{#if clientNotes}}
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 32px; border-radius: 8px;">
                <h4 style="margin: 0 0 12px 0; color: #92400e; font-size: 18px; font-weight: 600;">📝 Client Notes</h4>
                <p style="margin: 0; color: #78350f; line-height: 1.6;">{{clientNotes}}</p>
              </div>
              {{/if}}
              
              <!-- Action Note -->
              <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px;">
                <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;"><strong>Next Steps:</strong> Please confirm your availability or contact the client if you need to reschedule.</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Questions? Contact us at <a href="mailto:support@polariz.ai" style="color: #0ea5e9; text-decoration: none;">support@polariz.ai</a></p>
              <p style="margin: 0 0 16px 0; color: #9ca3af; font-size: 12px;">&copy; 2025 Polariz. All rights reserved.</p>
              <p style="margin: 0; font-size: 11px;">
                <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 8px;">Privacy Policy</a>
                <span style="color: #d1d5db;">|</span>
                <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 8px;">Terms of Service</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
WHERE template_name = 'therapist_booking_notification';

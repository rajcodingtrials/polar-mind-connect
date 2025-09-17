-- Insert therapist booking notification email template
INSERT INTO email_templates (
  template_name,
  subject,
  html_content,
  description,
  variables,
  is_active
) VALUES (
  'therapist_booking_notification',
  'New Therapy Session Booked - {{client_name}}',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Session Booked</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">New Therapy Session Booked</h1>
        
        <p>Hello Dr. {{therapist_name}},</p>
        
        <p>You have a new therapy session booking:</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Session Details</h3>
            <p><strong>Client:</strong> {{client_name}}</p>
            <p><strong>Date:</strong> {{session_date}}</p>
            <p><strong>Time:</strong> {{session_time}}</p>
            <p><strong>Duration:</strong> {{duration}} minutes</p>
            <p><strong>Session Type:</strong> {{session_type}}</p>
            <p><strong>Amount:</strong> ${{amount}}</p>
        </div>
        
        {{#client_notes}}
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #92400e;">Client Notes</h4>
            <p>{{client_notes}}</p>
        </div>
        {{/client_notes}}
        
        <p>Please prepare for this session and reach out to the client if you need any additional information.</p>
        
        <p>Best regards,<br>
        The Therapy Platform Team</p>
    </div>
</body>
</html>',
  'Email template for notifying therapists about new session bookings',
  '["therapist_name", "client_name", "session_date", "session_time", "duration", "session_type", "amount", "client_notes"]',
  true
),
(
  'therapist_appointment_reminder',
  'Appointment Reminder - {{client_name}} at {{session_time}}',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Appointment Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Appointment Reminder</h1>
        
        <p>Hello Dr. {{therapist_name}},</p>
        
        <p>This is a reminder about your upcoming therapy session:</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Session Details</h3>
            <p><strong>Client:</strong> {{client_name}}</p>
            <p><strong>Date:</strong> {{session_date}}</p>
            <p><strong>Time:</strong> {{session_time}}</p>
            <p><strong>Duration:</strong> {{duration}} minutes</p>
            <p><strong>Session Type:</strong> {{session_type}}</p>
        </div>
        
        <p>Please ensure you are prepared and available for this session.</p>
        
        <p>Best regards,<br>
        The Therapy Platform Team</p>
    </div>
</body>
</html>',
  'Email template for sending appointment reminders to therapists',
  '["therapist_name", "client_name", "session_date", "session_time", "duration", "session_type"]',
  true
);
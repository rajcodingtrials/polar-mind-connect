-- Create email templates table for storing reusable email templates
CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name text NOT NULL UNIQUE,
  subject text NOT NULL,
  html_content text NOT NULL,
  variables jsonb NOT NULL DEFAULT '[]'::jsonb,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view active templates" 
ON public.email_templates 
FOR SELECT 
USING (auth.role() = 'authenticated'::text AND is_active = true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_email_templates_updated_at();

-- Insert the existing email templates
INSERT INTO public.email_templates (template_name, subject, html_content, variables, description) VALUES 
(
  'booking_confirmation',
  'Booking Confirmation - Your Therapy Session',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0; font-size: 28px;">Booking Confirmed!</h1>
        <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Your therapy session has been successfully booked</p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #1e40af; margin: 0 0 20px 0; font-size: 20px;">Session Details</h2>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #374151;">Client:</strong> {{clientName}}
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #374151;">Therapist:</strong> {{therapistName}}
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #374151;">Date:</strong> {{sessionDate}}
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #374151;">Time:</strong> {{sessionTime}}
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #374151;">Duration:</strong> {{duration}} minutes
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #374151;">Session Type:</strong> {{sessionType}}
        </div>
        
        <div style="margin-bottom: 0;">
          <strong style="color: #374151;">Amount Paid:</strong> ${{price}}
        </div>
      </div>
      
      <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 25px;">
        <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 16px;">What to Expect</h3>
        <ul style="color: #047857; margin: 0; padding-left: 20px;">
          <li>You''ll receive a reminder email 24 hours before your session</li>
          <li>Please arrive 5 minutes early to your appointment</li>
          <li>Bring any relevant documents or notes you''d like to discuss</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #666; margin: 0 0 15px 0;">Need to reschedule or have questions?</p>
        <a href="mailto:support@polariz.com" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Contact Support</a>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; margin: 0; font-size: 14px;">
          Thank you for choosing Polariz Therapy.<br>
          We''re here to support your mental health journey.
        </p>
      </div>
    </div>
  </div>',
  '["clientName", "therapistName", "sessionDate", "sessionTime", "duration", "sessionType", "price"]'::jsonb,
  'Email template for booking confirmations'
),
(
  'appointment_reminder',
  'Reminder: Your Therapy Session Tomorrow',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #f59e0b; margin: 0; font-size: 28px;">Session Reminder</h1>
        <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Your therapy session is coming up soon</p>
      </div>
      
      <div style="background-color: #fef3c7; padding: 25px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
        <h2 style="color: #92400e; margin: 0 0 15px 0; font-size: 20px;">⏰ {{hoursUntil}} hours to go!</h2>
        <p style="color: #92400e; margin: 0; font-size: 16px;">Your appointment with {{therapistName}} is scheduled for tomorrow.</p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="color: #1e40af; margin: 0 0 20px 0; font-size: 18px;">Session Details</h3>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #374151;">Client:</strong> {{clientName}}
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #374151;">Therapist:</strong> {{therapistName}}
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #374151;">Date:</strong> {{sessionDate}}
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #374151;">Time:</strong> {{sessionTime}}
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #374151;">Duration:</strong> {{duration}} minutes
        </div>
        
        <div style="margin-bottom: 0;">
          <strong style="color: #374151;">Session Type:</strong> {{sessionType}}
        </div>
      </div>
      
      <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 25px;">
        <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 16px;">Preparation Tips</h3>
        <ul style="color: #047857; margin: 0; padding-left: 20px;">
          <li>Arrive 5-10 minutes early</li>
          <li>Prepare any topics or questions you''d like to discuss</li>
          <li>Ensure you''re in a quiet, private space for your session</li>
          <li>Have water nearby and make yourself comfortable</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #666; margin: 0 0 15px 0;">Need to reschedule or have questions?</p>
        <a href="mailto:support@polariz.com" style="background-color: #f59e0b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin-right: 10px;">Contact Support</a>
        <a href="tel:+1234567890" style="background-color: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Call Us</a>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; margin: 0; font-size: 14px;">
          We look forward to seeing you tomorrow!<br>
          Polariz Therapy Team
        </p>
      </div>
    </div>
  </div>',
  '["clientName", "therapistName", "sessionDate", "sessionTime", "duration", "sessionType", "hoursUntil"]'::jsonb,
  'Email template for appointment reminders'
);

-- Create a table for TTS configuration settings
CREATE TABLE public.tts_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voice TEXT NOT NULL DEFAULT 'nova',
  speed DECIMAL(3,2) NOT NULL DEFAULT 1.0 CHECK (speed >= 0.25 AND speed <= 4.0),
  enable_ssml BOOLEAN NOT NULL DEFAULT false,
  sample_ssml TEXT NOT NULL DEFAULT '<speak>Hello! <break time="0.5s"/> I am Laura, your speech therapy assistant. <emphasis level="strong">Let''s have fun learning together!</emphasis></speak>',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.tts_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for TTS settings (admins only)
CREATE POLICY "Admins can view TTS settings" 
  ON public.tts_settings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert TTS settings" 
  ON public.tts_settings 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update TTS settings" 
  ON public.tts_settings 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default TTS settings
INSERT INTO public.tts_settings (voice, speed, enable_ssml, sample_ssml) 
VALUES (
  'nova', 
  1.0, 
  false, 
  '<speak>Hello! <break time="0.5s"/> I am Laura, your speech therapy assistant. <emphasis level="strong">Let''s have fun learning together!</emphasis></speak>'
);

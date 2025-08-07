-- Create therapist specializations table
CREATE TABLE public.therapist_specializations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create therapists table
CREATE TABLE public.therapists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  bio TEXT,
  specializations TEXT[] DEFAULT '{}',
  hourly_rate_30min DECIMAL(10,2),
  hourly_rate_60min DECIMAL(10,2),
  avatar_url TEXT,
  years_experience INTEGER DEFAULT 0,
  certification TEXT,
  timezone TEXT DEFAULT 'UTC',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create therapist availability table
CREATE TABLE public.therapist_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (therapist_id) REFERENCES public.therapists(id) ON DELETE CASCADE,
  UNIQUE(therapist_id, day_of_week, start_time, end_time)
);

-- Create therapy sessions table
CREATE TABLE public.therapy_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  therapist_id UUID NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  price_paid DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  therapist_notes TEXT,
  client_notes TEXT,
  session_type TEXT NOT NULL DEFAULT 'consultation' CHECK (session_type IN ('consultation', 'therapy', 'follow_up')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (therapist_id) REFERENCES public.therapists(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.therapist_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for therapist_specializations
CREATE POLICY "Anyone can view specializations" 
ON public.therapist_specializations 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage specializations" 
ON public.therapist_specializations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for therapists
CREATE POLICY "Anyone can view active therapists" 
ON public.therapists 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Therapists can view their own profile" 
ON public.therapists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Therapists can update their own profile" 
ON public.therapists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Therapists can create their own profile" 
ON public.therapists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'therapist'::app_role));

CREATE POLICY "Admins can manage all therapists" 
ON public.therapists 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for therapist_availability
CREATE POLICY "Anyone can view availability" 
ON public.therapist_availability 
FOR SELECT 
USING (is_available = true);

CREATE POLICY "Therapists can manage their own availability" 
ON public.therapist_availability 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.therapists 
    WHERE therapists.id = therapist_availability.therapist_id 
    AND therapists.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all availability" 
ON public.therapist_availability 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for therapy_sessions
CREATE POLICY "Clients can view their own sessions" 
ON public.therapy_sessions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = therapy_sessions.client_id 
    AND profiles.id = auth.uid()
  )
);

CREATE POLICY "Therapists can view their own sessions" 
ON public.therapy_sessions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.therapists 
    WHERE therapists.id = therapy_sessions.therapist_id 
    AND therapists.user_id = auth.uid()
  )
);

CREATE POLICY "Clients can create sessions" 
ON public.therapy_sessions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = therapy_sessions.client_id 
    AND profiles.id = auth.uid()
  )
);

CREATE POLICY "Therapists can update their own sessions" 
ON public.therapy_sessions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.therapists 
    WHERE therapists.id = therapy_sessions.therapist_id 
    AND therapists.user_id = auth.uid()
  )
);

CREATE POLICY "Clients can update their own sessions" 
ON public.therapy_sessions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = therapy_sessions.client_id 
    AND profiles.id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all sessions" 
ON public.therapy_sessions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON public.therapists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_therapist_availability_updated_at
  BEFORE UPDATE ON public.therapist_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_therapy_sessions_updated_at
  BEFORE UPDATE ON public.therapy_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default specializations
INSERT INTO public.therapist_specializations (name, description, category) VALUES
('Speech Therapy', 'Treatment of speech and language disorders', 'Communication'),
('Language Development', 'Support for language acquisition and development', 'Communication'),
('Articulation Therapy', 'Correction of speech sound production', 'Communication'),
('Fluency Disorders', 'Treatment for stuttering and other fluency issues', 'Communication'),
('Voice Therapy', 'Treatment for voice disorders and vocal hygiene', 'Communication'),
('Autism Spectrum Support', 'Specialized therapy for individuals with autism', 'Developmental'),
('Early Intervention', 'Therapy services for infants and toddlers', 'Developmental'),
('Cognitive Communication', 'Support for thinking and communication skills', 'Cognitive'),
('Swallowing Therapy', 'Treatment for swallowing difficulties', 'Medical'),
('Accent Modification', 'Support for accent reduction and clarity', 'Communication');
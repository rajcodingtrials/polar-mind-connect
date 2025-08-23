-- Create session ratings table for user feedback
CREATE TABLE public.session_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  client_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  categories TEXT[] DEFAULT '{}',
  would_recommend BOOLEAN DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.session_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for session ratings
CREATE POLICY "Clients can create their own session ratings" 
ON public.session_ratings 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = session_ratings.client_id 
    AND profiles.id = auth.uid()
  )
);

CREATE POLICY "Clients can view their own session ratings" 
ON public.session_ratings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = session_ratings.client_id 
    AND profiles.id = auth.uid()
  )
);

CREATE POLICY "Clients can update their own session ratings" 
ON public.session_ratings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = session_ratings.client_id 
    AND profiles.id = auth.uid()
  )
);

-- Allow therapists to view ratings for their sessions
CREATE POLICY "Therapists can view ratings for their sessions" 
ON public.session_ratings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM therapy_sessions 
    JOIN therapists ON therapy_sessions.therapist_id = therapists.id
    WHERE therapy_sessions.id = session_ratings.session_id 
    AND therapists.user_id = auth.uid()
  )
);

-- Allow admins to manage all ratings
CREATE POLICY "Admins can manage all session ratings" 
ON public.session_ratings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to update timestamps
CREATE TRIGGER update_session_ratings_updated_at
BEFORE UPDATE ON public.session_ratings
FOR EACH ROW
EXECUTE FUNCTION public.handle_therapist_updated_at();
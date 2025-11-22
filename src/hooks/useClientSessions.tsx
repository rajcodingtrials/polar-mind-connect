import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TherapySession {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  session_type: string;
  client_notes?: string;
  therapist_notes?: string;
  price_paid?: number;
  currency?: string;
  created_at: string;
  meeting_link?: string;
  zoom_meeting_id?: string;
  zoom_password?: string;
  therapist: {
    id: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

interface SessionRating {
  id: string;
  session_id: string;
  rating: number;
  feedback_text?: string;
  categories?: string[];
  would_recommend?: boolean;
  created_at: string;
}

interface ClientSessionStats {
  upcomingSessions: TherapySession[];
  completedSessions: TherapySession[];
  sessionRatings: SessionRating[];
  loading: boolean;
  error: string | null;
}

export const useClientSessions = (clientId: string | null) => {
  const [stats, setStats] = useState<ClientSessionStats>({
    upcomingSessions: [],
    completedSessions: [],
    sessionRatings: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchClientSessions = async () => {
      if (!clientId) {
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));
        
        const today = new Date().toISOString().split('T')[0];

        // Fetch all sessions with therapist details
        const { data: allSessions, error: sessionsError } = await supabase
          .from('therapy_sessions')
          .select(`
            *,
            therapists!inner (
              id,
              name,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('client_id', clientId)
          .order('session_date', { ascending: false });

        if (sessionsError) {
          throw sessionsError;
        }

        // Transform the data to match our interface
        const transformedSessions = allSessions?.map(session => ({
          ...session,
          therapist: session.therapists
        })) || [];

        // Fetch session ratings
        const { data: ratings, error: ratingsError } = await supabase
          .from('session_ratings')
          .select('*')
          .eq('client_id', clientId);

        if (ratingsError) {
          throw ratingsError;
        }

        // Separate upcoming and completed sessions
        const now = new Date();
        
        const upcoming = transformedSessions
          .filter(session => {
            // Show session as upcoming if:
            // 1. End time hasn't passed yet, OR
            // 2. Session ended within last 2 hours (grace period for late access)
            const sessionEndDateTime = new Date(`${session.session_date}T${session.end_time}`);
            const twoHoursAfterEnd = new Date(sessionEndDateTime.getTime() + 2 * 60 * 60 * 1000);
            return (sessionEndDateTime >= now || twoHoursAfterEnd >= now) && ['confirmed', 'pending'].includes(session.status);
          })
          .sort((a, b) => {
            // Sort by date and start time ascending (earliest first)
            const dateA = new Date(`${a.session_date}T${a.start_time}`);
            const dateB = new Date(`${b.session_date}T${b.start_time}`);
            return dateA.getTime() - dateB.getTime();
          });

        const completed = transformedSessions
          .filter(session => {
            const sessionDateTime = new Date(`${session.session_date}T${session.end_time}`);
            return session.status === 'completed' || session.status === 'cancelled' || (sessionDateTime < now && session.status === 'pending');
          })
          .map(session => {
            // Auto-mark past pending sessions as completed for display
            const sessionDateTime = new Date(`${session.session_date}T${session.end_time}`);
            return (sessionDateTime < now && session.status === 'pending')
              ? { ...session, status: 'completed' }
              : session;
          })
          .sort((a, b) => {
            // Sort by date and start time descending (most recent first)
            const dateA = new Date(`${a.session_date}T${a.start_time}`);
            const dateB = new Date(`${b.session_date}T${b.start_time}`);
            return dateB.getTime() - dateA.getTime();
          });

        setStats({
          upcomingSessions: upcoming,
          completedSessions: completed,
          sessionRatings: ratings || [],
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching client sessions:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch sessions',
        }));
      }
    };

    fetchClientSessions();
  }, [clientId]);

  const submitRating = async (sessionId: string, rating: number, feedbackText?: string, categories?: string[], wouldRecommend?: boolean) => {
    if (!clientId) throw new Error('Client ID required');

const { data, error } = await supabase
  .from('session_ratings')
  .upsert({
    session_id: sessionId,
    client_id: clientId,
    therapist_id: (await supabase
      .from('therapy_sessions')
      .select('therapist_id')
      .eq('id', sessionId)
      .single()
    ).data?.therapist_id,
    rating,
    feedback_text: feedbackText,
    categories: categories || [],
    would_recommend: wouldRecommend,
  })
  .select()
  .single();

    if (error) throw error;

    // Update local state
    setStats(prev => ({
      ...prev,
      sessionRatings: [
        ...prev.sessionRatings.filter(r => r.session_id !== sessionId),
        data
      ]
    }));

    return data;
  };

  return { ...stats, submitRating };
};
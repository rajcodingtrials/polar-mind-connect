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
}

interface SessionStats {
  todaySessions: number;
  totalSessions: number;
  sessions: TherapySession[];
  loading: boolean;
  error: string | null;
}

export const useTherapistSessions = (therapistId: string | null) => {
  const [stats, setStats] = useState<SessionStats>({
    todaySessions: 0,
    totalSessions: 0,
    sessions: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchSessionStats = async () => {
      if (!therapistId) {
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));
        
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

        // Fetch today's sessions
        const { data: todayData, error: todayError } = await supabase
          .from('therapy_sessions')
          .select('id')
          .eq('therapist_id', therapistId)
          .eq('session_date', today);

        if (todayError) {
          throw todayError;
        }

        // Fetch all sessions with full details
        const { data: allSessions, error: allSessionsError } = await supabase
          .from('therapy_sessions')
          .select('*')
          .eq('therapist_id', therapistId)
          .order('session_date', { ascending: true })
          .order('start_time', { ascending: true });

        if (allSessionsError) {
          throw allSessionsError;
        }

        // Count completed sessions
        const completedSessions = allSessions?.filter(session => session.status === 'completed') || [];

        // Separate and sort sessions
        const now = new Date();
        
        const upcoming = allSessions?.filter(session => {
          const sessionEndDateTime = new Date(`${session.session_date}T${session.end_time}`);
          return sessionEndDateTime >= now && ['confirmed', 'pending'].includes(session.status);
        }).sort((a, b) => {
          // Sort upcoming by date and start time ascending (earliest first)
          const dateA = new Date(`${a.session_date}T${a.start_time}`);
          const dateB = new Date(`${b.session_date}T${b.start_time}`);
          return dateA.getTime() - dateB.getTime();
        }) || [];

        const past = allSessions?.filter(session => {
          const sessionEndDateTime = new Date(`${session.session_date}T${session.end_time}`);
          return sessionEndDateTime < now || session.status === 'completed';
        }).sort((a, b) => {
          // Sort past sessions by date and start time descending (most recent first)
          const dateA = new Date(`${a.session_date}T${a.start_time}`);
          const dateB = new Date(`${b.session_date}T${b.start_time}`);
          return dateB.getTime() - dateA.getTime();
        }) || [];

        setStats({
          todaySessions: todayData?.length || 0,
          totalSessions: completedSessions.length,
          sessions: [...upcoming, ...past],
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching session stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch session stats',
        }));
      }
    };

    fetchSessionStats();
  }, [therapistId]);

  return stats;
};
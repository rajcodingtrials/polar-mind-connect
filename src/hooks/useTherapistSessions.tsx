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
          .order('created_at', { ascending: false });

        if (allSessionsError) {
          throw allSessionsError;
        }

        // Count completed sessions
        const completedSessions = allSessions?.filter(session => session.status === 'completed') || [];

        setStats({
          todaySessions: todayData?.length || 0,
          totalSessions: completedSessions.length,
          sessions: allSessions || [],
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
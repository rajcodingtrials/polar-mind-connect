import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SessionStats {
  todaySessions: number;
  totalSessions: number;
  loading: boolean;
  error: string | null;
}

export const useTherapistSessions = (therapistId: string | null) => {
  const [stats, setStats] = useState<SessionStats>({
    todaySessions: 0,
    totalSessions: 0,
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

        // Fetch total completed sessions
        const { data: totalData, error: totalError } = await supabase
          .from('therapy_sessions')
          .select('id')
          .eq('therapist_id', therapistId)
          .eq('status', 'completed');

        if (totalError) {
          throw totalError;
        }

        setStats({
          todaySessions: todayData?.length || 0,
          totalSessions: totalData?.length || 0,
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
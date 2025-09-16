import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEmailReminders = () => {
  useEffect(() => {
    const checkAndSendReminders = async () => {
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0];

        type SimpleSession = {
          id: string;
          client_id: string;
          therapist_id: string;
          session_date: string;
          start_time: string;
          duration_minutes: number;
          session_type: string;
        };

        const { data: rawSessions, error } = await supabase
          .from('therapy_sessions')
          .select('id, client_id, therapist_id, session_date, start_time, duration_minutes, session_type, reminder_sent, status')
          .eq('session_date', tomorrowString)
          .eq('status', 'confirmed')
          .eq('reminder_sent', false);

        if (error) {
          console.error('Error fetching sessions for reminders:', error);
          return;
        }

        const sessions = (rawSessions ?? []) as unknown as SimpleSession[];

        if (!sessions || sessions.length === 0) {
          console.log('No sessions found for reminder sending');
          return;
        }

        for (const session of sessions) {
          try {
            const { data: client, error: clientErr } = await supabase
              .from('profiles')
              .select('name, email')
              .eq('id', session.client_id)
              .maybeSingle();

            if (clientErr) {
              console.error('Error fetching client profile:', clientErr);
              continue;
            }

            const { data: therapist, error: thErr } = await supabase
              .from('therapists')
              .select('first_name, last_name')
              .eq('id', session.therapist_id)
              .maybeSingle();

            if (thErr) {
              console.error('Error fetching therapist:', thErr);
              continue;
            }

            if (!client?.email || !therapist) {
              console.log(`Skipping session ${session.id} - missing client email or therapist data`);
              continue;
            }

            await supabase.functions.invoke('send-appointment-reminder', {
              body: {
                sessionId: session.id,
                clientEmail: client.email,
                clientName: client.name || client.email,
                therapistName: `${therapist.first_name ?? ''} ${therapist.last_name ?? ''}`.trim(),
                sessionDate: session.session_date,
                sessionTime: session.start_time,
                duration: session.duration_minutes,
                sessionType: session.session_type,
              }
            });

            await supabase
              .from('therapy_sessions')
              .update({ reminder_sent: true })
              .eq('id', session.id);

            console.log(`Reminder sent for session ${session.id}`);
          } catch (err) {
            console.error(`Error sending reminder for session ${session.id}:`, err);
          }
        }
      } catch (error) {
        console.error('Error in checkAndSendReminders:', error);
      }
    };

    // Check for reminders when component mounts
    checkAndSendReminders();

    // Set up interval to check every hour
    const interval = setInterval(checkAndSendReminders, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Manual function to trigger reminder check
  const sendRemindersNow = async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      type SimpleSession = {
        id: string;
        client_id: string;
        therapist_id: string;
        session_date: string;
        start_time: string;
        duration_minutes: number;
        session_type: string;
      };

      const { data: rawSessions, error } = await supabase
        .from('therapy_sessions')
        .select('id, client_id, therapist_id, session_date, start_time, duration_minutes, session_type, reminder_sent, status')
        .eq('session_date', tomorrowString)
        .eq('status', 'confirmed')
        .eq('reminder_sent', false);

      if (error) throw error;

      const sessions = (rawSessions ?? []) as unknown as SimpleSession[];

      for (const session of sessions) {
        const { data: client } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', session.client_id)
          .maybeSingle();

        const { data: therapist } = await supabase
          .from('therapists')
          .select('first_name, last_name')
          .eq('id', session.therapist_id)
          .maybeSingle();

        if (!client?.email || !therapist) continue;

        await supabase.functions.invoke('send-appointment-reminder', {
          body: {
            sessionId: session.id,
            clientEmail: client.email,
            clientName: client.name || client.email,
            therapistName: `${therapist.first_name ?? ''} ${therapist.last_name ?? ''}`.trim(),
            sessionDate: session.session_date,
            sessionTime: session.start_time,
            duration: session.duration_minutes,
            sessionType: session.session_type,
          }
        });

        await supabase
          .from('therapy_sessions')
          .update({ reminder_sent: true })
          .eq('id', session.id);
      }

      return sessions.length;
    } catch (error) {
      console.error('Error sending reminders manually:', error);
      throw error;
    }
  };

  return { sendRemindersNow };
};
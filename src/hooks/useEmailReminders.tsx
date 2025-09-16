import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEmailReminders = () => {
  useEffect(() => {
    const checkAndSendReminders = async () => {
      try {
        // Get tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0];

        // Get sessions scheduled for tomorrow that haven't been reminded yet
        const { data: sessions, error } = await supabase
          .from('therapy_sessions')
          .select(`
            id,
            session_date,
            start_time,
            duration_minutes,
            session_type,
            reminder_sent,
            profiles!client_id (
              name,
              email
            ),
            therapist_profiles!therapist_id (
              first_name,
              last_name
            )
          `)
          .eq('session_date', tomorrowString)
          .eq('status', 'confirmed')
          .eq('reminder_sent', false);

        if (error) {
          console.error('Error fetching sessions for reminders:', error);
          return;
        }

        if (!sessions || sessions.length === 0) {
          console.log('No sessions found for reminder sending');
          return;
        }

        // Send reminders for each session
        for (const session of sessions) {
          try {
            const client = session.profiles;
            const therapist = session.therapist_profiles;

            if (!client?.email || !therapist) {
              console.log(`Skipping session ${session.id} - missing client email or therapist data`);
              continue;
            }

            // Send reminder email
            await supabase.functions.invoke('send-appointment-reminder', {
              body: {
                sessionId: session.id,
                clientEmail: client.email,
                clientName: client.name || client.email,
                therapistName: `${therapist.first_name} ${therapist.last_name}`,
                sessionDate: session.session_date,
                sessionTime: session.start_time,
                duration: session.duration_minutes,
                sessionType: session.session_type,
              }
            });

            // Mark reminder as sent
            await supabase
              .from('therapy_sessions')
              .update({ reminder_sent: true })
              .eq('id', session.id);

            console.log(`Reminder sent for session ${session.id}`);
          } catch (error) {
            console.error(`Error sending reminder for session ${session.id}:`, error);
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
    // This is the same logic as above, extracted for manual triggering
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      const { data: sessions, error } = await supabase
        .from('therapy_sessions')
        .select(`
          id,
          session_date,
          start_time,
          duration_minutes,
          session_type,
          reminder_sent,
          profiles!client_id (
            name,
            email
          ),
          therapist_profiles!therapist_id (
            first_name,
            last_name
          )
        `)
        .eq('session_date', tomorrowString)
        .eq('status', 'confirmed')
        .eq('reminder_sent', false);

      if (error) throw error;

      for (const session of sessions || []) {
        const client = session.profiles;
        const therapist = session.therapist_profiles;

        if (!client?.email || !therapist) continue;

        await supabase.functions.invoke('send-appointment-reminder', {
          body: {
            sessionId: session.id,
            clientEmail: client.email,
            clientName: client.name || client.email,
            therapistName: `${therapist.first_name} ${therapist.last_name}`,
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

      return sessions?.length || 0;
    } catch (error) {
      console.error('Error sending reminders manually:', error);
      throw error;
    }
  };

  return { sendRemindersNow };
};
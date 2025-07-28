import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface UserPreferences {
  speechDelayMode: boolean;
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    speechDelayMode: false,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load preferences from database
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('speech_delay_mode')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading user preferences:', error);
        } else {
          setPreferences({
            speechDelayMode: data.speech_delay_mode || false,
          });
        }
      } catch (err) {
        console.error('Failed to load user preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user?.id]);

  // Update speech delay mode
  const updateSpeechDelayMode = async (enabled: boolean) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ speech_delay_mode: enabled })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating speech delay mode:', error);
        toast({
          title: "Error",
          description: "Failed to save speech delay setting",
          variant: "destructive",
        });
        return;
      }

      setPreferences(prev => ({
        ...prev,
        speechDelayMode: enabled,
      }));

      toast({
        title: "Setting saved",
        description: `Speech delay mode ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (err) {
      console.error('Failed to update speech delay mode:', err);
      toast({
        title: "Error",
        description: "Failed to save speech delay setting",
        variant: "destructive",
      });
    }
  };

  return {
    preferences,
    loading,
    updateSpeechDelayMode,
  };
};
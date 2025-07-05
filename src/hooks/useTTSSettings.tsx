import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TTSSettings {
  voice: string;
  speed: number;
}

export const useTTSSettings = (therapistName: string) => {
  const [ttsSettings, setTtsSettings] = useState<TTSSettings>({ voice: 'nova', speed: 1.0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTTSSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('tts_settings')
          .select('*')
          .eq('therapist_name', therapistName)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error loading TTS settings:', error);
        }
        
        if (data) {
          setTtsSettings({
            voice: data.voice,
            speed: Number(data.speed)
          });
          console.log(`TTS Settings for ${therapistName}:`, {
            voice: data.voice,
            speed: Number(data.speed)
          });
        } else {
          // Fallback: Set default voice based on therapist name
          const defaultVoice = therapistName === 'Lawrence' ? 'echo' : 'nova';
          setTtsSettings({
            voice: defaultVoice,
            speed: 1.0
          });
          console.log(`🔄 Using fallback TTS settings for ${therapistName}:`, {
            voice: defaultVoice,
            speed: 1.0
          });
        }
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading TTS settings:', error);
        // Fallback: Set default voice based on therapist name
        const defaultVoice = therapistName === 'Lawrence' ? 'echo' : 'nova';
        setTtsSettings({
          voice: defaultVoice,
          speed: 1.0
        });
        console.log(`🔄 Using fallback TTS settings for ${therapistName} (error case):`, {
          voice: defaultVoice,
          speed: 1.0
        });
        setIsLoaded(true);
      }
    };

    loadTTSSettings();
  }, [therapistName]);

  // Helper function to get the correct voice (with Lawrence override)
  const getVoiceForTherapist = () => {
    return therapistName === 'Lawrence' ? 'echo' : ttsSettings.voice;
  };

  return {
    ttsSettings,
    isLoaded,
    getVoiceForTherapist
  };
}; 
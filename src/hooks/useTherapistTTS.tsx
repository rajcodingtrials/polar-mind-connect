import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TTSSettings {
  voice: string;
  speed: number;
  enableSSML: boolean;
  sampleSSML: string;
}

export const useTherapistTTS = (therapistName: string) => {
  const [settings, setSettings] = useState<TTSSettings>({
    voice: therapistName === 'Lawrence' ? 'echo' : 'nova',
    speed: 1.0,
    enableSSML: false,
    sampleSSML: `<speak>Hello! <break time="0.5s"/> I am ${therapistName}, your speech therapy assistant. <emphasis level="strong">Let's have fun learning together!</emphasis></speak>`
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTherapistSettings = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('tts_settings')
          .select('*')
          .eq('therapist_name', therapistName)
          .single();

        if (data) {
          setSettings({
            voice: data.voice,
            speed: data.speed,
            enableSSML: data.enable_ssml,
            sampleSSML: data.sample_ssml
          });
        }
      } catch (error) {
        console.error(`Error loading TTS settings for ${therapistName}:`, error);
        // Keep default settings on error
      } finally {
        setLoading(false);
      }
    };

    if (therapistName) {
      loadTherapistSettings();
    }
  }, [therapistName]);

  return { settings, loading };
};

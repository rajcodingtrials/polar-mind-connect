
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
    voice: therapistName === 'Laura' ? 'nova' : 'echo',
    speed: 1.0,
    enableSSML: false,
    sampleSSML: `<speak>Hello! <break time="0.5s"/> I am ${therapistName}, your speech therapy assistant. <emphasis level="strong">Let's have fun learning together!</emphasis></speak>`
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTherapistSettings();
  }, [therapistName]);

  const loadTherapistSettings = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('tts_settings')
        .select('*')
        .eq('therapist_name', therapistName)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading therapist TTS settings:', error);
        return;
      }

      if (data) {
        setSettings({
          voice: data.voice,
          speed: data.speed,
          enableSSML: data.enable_ssml,
          sampleSSML: data.sample_ssml
        });
      }
    } catch (error) {
      console.error('Error loading therapist TTS settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { settings, isLoading, reloadSettings: loadTherapistSettings };
};

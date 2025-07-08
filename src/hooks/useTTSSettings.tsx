import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TTSSettings {
  voice: string;
  speed: number;
  pitch?: number;
  provider?: string;
}

export const useTTSSettings = (therapistName: string) => {
  const [ttsSettings, setTtsSettings] = useState<TTSSettings>({ 
    voice: 'nova', 
    speed: 1.0,
    pitch: 0.0,
    provider: 'openai'
  });
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
          // Handle provider field that might not exist in types yet
          const provider = (data as any).provider || 'openai';
          setTtsSettings({
            voice: data.voice,
            speed: Number(data.speed),
            pitch: (data as any).pitch || 0.0,
            provider
          });
          console.log(`TTS Settings for ${therapistName}:`, {
            voice: data.voice,
            speed: Number(data.speed),
            provider
          });
        } else {
          // Fallback: Set default voice and provider based on therapist name
          const defaultVoice = therapistName === 'Lawrence' ? 'en-US-Neural2-I' : 'en-US-Neural2-J';
          const defaultProvider = 'google'; // Both therapists now use Google TTS
          setTtsSettings({
            voice: defaultVoice,
            speed: 1.0,
            pitch: 0.0,
            provider: defaultProvider
          });
          console.log(`🔄 Using fallback TTS settings for ${therapistName}:`, {
            voice: defaultVoice,
            speed: 1.0,
            provider: defaultProvider
          });
        }
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading TTS settings:', error);
        // Fallback: Set default voice and provider based on therapist name
        const defaultVoice = therapistName === 'Lawrence' ? 'en-US-Neural2-I' : 'en-US-Neural2-J';
        const defaultProvider = 'google'; // Both therapists now use Google TTS
        setTtsSettings({
          voice: defaultVoice,
          speed: 1.0,
          pitch: 0.0,
          provider: defaultProvider
        });
        console.log(`🔄 Using fallback TTS settings for ${therapistName} (error case):`, {
          voice: defaultVoice,
          speed: 1.0,
          provider: defaultProvider
        });
        setIsLoaded(true);
      }
    };

    loadTTSSettings();
  }, [therapistName]);

  // Helper function to get the correct voice
  const getVoiceForTherapist = () => {
    return ttsSettings.voice;
  };

  // Helper function to call the appropriate TTS function
  const callTTS = async (text: string, voice: string, speed: number, pitch?: number) => {
    const provider = ttsSettings.provider || 'openai';
    
    console.log(`🎯 [${therapistName}] TTS Request Details:`, {
      provider,
      voice,
      speed,
      textLength: text.length,
      textPreview: text.substring(0, 50) + '...'
    });
    
    if (provider === 'google') {
      console.log(`🔊 [${therapistName}] 🟢 Calling Google TTS with voice: ${voice}`);
      const result = await supabase.functions.invoke('google-tts', {
        body: { text, voice, speed }
        // pitch: pitch || ttsSettings.pitch || 0.0 // Temporarily disabled until database column is added
      });
      console.log(`✅ [${therapistName}] Google TTS response:`, {
        success: !result.error,
        audioLength: result.data?.audioContent?.length || 0
      });
      return result;
    } else {
      console.log(`🔊 [${therapistName}] 🔵 Calling OpenAI TTS with voice: ${voice}`);
      const result = await supabase.functions.invoke('openai-tts', {
        body: { text, voice, speed }
      });
      console.log(`✅ [${therapistName}] OpenAI TTS response:`, {
        success: !result.error,
        audioLength: result.data?.audioContent?.length || 0
      });
      return result;
    }
  };

  return {
    ttsSettings,
    isLoaded,
    getVoiceForTherapist,
    callTTS
  };
}; 
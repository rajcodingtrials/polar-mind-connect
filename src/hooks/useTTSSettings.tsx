import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAudioCache } from './useAudioCache';

interface TTSSettings {
  voice: string;
  speed: number;
  pitch?: number;
  provider?: string;
}

// Global in-flight request tracker (outside component to persist across instances)
const globalInFlightRequests = new Map<string, Promise<any>>();

export const useTTSSettings = (therapistName: string) => {
  const [ttsSettings, setTtsSettings] = useState<TTSSettings>({ 
    voice: 'nova', 
    speed: 1.0,
    pitch: 0.0,
    provider: 'openai'
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const { getCachedAudio, setCachedAudio } = useAudioCache();

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
          const defaultVoice = therapistName === 'Lawrence' ? 'Algenib' : 'Aoede';
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
        const defaultVoice = therapistName === 'Lawrence' ? 'Algenib' : 'Aoede';
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

  const callTTS = async (text: string, voice: string, speed: number, pitch?: number) => {
    const provider = ttsSettings.provider || 'openai';
    
    console.log(`🎯 [${therapistName}] TTS Request Details:`, {
      provider,
      voice,
      speed,
      textLength: text.length,
      textPreview: text.substring(0, 50) + '...'
    });

    // Check cache first
    const cachedAudio = getCachedAudio(text, voice, speed);
    if (cachedAudio) {
      console.log(`✅ [${therapistName}] Using cached audio`);
      return { data: { audioContent: cachedAudio }, error: null };
    }

    // Create unique key for request deduplication
    const requestKey = `${provider}_${text.substring(0, 50)}_${voice}_${speed}`;
    
    // If request is already in flight, return the same promise
    if (globalInFlightRequests.has(requestKey)) {
      console.log(`⏳ [${therapistName}] Reusing in-flight request`);
      return globalInFlightRequests.get(requestKey)!;
    }

    // Create promise for this request
    const requestPromise = (async () => {
      try {
        if (provider === 'google') {
          console.log(`🔊 [${therapistName}] 🟢 Calling Google TTS with voice: ${voice}`);
          
          const result = await supabase.functions.invoke('google-tts', {
            body: { text, voice, speed }
          });
          
          if (result.error) {
            console.error(`❌ [${therapistName}] Google TTS error:`, result.error);
            return { data: null, error: result.error };
          }
          
          // Cache successful results
          if (!result.error && result.data?.audioContent) {
            setCachedAudio(text, voice, speed, result.data.audioContent);
          }
          
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
          
          if (result.error) {
            console.error(`❌ [${therapistName}] OpenAI TTS error:`, result.error);
          }
          
          console.log(`✅ [${therapistName}] OpenAI TTS response:`, {
            success: !result.error,
            audioLength: result.data?.audioContent?.length || 0
          });
          return result;
        }
      } catch (error) {
        console.error(`❌ [${therapistName}] TTS exception:`, error);
        return { data: null, error };
      } finally {
        // Remove from in-flight requests after a short delay to allow concurrent callers to get the result
        setTimeout(() => globalInFlightRequests.delete(requestKey), 100);
      }
    })();

    // Store in-flight request
    globalInFlightRequests.set(requestKey, requestPromise);
    
    return requestPromise;
  };

  return {
    ttsSettings,
    isLoaded,
    getVoiceForTherapist,
    callTTS
  };
}; 
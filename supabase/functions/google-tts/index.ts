import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Request queue to prevent rate limit exhaustion
const requestQueue: Array<() => Promise<void>> = [];
let isProcessing = false;
const MAX_CONCURRENT = 5; // Max concurrent requests
const MIN_REQUEST_INTERVAL = 100; // Minimum 100ms between requests

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 Google TTS function called - step 1');
    
    // Step 1: Parse the request
    const { text, voice = 'nova', speed = 1.0, pitch } = await req.json();
    console.log('✅ Request parsed successfully:', { text: text?.substring(0, 30) + '...', voice, speed, pitch });
    console.log('🎤 Selected voice:', voice);
    console.log('🎵 Pitch setting:', pitch || 'not provided');
    
    if (!text) {
      throw new Error('Text is required');
    }
    
    // Clean text: remove emojis and special characters for better TTS
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Remove emojis
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Remove symbols & pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Remove transport & map symbols
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Remove flags
      .replace(/[\u{2600}-\u{26FF}]/gu, '') // Remove misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '') // Remove dingbats
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    console.log('🧹 Cleaned text:', cleanText.substring(0, 50) + '...');
    
    // Step 2: Check if we can access environment variables
    const apiKey = Deno.env.get('GOOGLE_TTS_API_KEY');
    console.log('🔑 API key check:', apiKey ? `Found (${apiKey.length} chars)` : 'Not found');
    
    if (!apiKey) {
      throw new Error('Google TTS API key not configured');
    }
    
    // Step 3: Test Google TTS API with minimal request
    console.log('🌐 Making Google TTS API call...');
    
    try {
      // Convert named Chirp voices to full format
      const namedChirpVoices = ['Aoede', 'Zephyr', 'Puck', 'Charon', 'Algenib'];
      let finalVoiceName = voice;
      
      if (namedChirpVoices.includes(voice)) {
        finalVoiceName = `en-US-Chirp3-HD-${voice}`;
        console.log(`🎤 Converted voice name from "${voice}" to "${finalVoiceName}"`);
      } else if (voice.startsWith('en-US-Chirp-HD')) {
        // Convert en-US-Chirp-HD-F to en-US-Chirp3-HD-F format
        finalVoiceName = voice.replace('Chirp-HD', 'Chirp3-HD');
        console.log(`🎤 Converted voice name from "${voice}" to "${finalVoiceName}"`);
      }
      
      // Build audioConfig object conditionally
      const audioConfig: any = {
        audioEncoding: 'MP3',
        speakingRate: Math.max(0.25, Math.min(4.0, speed)),
      };
      
      // Only add pitch if it's provided
      if (pitch !== undefined) {
        audioConfig.pitch = Math.max(-20.0, Math.min(20.0, pitch));
      }
      
      // Retry logic with exponential backoff
      let lastError: Error | null = null;
      const maxRetries = 3;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            const backoffMs = Math.min(1000 * Math.pow(2, attempt), 5000);
            console.log(`⏳ Retry attempt ${attempt + 1}/${maxRetries}, waiting ${backoffMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
          }
          
          const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: { text: cleanText },
              voice: {
                languageCode: (() => {
                  // Handle Chirp voices (both named and generic)
                  if (voice.startsWith('en-US-Chirp')) {
                    return 'en-US';
                  }
                  
                  // Handle traditional voices with language prefix
                  if (voice.startsWith('en-GB')) return 'en-GB';
                  if (voice.startsWith('en-IN')) return 'en-IN';
                  if (voice.startsWith('en-US')) return 'en-US';
                  
                  // Default fallback for named voices
                  return 'en-US';
                })(),
                name: finalVoiceName,
              },
              audioConfig: audioConfig,
            }),
          });

          console.log('📊 Response status:', response.status);
          console.log('📊 Response ok:', response.ok);

          if (!response.ok) {
            const errorText = await response.text();
            
            // If it's a 429 (rate limit), retry
            if (response.status === 429 && attempt < maxRetries - 1) {
              console.error(`⚠️ Rate limit hit (429), will retry...`);
              lastError = new Error(`Google TTS API error: ${response.status} ${errorText}`);
              continue; // Retry
            }
            
            console.error('❌ Google TTS API error:', errorText);
            throw new Error(`Google TTS API error: ${response.status} ${errorText}`);
          }

          const data = await response.json();
          console.log('📊 Response data keys:', Object.keys(data));
          
          if (!data.audioContent) {
            throw new Error('No audio content received from Google TTS');
          }

          console.log('✅ Google TTS audio generated, length:', data.audioContent.length);
          
          return new Response(
            JSON.stringify({ audioContent: data.audioContent }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        } catch (err) {
          lastError = err as Error;
          if (attempt === maxRetries - 1) {
            throw err;
          }
        }
      }
      
      throw lastError || new Error('Max retries exceeded');
    } catch (error) {
      console.error('❌ Error in Google TTS API call:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Error in google-tts function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}); 
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
      // Build audioConfig object conditionally
      const audioConfig: any = {
        audioEncoding: 'MP3',
        speakingRate: Math.max(0.25, Math.min(4.0, speed)),
      };
      
      // Only add pitch if it's provided
      if (pitch !== undefined) {
        audioConfig.pitch = Math.max(-20.0, Math.min(20.0, pitch));
      }
      
      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text: cleanText },
          voice: {
            languageCode: voice.startsWith('en-US') ? 'en-US' : 
                         voice.startsWith('en-GB') ? 'en-GB' : 
                         voice.startsWith('en-IN') ? 'en-IN' : 'en-US',
            name: voice,
          },
          audioConfig: audioConfig,
        }),
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
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

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing high-quality audio for children\'s speech, length:', audio.length);

    // Enhanced base64 decoding with better error handling
    let binaryString: string;
    try {
      binaryString = atob(audio);
      console.log('Successfully decoded high-quality base64 audio, binary length:', binaryString.length);
    } catch (decodeError) {
      console.error('Failed to decode base64 audio:', decodeError);
      throw new Error('Invalid base64 audio data');
    }

    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log('Created high-quality audio buffer with', bytes.length, 'bytes');
    
    const formData = new FormData();
    
    // Enhanced audio format detection with better support for high-quality formats
    let mimeType = 'audio/webm';
    const header = new Uint8Array(bytes.slice(0, 12));
    
    // Check for common audio file signatures with enhanced detection
    if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46) {
      // RIFF header (WAV) - excellent for speech
      mimeType = 'audio/wav';
    } else if (header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70) {
      // MP4/M4A - good quality
      mimeType = 'audio/mp4';
    } else if (header[0] === 0x1A && header[1] === 0x45 && header[2] === 0xDF && header[3] === 0xA3) {
      // WebM - modern and efficient
      mimeType = 'audio/webm';
    }
    
    console.log('Detected high-quality audio format for children\'s speech:', mimeType);
    
    const blob = new Blob([bytes], { type: mimeType });
    const filename = mimeType === 'audio/wav' ? 'child_speech.wav' : 
                    mimeType === 'audio/mp4' ? 'child_speech.mp4' : 'child_speech.webm';
    
    formData.append('file', blob, filename);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    
    // Enhanced settings optimized for children's speech
    formData.append('temperature', '0.0'); // Most accurate transcription
    formData.append('prompt', 'This is a child speaking in a speech therapy session. The child may speak slowly, repeat words, or make partial sounds. Please transcribe their speech accurately, including any attempts at words, partial pronunciations, or repeated sounds. Be patient with unclear speech patterns typical of children in speech therapy.');

    console.log('Sending high-quality audio to OpenAI Whisper API optimized for children...');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('High-quality transcription result for child speech:', result);

    return new Response(
      JSON.stringify({ 
        text: result.text,
        language: result.language,
        duration: result.duration,
        optimizedForChildren: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enhanced openai-stt function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

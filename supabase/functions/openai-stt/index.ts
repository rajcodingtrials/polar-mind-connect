
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

    console.log('Processing audio data, length:', audio.length);

    // Convert base64 to binary with better error handling
    let binaryString: string;
    try {
      binaryString = atob(audio);
      console.log('Successfully decoded base64, binary length:', binaryString.length);
    } catch (decodeError) {
      console.error('Failed to decode base64 audio:', decodeError);
      throw new Error('Invalid base64 audio data');
    }

    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log('Created audio buffer with', bytes.length, 'bytes');
    
    const formData = new FormData();
    
    // Detect audio format from the first few bytes
    let mimeType = 'audio/webm';
    const header = new Uint8Array(bytes.slice(0, 12));
    
    // Check for common audio file signatures
    if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46) {
      // RIFF header (WAV)
      mimeType = 'audio/wav';
    } else if (header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70) {
      // MP4/M4A
      mimeType = 'audio/mp4';
    } else if (header[0] === 0x1A && header[1] === 0x45 && header[2] === 0xDF && header[3] === 0xA3) {
      // WebM
      mimeType = 'audio/webm';
    }
    
    console.log('Detected audio format:', mimeType);
    
    const blob = new Blob([bytes], { type: mimeType });
    const filename = mimeType === 'audio/wav' ? 'audio.wav' : 
                    mimeType === 'audio/mp4' ? 'audio.mp4' : 'audio.webm';
    
    formData.append('file', blob, filename);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    formData.append('temperature', '0.1'); // Lower temperature for more accurate transcription
    formData.append('prompt', 'This is a child speaking. Please transcribe their speech accurately, including any partial words or sounds they make.');

    console.log('Sending to OpenAI Whisper API...');

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
    console.log('Transcription result:', result);

    return new Response(
      JSON.stringify({ 
        text: result.text,
        language: result.language,
        duration: result.duration 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in openai-stt function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

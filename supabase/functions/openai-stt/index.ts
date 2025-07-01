
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

    console.log('Processing audio for speech-to-text, base64 length:', audio.length);

    // Decode base64 audio data with better error handling
    let audioBytes: Uint8Array;
    try {
      const binaryString = atob(audio);
      audioBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        audioBytes[i] = binaryString.charCodeAt(i);
      }
      console.log('Successfully decoded audio data, bytes:', audioBytes.length);
    } catch (decodeError) {
      console.error('Failed to decode base64 audio:', decodeError);
      throw new Error('Invalid base64 audio data');
    }

    if (audioBytes.length === 0) {
      throw new Error('Empty audio data');
    }
    
    // Detect audio format from file signature
    let mimeType = 'audio/webm'; // Default
    let filename = 'audio.webm';
    
    const header = audioBytes.slice(0, 12);
    
    // Check for common audio file signatures
    if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46) {
      // RIFF header (WAV)
      mimeType = 'audio/wav';
      filename = 'audio.wav';
    } else if (header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70) {
      // MP4 container
      mimeType = 'audio/mp4';
      filename = 'audio.mp4';
    } else if (header[0] === 0x1A && header[1] === 0x45 && header[2] === 0xDF && header[3] === 0xA3) {
      // WebM container
      mimeType = 'audio/webm';
      filename = 'audio.webm';
    } else if (header[0] === 0x4F && header[1] === 0x67 && header[2] === 0x67 && header[3] === 0x53) {
      // Ogg container
      mimeType = 'audio/ogg';
      filename = 'audio.ogg';
    }
    
    console.log('Detected audio format:', mimeType, 'filename:', filename);
    
    // Create form data for OpenAI Whisper API
    const formData = new FormData();
    const audioBlob = new Blob([audioBytes], { type: mimeType });
    
    formData.append('file', audioBlob, filename);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    formData.append('temperature', '0.3'); // Slightly higher for better accuracy with children's speech
    formData.append('response_format', 'json'); // Get structured response
    formData.append('prompt', 'This is audio from a child in a speech therapy session. The child may speak softly, make partial sounds, or give short answers. Please transcribe their speech accurately, including any attempts at words, partial pronunciations, or simple responses like "yes", "no", single words, or short phrases. Focus on the primary speaker and ignore background voices or conversations.');

    console.log('Sending audio to OpenAI Whisper API...');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, response.statusText, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Transcription successful:', result);

    // Validate transcription result
    if (!result.text) {
      console.warn('No text in transcription result');
      return new Response(
        JSON.stringify({ 
          text: '',
          message: 'No speech detected in audio'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        text: result.text.trim(),
        language: result.language,
        duration: result.duration,
        segments: result.segments || [] // Include segments for better debugging
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in openai-stt function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Speech-to-text processing failed'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

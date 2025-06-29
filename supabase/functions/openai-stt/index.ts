
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

    console.log('Processing enhanced, preprocessed audio for children\'s speech, length:', audio.length);

    // Enhanced base64 decoding for preprocessed audio
    let binaryString: string;
    try {
      binaryString = atob(audio);
      console.log('Successfully decoded enhanced audio data, binary length:', binaryString.length);
    } catch (decodeError) {
      console.error('Failed to decode base64 audio:', decodeError);
      throw new Error('Invalid base64 audio data');
    }

    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log('Created enhanced audio buffer with', bytes.length, 'bytes from preprocessed audio');
    
    const formData = new FormData();
    
    // Enhanced audio format detection for preprocessed audio
    let mimeType = 'audio/wav'; // Default to WAV for preprocessed PCM
    const header = new Uint8Array(bytes.slice(0, 12));
    
    // Check for audio file signatures
    if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46) {
      mimeType = 'audio/wav';
    } else if (header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70) {
      mimeType = 'audio/mp4';
    } else if (header[0] === 0x1A && header[1] === 0x45 && header[2] === 0xDF && header[3] === 0xA3) {
      mimeType = 'audio/webm';
    } else {
      // For raw PCM data from preprocessing, treat as WAV
      mimeType = 'audio/wav';
    }
    
    console.log('Detected audio format for enhanced speech:', mimeType);
    
    const blob = new Blob([bytes], { type: mimeType });
    const filename = mimeType === 'audio/wav' ? 'enhanced_child_speech.wav' : 
                    mimeType === 'audio/mp4' ? 'enhanced_child_speech.mp4' : 'enhanced_child_speech.webm';
    
    formData.append('file', blob, filename);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    
    // Enhanced settings optimized for preprocessed children's speech
    formData.append('temperature', '0.0'); // Most accurate transcription
    formData.append('prompt', 'This is enhanced, preprocessed audio from a child in a speech therapy session. The audio has been processed with noise reduction, gain adjustment, and compression to improve clarity. The child may still speak softly, repeat words, or make partial sounds. Please transcribe their speech accurately, including any attempts at words, partial pronunciations, or repeated sounds. The audio quality has been enhanced but be patient with speech patterns typical of children in speech therapy.');

    console.log('Sending enhanced, preprocessed audio to OpenAI Whisper API...');

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
    console.log('Enhanced transcription result for preprocessed child speech:', result);

    return new Response(
      JSON.stringify({ 
        text: result.text,
        language: result.language,
        duration: result.duration,
        audioEnhanced: true,
        preprocessingApplied: ['noise_reduction', 'gain_adjustment', 'compression', 'high_pass_filter']
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

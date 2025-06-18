
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, model = 'gpt-4o-mini' } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // System message for speech therapist
    const systemMessage = {
      role: 'system',
      content: `You are a gentle and supportive virtual speech therapist for young children with speech delays or sensory needs.

When the conversation starts:
- Greet the child warmly and slowly.
- Ask them their name in a calm, friendly tone.
- Use pauses between sentences and speak at 60% of normal voice speed.
- After the child shares their name, say it back gently and with kindness (e.g., "Hi Maya, I'm so happy to see you!").

Then, begin one short and playful speech lesson:
- Teach the names of 3 simple fruits: apple, banana, and orange.
- For each fruit:
  - Show a picture of the fruit (use a clean, colorful image)
  - Say the fruit name clearly and slowly, breaking it into syllables. Example: "Aaa–pple"
  - Ask the child kindly to try saying it with you
  - Praise any response warmly, even if it's incomplete. Use phrases like: "That's amazing!", "Great trying!", or "I'm so proud of you!"

Keep your sentences short, joyful, and slow. Avoid complex words. Smile in your voice. Always stay calm and patient.

At the end:
- Praise the child by name
- Remind them they did something special today
- Say goodbye in a sweet and happy way`
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in openai-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

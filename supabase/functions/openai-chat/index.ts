import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSystemPrompt } from "./prompts.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 === OPENAI-CHAT EDGE FUNCTION CALLED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('⚡ Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📥 Reading request body...');
    const requestBody = await req.json();
    console.log('📋 Request body received:', JSON.stringify(requestBody, null, 2));
    
    const { 
      messages, 
      model = 'gpt-4o-mini', 
      systemPrompt, 
      activityType, 
      promptType,
      customInstructions,
      customVariables,
      therapistName,
      childName
    } = requestBody;

    console.log('=== OPENAI CHAT FUNCTION PROCESSING ===');
    console.log('Request details:', {
      messagesCount: messages?.length || 0,
      model,
      hasSystemPrompt: !!systemPrompt,
      activityType,
      promptType,
      hasCustomInstructions: !!customInstructions,
      hasCustomVariables: !!customVariables,
      therapistName,
      childName
    });

    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    console.log('✅ OpenAI API key is available');

    // Always use database prompts by calling createSystemPrompt
    let finalSystemPrompt = systemPrompt;
    if (!finalSystemPrompt) {
      console.log('=== CREATING SYSTEM PROMPT ===');
      const activityKey = promptType || activityType;
      console.log('Activity key passed to createSystemPrompt:', activityKey);
      console.log('Prompt type:', promptType);
      console.log('Custom instructions passed:', customInstructions);
      console.log('Therapist name:', therapistName);
      console.log('Child name:', childName);
      console.log('Has custom variables:', !!customVariables);
      
      finalSystemPrompt = await createSystemPrompt(activityKey, customInstructions, undefined, undefined, childName, therapistName, customVariables);
      
      console.log('=== SYSTEM PROMPT CREATED ===');
      console.log('Final system prompt length:', finalSystemPrompt.length);
      console.log('Final system prompt preview (first 500 chars):', finalSystemPrompt.substring(0, 500) + '...');
      console.log('Final system prompt contains "Laura":', finalSystemPrompt.includes('Laura'));
      console.log('Final system prompt contains "speech therapist":', finalSystemPrompt.includes('speech therapist'));
      console.log('Final system prompt contains "gentle":', finalSystemPrompt.includes('gentle'));
    } else {
      console.log('=== USING PROVIDED SYSTEM PROMPT ===');
      console.log('Provided system prompt length:', finalSystemPrompt.length);
      console.log('Provided system prompt preview:', finalSystemPrompt.substring(0, 200) + '...');
    }

    const systemMessage = {
      role: 'system',
      content: finalSystemPrompt
    };

    console.log('=== CALLING OPENAI API ===');
    console.log('System message role:', systemMessage.role);
    console.log('System message content length:', systemMessage.content.length);
    console.log('Total messages being sent to OpenAI:', [systemMessage, ...messages].length);

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

    console.log('📡 OpenAI API response status:', response.status);
    console.log('📡 OpenAI API response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log('=== OPENAI RESPONSE RECEIVED ===');
    console.log('Response choices count:', data.choices?.length || 0);
    console.log('First choice message content preview:', data.choices?.[0]?.message?.content?.substring(0, 200) + '...');
    console.log('🎉 Sending successful response back to client');
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('💥 === ERROR IN OPENAI-CHAT FUNCTION ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

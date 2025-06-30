import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// These are fallback prompts in case database is not available
export const baseSpeechTherapistPrompt = `You are Laura, a gentle and supportive virtual speech therapist for young children with speech delays or sensory needs.

Your core approach:
- Always speak warmly, slowly, and patiently
- Use pauses between sentences and speak at 60% of normal voice speed
- Keep sentences short, joyful, and calm
- Avoid complex words and use age-appropriate language
- Praise any response warmly, even if incomplete
- Use encouraging phrases like: "That's amazing!", "Great trying!", or "I'm so proud of you!"
- Always stay calm, patient, and supportive
- Show genuine interest in the child's responses

When greeting a child:
- Greet them warmly and slowly
- Ask their name in a calm, friendly tone
- After they share their name, say it back gently with kindness`;

export const activityPrompts = {
  first_words: `

ACTIVITY: First Words Practice

Hello! I'm Laura, and I'm so excited to work with you today! 🌟

We're going to be practicing first words together. I'll help you learn some simple words and sounds. Are you ready to have some fun? Let's begin! 🎉

Now, let's practice first words and basic sounds together:
- Help the child practice first words and basic sounds
- Ask one question at a time and wait for their response
- Encourage any attempt at pronunciation, even if not perfect
- Gently model the correct pronunciation after their attempts
- Break words into syllables when teaching (e.g., "Aaa–pple")
- Use simple fruit names: apple 🍎, banana 🍌, orange 🍊

Let's start with our first word practice!`,

  question_time: `

ACTIVITY: Picture Questions

Hello! I'm Laura, and I'm so excited to work with you today! 🌟

We're going to be practicing question time together. I'll show you pictures and ask you questions about them. Are you ready to have some fun? Let's begin! 🎉

Now let's look at some pictures and answer questions:
- Ask specific questions about pictures shown to the child
- Ask one question at a time and wait for their response
- Check if their answer matches the expected answer
- If correct, praise them warmly and move to the next question
- If incorrect, gently correct them and encourage them to try again
- Pause briefly after question marks before continuing

Great! Now let's start with our first question!`,

  build_sentence: `

ACTIVITY: Sentence Building

Hello! I'm Laura, and I'm so excited to work with you today! 🌟

We're going to be practicing building sentences together. I'll help you learn to make complete sentences. Are you ready to have some fun? Let's begin! 🎉

Now let's build sentences together:
- Help the child build complete sentences together
- Start with their responses and guide them to expand into full sentences
- Provide gentle guidance and examples
- Encourage them to use complete sentences
- Model proper sentence structure when needed

Let's start building our first sentence!`,

  lets_chat: `

ACTIVITY: Natural Conversation

Hello! I'm Laura, and I'm so excited to work with you today! 🌟

We're going to be having a friendly chat together. I'll ask you questions and we can talk about things you like. Are you ready to have some fun? Let's begin! 🎉

Now let's have a conversation:
- Have a friendly, natural conversation with the child
- Ask follow-up questions based on what they say
- Keep the conversation flowing around the chosen topic
- Encourage them to speak in full sentences when possible
- Let the conversation develop organically based on their responses
- Gently guide them back to topic if they go off track
- Keep the session to about 5-6 exchanges to maintain attention

What would you like to chat about today?`,

  default: `

ACTIVITY: General Speech Practice

Hello! I'm Laura, and I'm so excited to work with you today! 🌟

We're going to be practicing speech together. I'll help you learn some simple words and sounds. Are you ready to have some fun? Let's begin! 🎉

Now let's practice:
- Begin with a short and playful speech lesson
- Teach the names of 3 simple fruits: apple, banana, and orange
- For each fruit, say the name clearly and slowly, breaking it into syllables
- Ask the child to try saying it with you
- You can use fruit emojis: 🍎 for apple, 🍌 for banana, 🍊 for orange
- At the end, praise the child by name and remind them they did something special

Let's start with our first practice!`
};

// Function to load prompts from Supabase
export const loadPromptsFromDatabase = async () => {
  try {
    console.log('🔍 === ATTEMPTING TO LOAD PROMPTS FROM DATABASE ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('🔧 Environment check:');
    console.log('  - Supabase URL available:', !!supabaseUrl);
    console.log('  - Supabase URL value:', supabaseUrl?.substring(0, 50) + '...');
    console.log('  - Supabase Service Key available:', !!supabaseServiceKey);
    console.log('  - Service Key length:', supabaseServiceKey?.length || 0);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('❌ MISSING CREDENTIALS - Using default prompts');
      console.log('  - Missing URL:', !supabaseUrl);
      console.log('  - Missing Service Key:', !supabaseServiceKey);
      return null;
    }
    
    console.log('🚀 Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client created successfully');
    
    console.log('📊 Querying prompt_configurations table...');
    console.log('  - Table: prompt_configurations');
    console.log('  - Columns: prompt_type, content');
    console.log('  - Filter: is_active = true');
    
    const { data: prompts, error } = await supabase
      .from('prompt_configurations')
      .select('prompt_type, content')
      .eq('is_active', true);

    console.log('📥 Database query completed');
    
    if (error) {
      console.error('❌ DATABASE ERROR:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return null;
    }

    console.log('📈 Query results:');
    console.log('  - Prompts received:', prompts);
    console.log('  - Number of prompts:', prompts?.length || 0);
    console.log('  - Prompt types found:', prompts?.map(p => p.prompt_type) || []);

    if (!prompts || prompts.length === 0) {
      console.log('⚠️ NO ACTIVE PROMPTS FOUND - Using defaults');
      return null;
    }

    // Convert database prompts to expected format
    const databasePrompts: any = {};
    let basePrompt = baseSpeechTherapistPrompt;

    console.log('🔄 Processing database prompts...');
    prompts.forEach((prompt, index) => {
      console.log(`  📝 Processing prompt ${index + 1}:`);
      console.log(`    - Type: ${prompt.prompt_type}`);
      console.log(`    - Content length: ${prompt.content?.length || 0} characters`);
      console.log(`    - Content preview: ${prompt.content?.substring(0, 100)}...`);
      
      if (prompt.prompt_type === 'base_prompt') {
        basePrompt = prompt.content;
        console.log('    ✅ SET AS BASE PROMPT');
      } else {
        databasePrompts[prompt.prompt_type] = prompt.content;
        console.log(`    ✅ Added as activity prompt: ${prompt.prompt_type}`);
      }
    });

    console.log('🎉 SUCCESS - Database prompts loaded!');
    console.log('📊 Final results:');
    console.log(`  - Base prompt length: ${basePrompt.length} characters`);
    console.log(`  - Base prompt starts with: ${basePrompt.substring(0, 100)}...`);
    console.log(`  - Activity prompts loaded: ${Object.keys(databasePrompts).length}`);
    console.log(`  - Activity types: ${Object.keys(databasePrompts).join(', ')}`);
    
    return {
      basePrompt,
      activities: { ...activityPrompts, ...databasePrompts }
    };
  } catch (error) {
    console.error('💥 EXCEPTION in loadPromptsFromDatabase:');
    console.error('  - Error type:', error.constructor.name);
    console.error('  - Error message:', error.message);
    console.error('  - Error stack:', error.stack);
    return null;
  }
};

// Helper function to get custom prompts from request headers or database
const getCustomPrompts = async (customBasePrompt?: string, customActivityPrompts?: any) => {
  console.log('🔧 === GET CUSTOM PROMPTS CALLED ===');
  console.log('  - Custom base prompt provided:', !!customBasePrompt);
  console.log('  - Custom activity prompts provided:', !!customActivityPrompts);
  
  // First try to load from database
  console.log('🔍 Attempting to load from database...');
  const databasePrompts = await loadPromptsFromDatabase();
  
  if (databasePrompts) {
    console.log('✅ SUCCESS: Using database prompts');
    console.log('  - Database base prompt length:', databasePrompts.basePrompt.length);
    console.log('  - Database activities available:', Object.keys(databasePrompts.activities));
    console.log('  - Database base prompt preview:', databasePrompts.basePrompt.substring(0, 150) + '...');
    return databasePrompts;
  }

  // Fall back to custom prompts or defaults
  const basePrompt = customBasePrompt || baseSpeechTherapistPrompt;
  const activities = customActivityPrompts ? { ...activityPrompts, ...customActivityPrompts } : activityPrompts;
  
  console.log('⚠️ FALLBACK: Using default/custom prompts');
  console.log('  - Fallback base prompt length:', basePrompt.length);
  console.log('  - Fallback activities available:', Object.keys(activities));
  console.log('  - Fallback base prompt preview:', basePrompt.substring(0, 150) + '...');
  
  return { basePrompt, activities };
};

export const createSystemPrompt = async (activityType?: string, customInstructions?: string, customBasePrompt?: string, customActivityPrompts?: any): Promise<string> => {
  console.log('🚀 === CREATE SYSTEM PROMPT CALLED ===');
  console.log('  - Activity type:', activityType);
  console.log('  - Custom instructions provided:', !!customInstructions);
  console.log('  - Custom base prompt provided:', !!customBasePrompt);
  console.log('  - Custom activity prompts provided:', !!customActivityPrompts);
  
  console.log('📋 Getting prompts...');
  const { basePrompt, activities } = await getCustomPrompts(customBasePrompt, customActivityPrompts);
  
  console.log('📝 Building final prompt...');
  console.log('  - Base prompt source check:');
  console.log('    * Contains "gentle and supportive":', basePrompt.includes('gentle and supportive'));
  console.log('    * Contains "speech therapist":', basePrompt.includes('speech therapist'));
  console.log('    * Contains "That\'s amazing!":', basePrompt.includes("That's amazing!"));
  console.log('    * Total length:', basePrompt.length);
  
  let prompt = basePrompt;
  
  if (activityType && activities[activityType as keyof typeof activities]) {
    const activityPrompt = activities[activityType as keyof typeof activities];
    prompt += activityPrompt;
    console.log(`✅ Added activity-specific prompt for: ${activityType}`);
    console.log('  - Activity prompt length:', activityPrompt.length);
  } else {
    const defaultPrompt = activities.default;
    prompt += defaultPrompt;
    console.log('✅ Using default activity prompt');
    console.log('  - Default prompt length:', defaultPrompt.length);
  }
  
  if (customInstructions) {
    const instructionsAddition = `\n\nADDITIONAL INSTRUCTIONS:\n${customInstructions}`;
    prompt += instructionsAddition;
    console.log('✅ Added custom instructions');
    console.log('  - Custom instructions length:', instructionsAddition.length);
  }
  
  console.log('🎯 === FINAL PROMPT SUMMARY ===');
  console.log('  - Final prompt total length:', prompt.length);
  console.log('  - Contains "Laura":', prompt.includes('Laura'));
  console.log('  - Contains "speech therapist":', prompt.includes('speech therapist'));
  console.log('  - Contains "gentle and supportive":', prompt.includes('gentle and supportive'));
  console.log('  - Contains "That\'s amazing!":', prompt.includes("That's amazing!"));
  console.log('  - Final prompt preview (first 200 chars):', prompt.substring(0, 200) + '...');
  console.log('🏁 === PROMPT CREATION COMPLETE ===');
  
  return prompt;
};

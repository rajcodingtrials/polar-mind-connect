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

IMPORTANT - Always model the correct answer:
- When teaching words or concepts, always repeat the correct pronunciation/answer
- Use phrases like "The word is [correct answer]" or "We say [correct answer]"
- This helps with reinforcement and correct modeling
- Even if the child's attempt is close, always provide the correct version
- Model the correct pronunciation clearly and slowly

When greeting a child:
- Greet them warmly and slowly
- Ask their name in a calm, friendly tone
- After they share their name, say it back gently with kindness`;

// New: Single introduction string
export const introduction = `Hello! I'm {therapist_name}, and I'm so excited to work with you today, {child_name}! 🌟`;

export const activityPrompts = {
  first_words: `

ACTIVITY: First Words Practice

We're going to be practicing first words together. I'll help you learn some simple words and sounds. Are you ready to have some fun? Let's begin! 🎉

Now, let's practice first words and basic sounds together:
- Help the child practice first words and basic sounds
- Ask one question at a time and wait for their response
- Encourage any attempt at pronunciation, even if not perfect
- ALWAYS model the correct pronunciation: "The word is [correct word]"
- Break words into syllables when teaching (e.g., "Aaa–pple")
- Use simple, clear questions about pictures or objects shown
- If no specific questions are provided, you can use simple fruit names: apple 🍎, banana 🍌, orange 🍊

Let's start with our first word practice!`,

  question_time: `

ACTIVITY: Picture Questions

We're going to be practicing question time together. I'll show you pictures and ask you questions about them. Are you ready to have some fun? Let's begin! 🎉

Now let's look at some pictures and answer questions:
- Ask specific questions about pictures shown to the child
- Ask one question at a time and wait for their response
- Check if their answer matches the expected answer
- ALWAYS provide the correct answer: "The answer is [correct answer]"
- If correct, praise them warmly and move to the next question
- If incorrect, gently correct them and encourage them to try again
- Pause briefly after question marks before continuing

Great! Now let's start with our first question!`,

  build_sentence: `

ACTIVITY: Sentence Building

We're going to be practicing building sentences together. I'll help you learn to make complete sentences. Are you ready to have some fun? Let's begin! 🎉

Now let's build sentences together:
- Help the child build complete sentences together
- Start with their responses and guide them to expand into full sentences
- ALWAYS model the correct sentence: "We say [correct sentence]"
- Provide gentle guidance and examples
- Encourage them to use complete sentences
- Model proper sentence structure when needed

Let's start building our first sentence!`,

  lets_chat: `

ACTIVITY: Natural Conversation

We're going to be having a friendly chat together. I'll ask you questions and we can talk about things you like. Are you ready to have some fun? Let's begin! 🎉

Now let's have a conversation:
- Have a friendly, natural conversation with the child
- Ask follow-up questions based on what they say
- When teaching new words or concepts, model the correct pronunciation
- Keep the conversation flowing around the chosen topic
- Encourage them to speak in full sentences when possible
- Let the conversation develop organically based on their responses
- Gently guide them back to topic if they go off track
- Keep the session to about 5-6 exchanges to maintain attention

What would you like to chat about today?`,

  tap_and_play: `

ACTIVITY: Tap and Play

We're going to be playing a fun tapping game together. I'll show you two pictures and ask you to tap the correct one. Are you ready to have some fun? Let's begin! 🎉

Now let's play tap and play:
- Present a question about two pictures shown to the child
- Encourage the child to tap or click on the correct picture
- For correct answers: "Great job! You found the [answer]!" or "Wonderful! That's right!"
- For incorrect answers: "Good try! Let's look again. The [correct answer] is this one!" (gently redirect)
- ALWAYS name what the correct answer is to reinforce learning
- Use descriptive language: "You found the fluffy cat!" instead of just "correct"
- Never use negative language or make the child feel bad
- Celebrate effort as much as correct answers
- Keep explanations brief but encouraging
- Encourage verbal responses when possible: "Can you say [correct answer] with me?"

Let's start our first tap and play game!`,

  default: `

ACTIVITY: General Speech Practice

We're going to be practicing speech together. I'll help you learn some simple words and sounds. Are you ready to have some fun? Let's begin! 🎉

Now let's practice:
- Begin with a short and playful speech lesson
- Teach the names of 3 simple fruits: apple, banana, and orange
- For each fruit, say the name clearly and slowly, breaking it into syllables
- Ask the child to try saying it with you
- ALWAYS model the correct pronunciation: "The word is [correct word]"
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

export const createSystemPrompt = async (
  activityType?: string,
  customInstructions?: string,
  customBasePrompt?: string,
  customActivityPrompts?: any,
  childName?: string,
  therapistName?: string,
  customVariables?: Record<string, string>
): Promise<string> => {
  console.log('🚀 === CREATE SYSTEM PROMPT CALLED ===');
  console.log('  - Activity type:', activityType);
  console.log('  - Custom instructions provided:', !!customInstructions);
  console.log('  - Custom base prompt provided:', !!customBasePrompt);
  console.log('  - Custom activity prompts provided:', !!customActivityPrompts);
  console.log('  - Child name:', childName);
  console.log('  - Therapist name:', therapistName);
  
  console.log('📋 Getting prompts...');
  const { basePrompt, activities } = await getCustomPrompts(customBasePrompt, customActivityPrompts);
  
  console.log('📝 Building final prompt...');
  console.log('  - Base prompt source check:');
  console.log('    * Contains "gentle and supportive":', basePrompt.includes('gentle and supportive'));
  console.log('    * Contains "speech therapist":', basePrompt.includes('speech therapist'));
  console.log('    * Contains "That\'s amazing!":', basePrompt.includes("That's amazing!"));
  console.log('    * Total length:', basePrompt.length);
  
  // Build prompt depending on type (feedback prompts are standalone)
  const isFeedbackType = (t?: string) => !!t && (/feedback/.test(t) || /^tap_feedback_/.test(t) || /^sound_feedback_/.test(t));

  let prompt = '';
  if (activityType && (activities as any)[activityType]) {
    const activityPrompt = (activities as any)[activityType] as string;
    if (isFeedbackType(activityType)) {
      prompt = activityPrompt;
      console.log(`✅ Using standalone feedback prompt for: ${activityType}`);
      console.log('  - Feedback prompt length:', activityPrompt.length);
    } else {
      prompt = basePrompt + '\n' + introduction + '\n' + activityPrompt;
      console.log(`✅ Added activity-specific prompt for: ${activityType}`);
      console.log('  - Activity prompt length:', activityPrompt.length);
    }
  } else {
    const defaultPrompt = (activities as any).default as string;
    prompt = basePrompt + '\n' + introduction + '\n' + defaultPrompt;
    console.log('✅ Using default activity prompt');
    console.log('  - Default prompt length:', defaultPrompt.length);
  }
  
  if (customInstructions) {
    const instructionsAddition = `\n\nADDITIONAL INSTRUCTIONS:\n${customInstructions}`;
    prompt += instructionsAddition;
    console.log('✅ Added custom instructions');
    console.log('  - Custom instructions length:', instructionsAddition.length);
  }
  
  // Inject the therapist's and child's names everywhere
  const nameToUse = childName || "friend";
  const therapistToUse = therapistName || "Laura";
  prompt = prompt.replace(/{child_name}/g, nameToUse).replace(/{therapist_name}/g, therapistToUse);

  // Apply any custom variable placeholders like {correct_answer}, {question}, etc.
  console.log('🔄 === APPLYING CUSTOM VARIABLES ===');
  console.log('Custom variables received:', customVariables);
  if (customVariables && typeof customVariables === 'object') {
    console.log('Processing custom variables...');
    for (const [key, value] of Object.entries(customVariables)) {
      try {
        const token = new RegExp(`\\{${key}\\}`, 'g');
        const beforeReplace = prompt;
        prompt = prompt.replace(token, String(value));
        const wasReplaced = beforeReplace !== prompt;
        console.log(`  - ${key}: "${value}" (replaced: ${wasReplaced})`);
      } catch (e) {
        console.warn('Variable replacement failed for key:', key, e);
      }
    }
    console.log('Prompt after variable replacement (first 500 chars):', prompt.substring(0, 500));
  } else {
    console.log('No custom variables to apply');
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

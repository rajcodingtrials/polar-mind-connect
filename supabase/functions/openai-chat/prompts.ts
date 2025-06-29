
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
- Help the child practice first words and basic sounds
- Ask one question at a time and wait for their response
- Encourage any attempt at pronunciation, even if not perfect
- Gently model the correct pronunciation after their attempts
- Break words into syllables when teaching (e.g., "Aaa–pple")
- Use simple fruit names: apple 🍎, banana 🍌, orange 🍊`,

  question_time: `

ACTIVITY: Picture Questions
- Ask specific questions about pictures shown to the child
- Ask one question at a time and wait for their response
- Check if their answer matches the expected answer
- If correct, praise them warmly and move to the next question
- If incorrect, gently correct them and encourage them to try again
- Pause briefly after question marks before continuing`,

  build_sentence: `

ACTIVITY: Sentence Building
- Help the child build complete sentences together
- Start with their responses and guide them to expand into full sentences
- Provide gentle guidance and examples
- Encourage them to use complete sentences
- Model proper sentence structure when needed`,

  lets_chat: `

ACTIVITY: Natural Conversation
- Have a friendly, natural conversation with the child
- Ask follow-up questions based on what they say
- Keep the conversation flowing around the chosen topic
- Encourage them to speak in full sentences when possible
- Let the conversation develop organically based on their responses
- Gently guide them back to topic if they go off track
- Keep the session to about 5-6 exchanges to maintain attention`,

  default: `

ACTIVITY: General Speech Practice
- Begin with a short and playful speech lesson
- Teach the names of 3 simple fruits: apple, banana, and orange
- For each fruit, say the name clearly and slowly, breaking it into syllsyllables
- Ask the child to try saying it with you
- You can use fruit emojis: 🍎 for apple, 🍌 for banana, 🍊 for orange
- At the end, praise the child by name and remind them they did something special`
};

// Function to load prompts from Supabase
export const loadPromptsFromDatabase = async () => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: prompts, error } = await supabase
      .from('prompt_configurations')
      .select('prompt_type, content')
      .eq('is_active', true);

    if (error) {
      console.error('Error loading prompts from database:', error);
      return null;
    }

    if (!prompts || prompts.length === 0) {
      console.log('No active prompts found in database, using defaults');
      return null;
    }

    // Convert database prompts to expected format
    const databasePrompts: any = {};
    let basePrompt = baseSpeechTherapistPrompt;

    prompts.forEach(prompt => {
      if (prompt.prompt_type === 'base_prompt') {
        basePrompt = prompt.content;
      } else {
        databasePrompts[prompt.prompt_type] = prompt.content;
      }
    });

    return {
      basePrompt,
      activities: { ...activityPrompts, ...databasePrompts }
    };
  } catch (error) {
    console.error('Error connecting to database for prompts:', error);
    return null;
  }
};

// Helper function to get custom prompts from request headers or database
const getCustomPrompts = async (customBasePrompt?: string, customActivityPrompts?: any) => {
  // First try to load from database
  const databasePrompts = await loadPromptsFromDatabase();
  
  if (databasePrompts) {
    return databasePrompts;
  }

  // Fall back to custom prompts or defaults
  const basePrompt = customBasePrompt || baseSpeechTherapistPrompt;
  const activities = customActivityPrompts ? { ...activityPrompts, ...customActivityPrompts } : activityPrompts;
  
  return { basePrompt, activities };
};

export const createSystemPrompt = async (activityType?: string, customInstructions?: string, customBasePrompt?: string, customActivityPrompts?: any): Promise<string> => {
  const { basePrompt, activities } = await getCustomPrompts(customBasePrompt, customActivityPrompts);
  
  let prompt = basePrompt;
  
  if (activityType && activities[activityType as keyof typeof activities]) {
    prompt += activities[activityType as keyof typeof activities];
  } else {
    prompt += activities.default;
  }
  
  if (customInstructions) {
    prompt += `\n\nADDITIONAL INSTRUCTIONS:\n${customInstructions}`;
  }
  
  return prompt;
};

// Remove the module-level call - this was causing the issue
// export const speechTherapistPrompt = await createSystemPrompt();

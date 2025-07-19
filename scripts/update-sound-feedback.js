import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateSoundFeedbackPrompt() {
  console.log('🔧 Updating sound feedback incorrect prompt...');

  try {
    const { data, error } = await supabase
      .from('prompt_configurations')
      .update({
        content: `You are providing speech therapy feedback for a child who needs help with a sound.

Context: The child attempted to pronounce "{target_sound}" but it wasn't quite right. They said "{user_attempt}".

Your response should:
- Be encouraging and supportive (never critical)
- Acknowledge their effort positively
- Provide gentle guidance on how to make the sound
- Use simple, child-friendly instructions
- Keep it brief (2-3 sentences)
- Use emojis to keep it positive

Example: "Great trying! I heard you say '{user_attempt}'. The '{target_sound}' sound is made like this: [simple instruction] 🎯"

Remember: Focus on encouragement and simple, actionable guidance. Never make the child feel bad about their attempt.`
      })
      .eq('prompt_type', 'sound_feedback_incorrect');

    if (error) {
      console.error('❌ Error updating prompt:', error);
      return;
    }

    console.log('✅ Sound feedback incorrect prompt updated successfully!');
    console.log('📝 Removed "together" language from the prompt');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateSoundFeedbackPrompt(); 
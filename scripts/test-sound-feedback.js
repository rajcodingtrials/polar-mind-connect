const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSoundFeedbackSystem() {
  console.log('🧪 Testing Sound Feedback System...\n');

  try {
    // 1. Check if sound feedback prompts exist
    console.log('1️⃣ Checking sound feedback prompts...');
    const { data: prompts, error: promptsError } = await supabase
      .from('prompt_configurations')
      .select('prompt_type, content')
      .in('prompt_type', [
        'sound_feedback_correct',
        'sound_feedback_incorrect', 
        'sound_feedback_encouragement',
        'sound_feedback_instruction',
        'sound_detection_config'
      ])
      .eq('is_active', true);

    if (promptsError) {
      console.error('❌ Error fetching prompts:', promptsError);
      return;
    }

    console.log(`✅ Found ${prompts.length} sound feedback prompts:`);
    prompts.forEach(prompt => {
      console.log(`   - ${prompt.prompt_type}`);
    });

    // 2. Check sound detection configuration
    console.log('\n2️⃣ Checking sound detection configuration...');
    const soundConfig = prompts.find(p => p.prompt_type === 'sound_detection_config');
    if (soundConfig) {
      const config = JSON.parse(soundConfig.content);
      console.log(`✅ Sound detection config loaded with ${config.sounds.length} sounds:`);
      config.sounds.forEach(sound => {
        console.log(`   - ${sound.sound}: ${sound.description} ${sound.emoji}`);
      });
    } else {
      console.log('❌ No sound detection config found');
    }

    // 3. Test sound detection logic
    console.log('\n3️⃣ Testing sound detection logic...');
    const testInputs = [
      'I said the s sound',
      'th sound is hard',
      'r like rocket',
      'l sound practice',
      'sh quiet sound',
      'just some random words'
    ];

    if (soundConfig) {
      const config = JSON.parse(soundConfig.content);
      
      testInputs.forEach(input => {
        const normalizedInput = input.toLowerCase().trim();
        let bestMatch = null;
        let bestConfidence = 0;

        // Check for exact sound matches
        for (const sound of config.sounds) {
          if (normalizedInput.includes(sound.sound) || 
              normalizedInput.includes(sound.description.toLowerCase()) ||
              normalizedInput.includes(sound.emoji)) {
            bestMatch = sound;
            bestConfidence = 0.9;
            break;
          }

          // Check for common errors
          for (const error of sound.common_errors) {
            if (normalizedInput.includes(error)) {
              const confidence = 0.6;
              if (confidence > bestConfidence) {
                bestMatch = sound;
                bestConfidence = confidence;
              }
            }
          }
        }

        console.log(`   "${input}" -> ${bestMatch ? `${bestMatch.sound} sound (${Math.round(bestConfidence * 100)}%)` : 'No match'}`);
      });
    }

    // 4. Test feedback generation (simulate)
    console.log('\n4️⃣ Testing feedback generation simulation...');
    const testContext = {
      target_sound: 's',
      user_attempt: 'th',
      therapistName: 'Laura',
      childName: 'Alex'
    };

    const feedbackTypes = ['correct', 'incorrect', 'encouragement', 'instruction'];
    feedbackTypes.forEach(type => {
      const prompt = prompts.find(p => p.prompt_type === `sound_feedback_${type}`);
      if (prompt) {
        const promptContent = prompt.content
          .replace('{target_sound}', testContext.target_sound)
          .replace('{user_attempt}', testContext.user_attempt);
        
        console.log(`   ${type} feedback prompt: ${promptContent.substring(0, 100)}...`);
      }
    });

    // 5. Check TTS settings for therapists
    console.log('\n5️⃣ Checking TTS settings...');
    const { data: ttsSettings, error: ttsError } = await supabase
      .from('tts_settings')
      .select('*')
      .in('therapist_name', ['Laura', 'Lawrence']);

    if (ttsError) {
      console.error('❌ Error fetching TTS settings:', ttsError);
    } else {
      console.log(`✅ Found TTS settings for ${ttsSettings.length} therapists:`);
      ttsSettings.forEach(setting => {
        console.log(`   - ${setting.therapist_name}: ${setting.voice} (${setting.provider})`);
      });
    }

    console.log('\n✅ Sound feedback system test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run the migration: supabase db push');
    console.log('   2. Test the system in the app with admin toggle enabled');
    console.log('   3. Try saying sounds like "s", "r", "l", "th", "sh"');
    console.log('   4. Check the debug display for sound feedback');

  } catch (error) {
    console.error('❌ Error testing sound feedback system:', error);
  }
}

// Run the test
testSoundFeedbackSystem(); 
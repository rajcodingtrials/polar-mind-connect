import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gsnsjrfudxyczpldbkzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbnNqcmZ1ZHh5Y3pwbGRia3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODg3NjcsImV4cCI6MjA2NTc2NDc2N30.b1TSKG-ZqxPPaJS-Exlxf4XSlhtb2EXSB0oLDekTXDk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAndFixTTSSettings() {
  console.log('🔍 Checking TTS settings...');
  
  try {
    // Check current TTS settings
    const { data, error } = await supabase
      .from('tts_settings')
      .select('*')
      .order('therapist_name');
    
    if (error) {
      console.error('❌ Error fetching TTS settings:', error);
      return;
    }
    
    console.log('📊 Current TTS Settings:');
    data.forEach(setting => {
      console.log(`  - ${setting.therapist_name}: voice=${setting.voice}, speed=${setting.speed}, provider=${setting.provider || 'NULL'}`);
    });
    
    // Fix TTS settings if needed
    for (const setting of data) {
      let needsUpdate = false;
      let updateData = {};
      
      if (setting.therapist_name === 'Lawrence') {
        if (setting.provider !== 'google' || setting.voice !== 'echo') {
          updateData = { provider: 'google', voice: 'echo' };
          needsUpdate = true;
        }
      } else if (setting.therapist_name === 'Laura') {
        if (setting.provider !== 'openai' || setting.voice !== 'nova') {
          updateData = { provider: 'openai', voice: 'nova' };
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        console.log(`🔄 Updating ${setting.therapist_name} settings...`);
        const { error: updateError } = await supabase
          .from('tts_settings')
          .update(updateData)
          .eq('id', setting.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${setting.therapist_name}:`, updateError);
        } else {
          console.log(`✅ Updated ${setting.therapist_name} settings`);
        }
      }
    }
    
    // Check final settings
    const { data: finalData, error: finalError } = await supabase
      .from('tts_settings')
      .select('*')
      .order('therapist_name');
    
    if (finalError) {
      console.error('❌ Error fetching final TTS settings:', finalError);
      return;
    }
    
    console.log('\n📊 Final TTS Settings:');
    finalData.forEach(setting => {
      console.log(`  - ${setting.therapist_name}: voice=${setting.voice}, speed=${setting.speed}, provider=${setting.provider || 'NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Error in checkAndFixTTSSettings:', error);
  }
}

async function testTTSFunctions() {
  console.log('\n🧪 Testing TTS functions...');
  
  try {
    // Test OpenAI TTS
    console.log('🔍 Testing OpenAI TTS...');
    const openaiResponse = await supabase.functions.invoke('openai-tts', {
      body: {
        text: 'Hello, this is a test of OpenAI TTS',
        voice: 'nova',
        speed: 1.0
      }
    });
    
    if (openaiResponse.error) {
      console.error('❌ OpenAI TTS test failed:', openaiResponse.error);
    } else {
      console.log('✅ OpenAI TTS test successful!');
      console.log('📊 Audio content length:', openaiResponse.data?.audioContent?.length || 'No audio content');
    }
    
    // Test Google TTS
    console.log('\n🔍 Testing Google TTS...');
    const googleResponse = await supabase.functions.invoke('google-tts', {
      body: {
        text: 'Hello, this is a test of Google TTS',
        voice: 'echo',
        speed: 1.0
      }
    });
    
    if (googleResponse.error) {
      console.error('❌ Google TTS test failed:', googleResponse.error);
    } else {
      console.log('✅ Google TTS test successful!');
      console.log('📊 Audio content length:', googleResponse.data?.audioContent?.length || 'No audio content');
    }
    
  } catch (error) {
    console.error('❌ Error testing TTS functions:', error);
  }
}

async function main() {
  console.log('🚀 Starting TTS Settings Check and Fix...\n');
  
  await checkAndFixTTSSettings();
  await testTTSFunctions();
  
  console.log('\n🎉 TTS Settings check and fix complete!');
}

main().catch(console.error); 
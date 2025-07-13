import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gsnsjrfudxyczpldbkzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbnNqcmZ1ZHh5Y3pwbGRia3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODg3NjcsImV4cCI6MjA2NTc2NDc2N30.b1TSKG-ZqxPPaJS-Exlxf4XSlhtb2EXSB0oLDekTXDk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixGoogleTTSVoices() {
  console.log('🔍 Fixing Google TTS voice names...');
  
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
      console.log(`  - ${setting.therapist_name}: voice=${setting.voice}, provider=${setting.provider || 'NULL'}`);
    });
    
    // Fix TTS settings with valid Google TTS voices
    for (const setting of data) {
      let needsUpdate = false;
      let updateData = {};
      
      if (setting.therapist_name === 'Lawrence') {
        // Lawrence should use a Google male voice
        if (setting.voice !== 'en-US-Neural2-I') {
          updateData = { 
            provider: 'google', 
            voice: 'en-US-Neural2-I' // Google male voice
          };
          needsUpdate = true;
        }
      } else if (setting.therapist_name === 'Laura') {
        // Laura should use a Google female voice
        if (setting.voice !== 'en-US-Neural2-J') {
          updateData = { 
            provider: 'google', 
            voice: 'en-US-Neural2-J' // Google female voice
          };
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        console.log(`🔄 Updating ${setting.therapist_name} to use Google TTS voice: ${updateData.voice}`);
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
      console.log(`  - ${setting.therapist_name}: voice=${setting.voice}, provider=${setting.provider || 'NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Error in fixGoogleTTSVoices:', error);
  }
}

async function testGoogleTTSVoices() {
  console.log('\n🧪 Testing Google TTS with correct voices...');
  
  try {
    // Test Lawrence's voice (male)
    console.log('🔍 Testing Lawrence voice (en-US-Neural2-I)...');
    const lawrenceResponse = await supabase.functions.invoke('google-tts', {
      body: {
        text: 'Hello, this is Lawrence speaking with Google TTS.',
        voice: 'en-US-Neural2-I',
        speed: 1.0
      }
    });
    
    if (lawrenceResponse.error) {
      console.error('❌ Lawrence voice test failed:', lawrenceResponse.error);
    } else {
      console.log('✅ Lawrence voice test successful!');
      console.log('📊 Audio content length:', lawrenceResponse.data?.audioContent?.length || 'No audio content');
    }
    
    // Test Laura's voice (female)
    console.log('\n🔍 Testing Laura voice (en-US-Neural2-J)...');
    const lauraResponse = await supabase.functions.invoke('google-tts', {
      body: {
        text: 'Hello, this is Laura speaking with Google TTS.',
        voice: 'en-US-Neural2-J',
        speed: 1.0
      }
    });
    
    if (lauraResponse.error) {
      console.error('❌ Laura voice test failed:', lauraResponse.error);
    } else {
      console.log('✅ Laura voice test successful!');
      console.log('📊 Audio content length:', lauraResponse.data?.audioContent?.length || 'No audio content');
    }
    
  } catch (error) {
    console.error('❌ Error testing Google TTS voices:', error);
  }
}

async function main() {
  console.log('🚀 Starting Google TTS Voice Fix...\n');
  
  await fixGoogleTTSVoices();
  await testGoogleTTSVoices();
  
  console.log('\n🎉 Google TTS voice fix complete!');
  console.log('\n📋 Summary:');
  console.log('  - Lawrence: en-US-Neural2-I (Google male voice)');
  console.log('  - Laura: en-US-Neural2-J (Google female voice)');
  console.log('  - Both therapists now use Google TTS');
}

main().catch(console.error); 
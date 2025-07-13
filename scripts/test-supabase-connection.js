import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gsnsjrfudxyczpldbkzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbnNqcmZ1ZHh5Y3pwbGRia3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODg3NjcsImV4cCI6MjA2NTc2NDc2N30.b1TSKG-ZqxPPaJS-Exlxf4XSlhtb2EXSB0oLDekTXDk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('🔌 Testing Supabase connection...');
  
  try {
    // Test basic connection by querying a simple table
    const { data, error } = await supabase
      .from('tts_settings')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error);
    return false;
  }
}

async function checkTTSSettings() {
  console.log('\n🔍 Checking TTS Settings...');
  
  try {
    const { data, error } = await supabase
      .from('tts_settings')
      .select('*')
      .order('therapist_name');
    
    if (error) {
      console.error('❌ Error fetching TTS settings:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No TTS settings found in database');
      return;
    }
    
    console.log('📊 Current TTS Settings:');
    data.forEach(setting => {
      console.log(`  - ${setting.therapist_name}:`);
      console.log(`    Voice: ${setting.voice}`);
      console.log(`    Speed: ${setting.speed}`);
      console.log(`    Provider: ${setting.provider || 'NULL'}`);
      console.log(`    SSML Enabled: ${setting.enable_ssml || false}`);
      console.log(`    Updated: ${new Date(setting.updated_at).toLocaleString()}`);
      console.log('');
    });
    
    return data;
  } catch (error) {
    console.error('❌ Error checking TTS settings:', error);
  }
}

async function checkCelebrationMessages() {
  console.log('\n🎉 Checking Celebration Messages...');
  
  try {
    const { data, error } = await supabase
      .from('celebration_messages')
      .select('*')
      .order('therapist_name')
      .order('message_type');
    
    if (error) {
      console.error('❌ Error fetching celebration messages:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No celebration messages found in database');
      return;
    }
    
    console.log(`📊 Found ${data.length} celebration messages:`);
    
    // Group by therapist and message type
    const grouped = data.reduce((acc, msg) => {
      const key = `${msg.therapist_name}-${msg.message_type}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(msg);
      return acc;
    }, {});
    
    Object.entries(grouped).forEach(([key, messages]) => {
      const [therapist, type] = key.split('-');
      console.log(`\n  ${therapist} - ${type} (${messages.length} messages):`);
      messages.slice(0, 3).forEach(msg => {
        console.log(`    Level ${msg.progress_level}: "${msg.content.substring(0, 50)}..."`);
      });
      if (messages.length > 3) {
        console.log(`    ... and ${messages.length - 3} more`);
      }
    });
    
    return data;
  } catch (error) {
    console.error('❌ Error checking celebration messages:', error);
  }
}

async function testOpenAITTS() {
  console.log('\n🔍 Testing OpenAI TTS Function...');
  
  try {
    const response = await supabase.functions.invoke('openai-tts', {
      body: {
        text: 'Hello, this is a test of OpenAI TTS.',
        voice: 'nova',
        speed: 1.0
      }
    });
    
    if (response.error) {
      console.error('❌ OpenAI TTS test failed:', response.error);
      return false;
    }
    
    console.log('✅ OpenAI TTS test successful!');
    console.log(`📊 Audio content length: ${response.data?.audioContent?.length || 'No audio content'}`);
    return true;
  } catch (error) {
    console.error('❌ OpenAI TTS test error:', error);
    return false;
  }
}

async function testGoogleTTS() {
  console.log('\n🔍 Testing Google TTS Function...');
  
  try {
    const response = await supabase.functions.invoke('google-tts', {
      body: {
        text: 'Hello, this is a test of Google TTS.',
        voice: 'en-US-Neural2-J',
        speed: 1.0
      }
    });
    
    if (response.error) {
      console.error('❌ Google TTS test failed:', response.error);
      return false;
    }
    
    console.log('✅ Google TTS test successful!');
    console.log(`📊 Audio content length: ${response.data?.audioContent?.length || 'No audio content'}`);
    return true;
  } catch (error) {
    console.error('❌ Google TTS test error:', error);
    return false;
  }
}

async function testCelebrationMessageRetrieval() {
  console.log('\n🎯 Testing Celebration Message Retrieval...');
  
  try {
    // Test getting a celebration message for Laura
    const { data: lauraData, error: lauraError } = await supabase
      .from('celebration_messages')
      .select('content')
      .eq('message_type', 'tts_audio')
      .eq('therapist_name', 'Laura')
      .eq('message_category', 'correct_answer')
      .eq('progress_level', 1)
      .eq('is_active', true)
      .limit(1);
    
    if (lauraError) {
      console.error('❌ Error fetching Laura celebration message:', lauraError);
    } else if (lauraData && lauraData.length > 0) {
      console.log('✅ Laura celebration message found:', lauraData[0].content);
    } else {
      console.log('⚠️ No Laura celebration message found');
    }
    
    // Test getting a celebration message for Lawrence
    const { data: lawrenceData, error: lawrenceError } = await supabase
      .from('celebration_messages')
      .select('content')
      .eq('message_type', 'tts_audio')
      .eq('therapist_name', 'Lawrence')
      .eq('message_category', 'correct_answer')
      .eq('progress_level', 1)
      .eq('is_active', true)
      .limit(1);
    
    if (lawrenceError) {
      console.error('❌ Error fetching Lawrence celebration message:', lawrenceError);
    } else if (lawrenceData && lawrenceData.length > 0) {
      console.log('✅ Lawrence celebration message found:', lawrenceData[0].content);
    } else {
      console.log('⚠️ No Lawrence celebration message found');
    }
    
  } catch (error) {
    console.error('❌ Error testing celebration message retrieval:', error);
  }
}

async function testEndToEndTTS() {
  console.log('\n🔄 Testing End-to-End TTS Flow...');
  
  try {
    // Get TTS settings for Laura
    const { data: lauraSettings, error: lauraSettingsError } = await supabase
      .from('tts_settings')
      .select('*')
      .eq('therapist_name', 'Laura')
      .single();
    
    if (lauraSettingsError) {
      console.error('❌ Error fetching Laura TTS settings:', lauraSettingsError);
      return;
    }
    
    console.log('📊 Laura TTS Settings:', {
      voice: lauraSettings.voice,
      provider: lauraSettings.provider,
      speed: lauraSettings.speed
    });
    
    // Get a celebration message for Laura
    const { data: lauraMessage, error: lauraMessageError } = await supabase
      .from('celebration_messages')
      .select('content')
      .eq('message_type', 'tts_audio')
      .eq('therapist_name', 'Laura')
      .eq('message_category', 'correct_answer')
      .eq('progress_level', 1)
      .eq('is_active', true)
      .limit(1)
      .single();
    
    if (lauraMessageError) {
      console.error('❌ Error fetching Laura celebration message:', lauraMessageError);
      return;
    }
    
    console.log('📝 Laura Celebration Message:', lauraMessage.content);
    
    // Test TTS with Laura's settings and message
    const ttsFunction = lauraSettings.provider === 'google' ? 'google-tts' : 'openai-tts';
    console.log(`🔊 Testing ${ttsFunction} with Laura's settings...`);
    
    const ttsResponse = await supabase.functions.invoke(ttsFunction, {
      body: {
        text: lauraMessage.content,
        voice: lauraSettings.voice,
        speed: lauraSettings.speed
      }
    });
    
    if (ttsResponse.error) {
      console.error('❌ TTS generation failed:', ttsResponse.error);
    } else {
      console.log('✅ TTS generation successful!');
      console.log(`📊 Audio content length: ${ttsResponse.data?.audioContent?.length || 'No audio content'}`);
    }
    
  } catch (error) {
    console.error('❌ Error in end-to-end TTS test:', error);
  }
}

async function main() {
  console.log('🚀 Starting Supabase Connection and Testing Script\n');
  console.log('=' .repeat(60));
  
  // Test basic connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Cannot proceed without connection');
    return;
  }
  
  // Check TTS settings
  await checkTTSSettings();
  
  // Check celebration messages
  await checkCelebrationMessages();
  
  // Test TTS functions
  await testOpenAITTS();
  await testGoogleTTS();
  
  // Test celebration message retrieval
  await testCelebrationMessageRetrieval();
  
  // Test end-to-end flow
  await testEndToEndTTS();
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎉 Supabase testing complete!');
  console.log('\n📋 Summary:');
  console.log('  - Connection: ✅');
  console.log('  - TTS Settings: Checked');
  console.log('  - Celebration Messages: Checked');
  console.log('  - OpenAI TTS: Tested');
  console.log('  - Google TTS: Tested');
  console.log('  - End-to-End Flow: Tested');
}

main().catch(console.error); 
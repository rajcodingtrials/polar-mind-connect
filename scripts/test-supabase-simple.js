// Simple Supabase Connection and Testing Script
// Run with: node scripts/test-supabase-simple.js

// You'll need to replace this with your actual anon key from Supabase dashboard
const SUPABASE_URL = 'https://gsnsjrfudxyczpldbkzc.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here'; // Replace with your actual key

// Test functions
async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tts_settings?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('❌ Database connection failed:', response.status, response.statusText);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Database connection successful!');
    console.log('📊 Sample data:', data);
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
}

async function checkTTSSettings() {
  console.log('\n🔍 Checking TTS settings...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tts_settings?select=*&order=therapist_name`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('❌ Error fetching TTS settings:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ TTS Settings found:');
    data.forEach(setting => {
      console.log(`  - ${setting.therapist_name}: voice=${setting.voice}, speed=${setting.speed}, provider=${setting.provider || 'openai'}`);
    });
    
    return data;
  } catch (error) {
    console.error('❌ Error checking TTS settings:', error);
  }
}

async function testOpenAITTS() {
  console.log('\n🔍 Testing OpenAI TTS...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-tts`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'Hello, this is a test of OpenAI TTS',
        voice: 'nova',
        speed: 1.0
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI TTS test failed:', response.status, errorText);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ OpenAI TTS test successful!');
    console.log('📊 Audio content length:', data.audioContent?.length || 'No audio content');
    return true;
  } catch (error) {
    console.error('❌ OpenAI TTS test error:', error);
    return false;
  }
}

async function testGoogleTTS() {
  console.log('\n🔍 Testing Google TTS...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/google-tts`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'Hello, this is a test of Google TTS with Lawrence voice',
        voice: 'echo',
        speed: 1.0
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google TTS test failed:', response.status, errorText);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Google TTS test successful!');
    console.log('📊 Audio content length:', data.audioContent?.length || 'No audio content');
    return true;
  } catch (error) {
    console.error('❌ Google TTS test error:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Supabase Connection and Testing Script\n');
  
  if (SUPABASE_ANON_KEY === 'your-anon-key-here') {
    console.log('❌ Please update SUPABASE_ANON_KEY in the script with your actual key from Supabase dashboard');
    console.log('   Go to: https://supabase.com/dashboard/project/gsnsjrfudxyczpldbkzc/settings/api');
    return;
  }
  
  // Test database connection
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.log('\n❌ Cannot proceed without database connection');
    return;
  }
  
  // Check current TTS settings
  await checkTTSSettings();
  
  // Test TTS functions
  console.log('\n🧪 Testing TTS Functions...');
  
  const openaiSuccess = await testOpenAITTS();
  const googleSuccess = await testGoogleTTS();
  
  // Summary
  console.log('\n📋 Test Summary:');
  console.log(`  - Database Connection: ${dbConnected ? '✅' : '❌'}`);
  console.log(`  - OpenAI TTS: ${openaiSuccess ? '✅' : '❌'}`);
  console.log(`  - Google TTS: ${googleSuccess ? '✅' : '❌'}`);
  
  if (openaiSuccess && googleSuccess) {
    console.log('\n🎉 All tests passed! Your Google TTS migration is ready!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }
}

// Run the tests
runAllTests().catch(console.error); 
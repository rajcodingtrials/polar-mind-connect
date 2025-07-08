// Simple test script to debug Google TTS function
const SUPABASE_URL = 'https://gsnsjrfudxyczpldbkzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbnNqcmZ1ZHh5Y3pwbGRia3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODg3NjcsImV4cCI6MjA2NTc2NDc2N30.b1TSKG-ZqxPPaJS-Exlxf4XSlhtb2EXSB0oLDekTXDk';

async function testGoogleTTS() {
  try {
    console.log('🧪 Testing Google TTS function...');
    
    // Test with a simple request
    const response = await fetch(`${SUPABASE_URL}/functions/v1/google-tts`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'Hello, this is a test.',
        voice: 'en-US-Neural2-J',
        speed: 1.0
      })
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google TTS test failed:', response.status);
      console.error('❌ Error details:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Parsed error:', errorJson);
      } catch (e) {
        console.error('❌ Raw error text:', errorText);
      }
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

// Test with different voices
async function testDifferentVoices() {
  const voices = [
    'en-US-Neural2-J',
    'en-US-Wavenet-D', 
    'en-US-Neural2-I',
    'echo' // This is an OpenAI voice, should fail
  ];

  for (const voice of voices) {
    console.log(`\n🎤 Testing voice: ${voice}`);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/google-tts`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: `Testing voice ${voice}`,
          voice: voice,
          speed: 1.0
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Voice ${voice} works! Audio length: ${data.audioContent?.length || 0}`);
      } else {
        const errorText = await response.text();
        console.log(`❌ Voice ${voice} failed: ${response.status} - ${errorText.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`❌ Voice ${voice} error: ${error.message}`);
    }
  }
}

// Run tests
console.log('🚀 Starting Google TTS debug tests...\n');
testGoogleTTS().then(() => {
  console.log('\n🎤 Testing different voices...');
  return testDifferentVoices();
}).then(() => {
  console.log('\n✅ All tests completed!');
}); 
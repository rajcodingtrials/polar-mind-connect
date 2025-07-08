// Test Google TTS function directly to see the error
const SUPABASE_URL = 'https://gsnsjrfudxyczpldbkzc.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here'; // Replace with your actual key

async function testGoogleTTSDirect() {
  try {
    console.log('🧪 Testing Google TTS function directly...');
    
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

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

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

testGoogleTTSDirect(); 
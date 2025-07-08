// Debug script for Google TTS function
const SUPABASE_URL = 'https://gsnsjrfudxyczpldbkzc.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here'; // Replace with your actual key

async function testGoogleTTSDebug() {
  try {
    console.log('🧪 Testing Google TTS function with debug info...');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/google-tts`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'Hello, this is a test of Google TTS',
        voice: 'echo',
        speed: 1.0
      })
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response status text:', response.statusText);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📊 Raw response text:', responseText);

    if (!response.ok) {
      console.error('❌ Google TTS test failed:', response.status);
      
      try {
        const errorJson = JSON.parse(responseText);
        console.error('❌ Parsed error:', errorJson);
      } catch (e) {
        console.error('❌ Raw error text:', responseText);
      }
      return false;
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log('✅ Google TTS test successful!');
      console.log('📊 Response data:', data);
      console.log('📊 Audio content length:', data.audioContent?.length || 'No audio content');
      return true;
    } catch (e) {
      console.error('❌ Failed to parse JSON response:', e);
      console.error('❌ Raw response:', responseText);
      return false;
    }
  } catch (error) {
    console.error('❌ Google TTS test error:', error);
    return false;
  }
}

testGoogleTTSDebug(); 
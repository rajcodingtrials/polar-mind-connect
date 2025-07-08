// Simple test script for Google TTS edge function
const SUPABASE_URL = 'https://gsnsjrfudxyczpldbkzc.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here'; // You'll need to get this from your Supabase dashboard

async function testGoogleTTS() {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/google-tts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello, this is a test of Google TTS with Lawrence voice',
        voice: 'echo',
        speed: 1.0
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Google TTS test successful!');
      console.log('Audio content length:', data.audioContent?.length || 'No audio content');
      return data;
    } else {
      const error = await response.text();
      console.error('❌ Google TTS test failed:', error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing Google TTS:', error);
    return null;
  }
}

// Run the test
testGoogleTTS(); 
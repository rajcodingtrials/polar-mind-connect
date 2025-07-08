// Simple script to check Lawrence's TTS settings
const SUPABASE_URL = 'https://gsnsjrfudxyczpldbkzc.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here'; // Replace with your actual key

async function checkLawrenceTTS() {
  try {
    console.log('🔍 Checking Lawrence\'s TTS settings...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tts_settings?therapist_name=eq.Lawrence&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch TTS settings:', response.status);
      return;
    }

    const data = await response.json();
    console.log('📊 Lawrence\'s TTS settings:', data);
    
    if (data && data.length > 0) {
      const settings = data[0];
      console.log('🎯 Lawrence\'s current settings:');
      console.log('  - Voice:', settings.voice);
      console.log('  - Provider:', settings.provider || 'not set (defaults to openai)');
      console.log('  - Speed:', settings.speed);
      console.log('  - Enable SSML:', settings.enable_ssml);
    } else {
      console.log('⚠️ No TTS settings found for Lawrence');
    }
    
  } catch (error) {
    console.error('❌ Error checking Lawrence\'s TTS settings:', error);
  }
}

checkLawrenceTTS(); 
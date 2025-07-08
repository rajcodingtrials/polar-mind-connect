// Script to fix Lawrence's TTS settings to use Google TTS
const SUPABASE_URL = 'https://gsnsjrfudxyczpldbkzc.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here'; // Replace with your actual key

async function fixLawrenceTTS() {
  try {
    console.log('🔧 Fixing Lawrence\'s TTS settings to use Google TTS...');
    
    // First, check if Lawrence exists
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/tts_settings?therapist_name=eq.Lawrence&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!checkResponse.ok) {
      console.error('❌ Failed to check Lawrence\'s settings:', checkResponse.status);
      return;
    }

    const existingData = await checkResponse.json();
    console.log('📊 Current Lawrence settings:', existingData);
    
    if (existingData && existingData.length > 0) {
      // Update existing record
      const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/tts_settings?id=eq.${existingData[0].id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          provider: 'google',
          voice: 'echo',
          speed: 1.0
        })
      });

      if (updateResponse.ok) {
        console.log('✅ Lawrence updated to use Google TTS!');
      } else {
        console.error('❌ Failed to update Lawrence:', updateResponse.status);
      }
    } else {
      // Create new record
      const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/tts_settings`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          therapist_name: 'Lawrence',
          provider: 'google',
          voice: 'echo',
          speed: 1.0,
          enable_ssml: false,
          sample_ssml: '<speak>Hello! <break time="0.5s"/> I am Lawrence, your speech therapy assistant. <emphasis level="strong">Let\'s have fun learning together!</emphasis></speak>'
        })
      });

      if (createResponse.ok) {
        console.log('✅ Lawrence created with Google TTS!');
      } else {
        console.error('❌ Failed to create Lawrence:', createResponse.status);
      }
    }
    
    // Verify the change
    const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/tts_settings?therapist_name=eq.Lawrence&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('🎯 Lawrence\'s updated settings:', verifyData);
    }
    
  } catch (error) {
    console.error('❌ Error fixing Lawrence\'s TTS settings:', error);
  }
}

fixLawrenceTTS(); 
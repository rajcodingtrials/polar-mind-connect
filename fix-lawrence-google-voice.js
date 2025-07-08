// Script to fix Lawrence's TTS settings to use a proper Google TTS voice
const SUPABASE_URL = 'https://gsnsjrfudxyczpldbkzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbnNqcmZ1ZHh5Y3pwbGRia3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODg3NjcsImV4cCI6MjA2NTc2NDc2N30.b1TSKG-ZqxPPaJS-Exlxf4XSlhtb2EXSB0oLDekTXDk';

async function fixLawrenceVoice() {
  try {
    console.log('🔧 Fixing Lawrence\'s voice to use proper Google TTS voice...');
    
    // First, check current settings
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
      const currentSettings = existingData[0];
      console.log('🎯 Lawrence\'s current voice:', currentSettings.voice);
      console.log('🎯 Lawrence\'s current provider:', currentSettings.provider);
      
      // Update to use a proper Google TTS male voice
      const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/tts_settings?id=eq.${currentSettings.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          provider: 'google',
          voice: 'en-US-Neural2-I', // Proper Google TTS male voice
          speed: 1.0
        })
      });

      if (updateResponse.ok) {
        console.log('✅ Lawrence updated to use Google TTS voice: en-US-Neural2-I');
      } else {
        console.error('❌ Failed to update Lawrence:', updateResponse.status);
        const errorText = await updateResponse.text();
        console.error('❌ Error details:', errorText);
      }
    } else {
      console.log('⚠️ No TTS settings found for Lawrence, creating new record...');
      
      // Create new record with proper Google TTS voice
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
          voice: 'en-US-Neural2-I', // Proper Google TTS male voice
          speed: 1.0,
          enable_ssml: false,
          sample_ssml: '<speak>Hello! <break time="0.5s"/> I am Lawrence, your speech therapy assistant. <emphasis level="strong">Let\'s have fun learning together!</emphasis></speak>'
        })
      });

      if (createResponse.ok) {
        console.log('✅ Lawrence created with Google TTS voice: en-US-Neural2-I');
      } else {
        console.error('❌ Failed to create Lawrence:', createResponse.status);
        const errorText = await createResponse.text();
        console.error('❌ Error details:', errorText);
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
    console.error('❌ Error fixing Lawrence\'s voice:', error);
  }
}

// Run the fix
fixLawrenceVoice(); 
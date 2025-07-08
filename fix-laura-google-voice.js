// Script to fix Laura's TTS settings to use Google TTS
const SUPABASE_URL = 'https://gsnsjrfudxyczpldbkzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbnNqcmZ1ZHh5Y3pwbGRia3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODg3NjcsImV4cCI6MjA2NTc2NDc2N30.b1TSKG-ZqxPPaJS-Exlxf4XSlhtb2EXSB0oLDekTXDk';

async function fixLauraVoice() {
  try {
    console.log('🔧 Fixing Laura\'s voice to use Google TTS...');
    
    // First, check current settings
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/tts_settings?therapist_name=eq.Laura&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!checkResponse.ok) {
      console.error('❌ Failed to check Laura\'s settings:', checkResponse.status);
      return;
    }

    const existingData = await checkResponse.json();
    console.log('📊 Current Laura settings:', existingData);
    
    if (existingData && existingData.length > 0) {
      const currentSettings = existingData[0];
      console.log('🎯 Laura\'s current voice:', currentSettings.voice);
      console.log('🎯 Laura\'s current provider:', currentSettings.provider);
      
      // Update to use Google TTS with proper female voice
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
          voice: 'en-US-Neural2-J', // Proper Google TTS female voice
          speed: 1.0
        })
      });

      if (updateResponse.ok) {
        console.log('✅ Laura updated to use Google TTS voice: en-US-Neural2-J');
      } else {
        console.error('❌ Failed to update Laura:', updateResponse.status);
        const errorText = await updateResponse.text();
        console.error('❌ Error details:', errorText);
      }
    } else {
      console.log('⚠️ No TTS settings found for Laura, creating new record...');
      
      // Create new record with Google TTS voice
      const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/tts_settings`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          therapist_name: 'Laura',
          provider: 'google',
          voice: 'en-US-Neural2-J', // Proper Google TTS female voice
          speed: 1.0,
          enable_ssml: false,
          sample_ssml: '<speak>Hello! <break time="0.5s"/> I am Laura, your speech therapy assistant. <emphasis level="strong">Let\'s have fun learning together!</emphasis></speak>'
        })
      });

      if (createResponse.ok) {
        console.log('✅ Laura created with Google TTS voice: en-US-Neural2-J');
      } else {
        console.error('❌ Failed to create Laura:', createResponse.status);
        const errorText = await createResponse.text();
        console.error('❌ Error details:', errorText);
      }
    }
    
    // Verify the change
    const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/tts_settings?therapist_name=eq.Laura&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('🎯 Laura\'s updated settings:', verifyData);
    }
    
  } catch (error) {
    console.error('❌ Error fixing Laura\'s voice:', error);
  }
}

// Run the fix
fixLauraVoice(); 
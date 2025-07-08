// Script to fix Lawrence's voice - run this in browser console when logged in as admin
// Copy and paste this into your browser console on the admin page

async function fixLawrenceVoice() {
  try {
    console.log('🔧 Fixing Lawrence\'s voice to use proper Google TTS voice...');
    
    // Use the existing Supabase client from the page
    const { data: currentSettings, error: checkError } = await supabase
      .from('tts_settings')
      .select('*')
      .eq('therapist_name', 'Lawrence');
    
    if (checkError) {
      console.error('❌ Error checking Lawrence\'s settings:', checkError);
      return;
    }
    
    console.log('📊 Current Lawrence settings:', currentSettings);
    
    if (currentSettings && currentSettings.length > 0) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('tts_settings')
        .update({
          provider: 'google',
          voice: 'en-US-Neural2-I', // Proper Google TTS male voice
          speed: 1.0,
          updated_at: new Date().toISOString()
        })
        .eq('therapist_name', 'Lawrence');
      
      if (updateError) {
        console.error('❌ Error updating Lawrence:', updateError);
        return;
      }
      
      console.log('✅ Lawrence updated to use Google TTS voice: en-US-Neural2-I');
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('tts_settings')
        .insert({
          therapist_name: 'Lawrence',
          provider: 'google',
          voice: 'en-US-Neural2-I', // Proper Google TTS male voice
          speed: 1.0,
          enable_ssml: false,
          sample_ssml: '<speak>Hello! <break time="0.5s"/> I am Lawrence, your speech therapy assistant. <emphasis level="strong">Let\'s have fun learning together!</emphasis></speak>'
        });
      
      if (insertError) {
        console.error('❌ Error creating Lawrence:', insertError);
        return;
      }
      
      console.log('✅ Lawrence created with Google TTS voice: en-US-Neural2-I');
    }
    
    // Verify the change
    const { data: verifyData, error: verifyError } = await supabase
      .from('tts_settings')
      .select('*')
      .eq('therapist_name', 'Lawrence');
    
    if (verifyError) {
      console.error('❌ Error verifying Lawrence\'s settings:', verifyError);
      return;
    }
    
    console.log('🎯 Lawrence\'s updated settings:', verifyData);
    console.log('✅ Lawrence\'s voice has been fixed! He will now use Google TTS with voice: en-US-Neural2-I');
    
  } catch (error) {
    console.error('❌ Error fixing Lawrence\'s voice:', error);
  }
}

// Run the fix
fixLawrenceVoice(); 
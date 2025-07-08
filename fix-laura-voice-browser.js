// Script to fix Laura's voice - run this in browser console when logged in as admin
// Copy and paste this into your browser console on the admin page

async function fixLauraVoice() {
  try {
    console.log('🔧 Fixing Laura\'s voice to use Google TTS...');
    
    // Use the existing Supabase client from the page
    const { data: currentSettings, error: checkError } = await supabase
      .from('tts_settings')
      .select('*')
      .eq('therapist_name', 'Laura');
    
    if (checkError) {
      console.error('❌ Error checking Laura\'s settings:', checkError);
      return;
    }
    
    console.log('📊 Current Laura settings:', currentSettings);
    
    if (currentSettings && currentSettings.length > 0) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('tts_settings')
        .update({
          provider: 'google',
          voice: 'en-US-Neural2-J', // Proper Google TTS female voice
          speed: 1.0,
          updated_at: new Date().toISOString()
        })
        .eq('therapist_name', 'Laura');
      
      if (updateError) {
        console.error('❌ Error updating Laura:', updateError);
        return;
      }
      
      console.log('✅ Laura updated to use Google TTS voice: en-US-Neural2-J');
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('tts_settings')
        .insert({
          therapist_name: 'Laura',
          provider: 'google',
          voice: 'en-US-Neural2-J', // Proper Google TTS female voice
          speed: 1.0,
          enable_ssml: false,
          sample_ssml: '<speak>Hello! <break time="0.5s"/> I am Laura, your speech therapy assistant. <emphasis level="strong">Let\'s have fun learning together!</emphasis></speak>'
        });
      
      if (insertError) {
        console.error('❌ Error creating Laura:', insertError);
        return;
      }
      
      console.log('✅ Laura created with Google TTS voice: en-US-Neural2-J');
    }
    
    // Verify the change
    const { data: verifyData, error: verifyError } = await supabase
      .from('tts_settings')
      .select('*')
      .eq('therapist_name', 'Laura');
    
    if (verifyError) {
      console.error('❌ Error verifying Laura\'s settings:', verifyError);
      return;
    }
    
    console.log('🎯 Laura\'s updated settings:', verifyData);
    console.log('✅ Laura\'s voice has been fixed! She will now use Google TTS with voice: en-US-Neural2-J');
    
  } catch (error) {
    console.error('❌ Error fixing Laura\'s voice:', error);
  }
}

// Run the fix
fixLauraVoice(); 
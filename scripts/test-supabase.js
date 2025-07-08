// Supabase Connection and Testing Script
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const SUPABASE_URL = 'https://gsnsjrfudxyczpldbkzc.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key-here';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test functions
async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('tts_settings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
    
    console.log('✅ Database connection successful!');
    console.log('📊 Sample data:', data);
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
}

async function checkTTSSettings() {
  console.log('\n🔍 Checking TTS settings...');
  
  try {
    const { data, error } = await supabase
      .from('tts_settings')
      .select('*')
      .order('therapist_name');
    
    if (error) {
      console.error('❌ Error fetching TTS settings:', error);
      return;
    }
    
    console.log('✅ TTS Settings found:');
    data.forEach(setting => {
      console.log(`  - ${setting.therapist_name}: voice=${setting.voice}, speed=${setting.speed}, provider=${setting.provider || 'openai'}`);
    });
    
    return data;
  } catch (error) {
    console.error('❌ Error checking TTS settings:', error);
  }
}

async function testOpenAITTS() {
  console.log('\n🔍 Testing OpenAI TTS...');
  
  try {
    const response = await supabase.functions.invoke('openai-tts', {
      body: {
        text: 'Hello, this is a test of OpenAI TTS',
        voice: 'nova',
        speed: 1.0
      }
    });
    
    if (response.error) {
      console.error('❌ OpenAI TTS test failed:', response.error);
      return false;
    }
    
    console.log('✅ OpenAI TTS test successful!');
    console.log('📊 Audio content length:', response.data?.audioContent?.length || 'No audio content');
    return true;
  } catch (error) {
    console.error('❌ OpenAI TTS test error:', error);
    return false;
  }
}

async function testGoogleTTS() {
  console.log('\n🔍 Testing Google TTS...');
  
  try {
    const response = await supabase.functions.invoke('google-tts', {
      body: {
        text: 'Hello, this is a test of Google TTS with Lawrence voice',
        voice: 'echo',
        speed: 1.0
      }
    });
    
    if (response.error) {
      console.error('❌ Google TTS test failed:', response.error);
      return false;
    }
    
    console.log('✅ Google TTS test successful!');
    console.log('📊 Audio content length:', response.data?.audioContent?.length || 'No audio content');
    return true;
  } catch (error) {
    console.error('❌ Google TTS test error:', error);
    return false;
  }
}

async function updateTTSSettings() {
  console.log('\n🔍 Updating TTS settings...');
  
  try {
    // Check if provider column exists
    const { data: existingData } = await supabase
      .from('tts_settings')
      .select('*')
      .limit(1);
    
    if (existingData && existingData.length > 0 && !existingData[0].hasOwnProperty('provider')) {
      console.log('⚠️ Provider column does not exist. You may need to run the migration manually.');
      return;
    }
    
    // Update Lawrence to use Google TTS
    const { error: lawrenceError } = await supabase
      .from('tts_settings')
      .update({ 
        provider: 'google', 
        voice: 'echo' 
      })
      .eq('therapist_name', 'Lawrence');
    
    if (lawrenceError) {
      console.error('❌ Error updating Lawrence:', lawrenceError);
    } else {
      console.log('✅ Lawrence updated to use Google TTS');
    }
    
    // Update Laura to use OpenAI TTS
    const { error: lauraError } = await supabase
      .from('tts_settings')
      .update({ 
        provider: 'openai', 
        voice: 'nova' 
      })
      .eq('therapist_name', 'Laura');
    
    if (lauraError) {
      console.error('❌ Error updating Laura:', lauraError);
    } else {
      console.log('✅ Laura updated to use OpenAI TTS');
    }
    
  } catch (error) {
    console.error('❌ Error updating TTS settings:', error);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Supabase Connection and Testing Script\n');
  
  // Test database connection
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.log('\n❌ Cannot proceed without database connection');
    return;
  }
  
  // Check current TTS settings
  await checkTTSSettings();
  
  // Update TTS settings if needed
  await updateTTSSettings();
  
  // Test TTS functions
  console.log('\n🧪 Testing TTS Functions...');
  
  const openaiSuccess = await testOpenAITTS();
  const googleSuccess = await testGoogleTTS();
  
  // Summary
  console.log('\n📋 Test Summary:');
  console.log(`  - Database Connection: ${dbConnected ? '✅' : '❌'}`);
  console.log(`  - OpenAI TTS: ${openaiSuccess ? '✅' : '❌'}`);
  console.log(`  - Google TTS: ${googleSuccess ? '✅' : '❌'}`);
  
  if (openaiSuccess && googleSuccess) {
    console.log('\n🎉 All tests passed! Your Google TTS migration is ready!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }
}

// Run the tests
runAllTests().catch(console.error); 
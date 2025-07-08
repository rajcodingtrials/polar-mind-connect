# Supabase Test Scripts

This directory contains scripts to test and verify your Supabase setup, particularly for the Google TTS migration.

## Scripts

### `test-supabase-simple.js`
A simple Node.js script that tests:
- Database connection
- TTS settings retrieval
- OpenAI TTS function
- Google TTS function

## How to Use

### 1. Get Your Supabase Anon Key
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/gsnsjrfudxyczpldbkzc/settings/api
2. Copy the "anon public" key
3. Replace `your-anon-key-here` in `test-supabase-simple.js` with your actual key

### 2. Run the Test
```bash
npm run test:supabase
```

Or directly:
```bash
node scripts/test-supabase-simple.js
```

## What the Script Tests

### ✅ Database Connection
- Tests basic connection to your Supabase database
- Verifies you can query the `tts_settings` table

### ✅ TTS Settings
- Shows current TTS settings for all therapists
- Displays voice, speed, and provider settings

### ✅ OpenAI TTS
- Tests the `openai-tts` edge function
- Verifies it returns audio content

### ✅ Google TTS
- Tests the `google-tts` edge function
- Verifies it returns audio content
- Tests Lawrence's voice mapping

## Expected Output

```
🚀 Starting Supabase Connection and Testing Script

🔍 Testing database connection...
✅ Database connection successful!
📊 Sample data: [...]

🔍 Checking TTS settings...
✅ TTS Settings found:
  - Laura: voice=nova, speed=1.0, provider=openai
  - Lawrence: voice=echo, speed=1.0, provider=google

🧪 Testing TTS Functions...

🔍 Testing OpenAI TTS...
✅ OpenAI TTS test successful!
📊 Audio content length: 12345

🔍 Testing Google TTS...
✅ Google TTS test successful!
📊 Audio content length: 12345

📋 Test Summary:
  - Database Connection: ✅
  - OpenAI TTS: ✅
  - Google TTS: ✅

🎉 All tests passed! Your Google TTS migration is ready!
```

## Troubleshooting

### ❌ "Please update SUPABASE_ANON_KEY"
- Get your anon key from Supabase dashboard
- Replace the placeholder in the script

### ❌ "Database connection failed"
- Check your Supabase URL
- Verify your anon key is correct
- Ensure your database is accessible

### ❌ "OpenAI TTS test failed"
- Check your OpenAI API key in Supabase environment variables
- Verify the `openai-tts` edge function is deployed

### ❌ "Google TTS test failed"
- Check your Google TTS credentials in Supabase environment variables
- Verify the `google-tts` edge function is deployed
- Check Google Cloud project settings

## Next Steps

After successful tests:
1. Test Lawrence in your app (should use Google TTS)
2. Test Laura in your app (should use OpenAI TTS)
3. Verify voice differences in the browser
4. Check console logs for provider confirmation 
# Google TTS Setup Test Plan

## ✅ Completed Steps:
1. ✅ Google Cloud service account created
2. ✅ Google TTS credentials added to Supabase
3. ✅ Google TTS edge function created and deployed
4. ✅ TTS settings hook updated to support providers
5. ✅ SingleQuestionView component updated to use new hook

## 🧪 Test Steps:

### 1. Test Lawrence (Google TTS)
- Click on Lawrence in the therapist selection
- Start a question session
- Verify Lawrence uses Google TTS (check console logs)
- Verify voice sounds different (male voice)

### 2. Test Laura (OpenAI TTS)
- Click on Laura in the therapist selection
- Start a question session
- Verify Laura still uses OpenAI TTS (check console logs)
- Verify voice sounds the same (female voice)

### 3. Check Console Logs
Look for these log messages:
- `🔊 Calling Google TTS for Lawrence with voice: echo`
- `🔊 Calling OpenAI TTS for Laura with voice: nova`

### 4. Database Verification
- Check if provider column exists in tts_settings table
- Verify Lawrence has provider = 'google'
- Verify Laura has provider = 'openai'

## 🎯 Expected Results:
- Lawrence should use Google TTS with male voice
- Laura should use OpenAI TTS with female voice
- No errors in console
- Smooth audio playback for both therapists

## 🔧 If Issues:
1. Check Supabase edge function logs
2. Verify Google Cloud credentials
3. Check database schema
4. Test edge function directly 
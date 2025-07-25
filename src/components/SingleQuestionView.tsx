import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useTTSSettings } from '@/hooks/useTTSSettings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateSimilarity } from '@/components/chat/fuzzyMatching';
import { stopAllAudio, playGlobalTTS, stopGlobalAudio } from '@/utils/audioUtils';
import { getCelebrationMessage, calculateProgressLevel } from '@/utils/celebrationMessages';
import SoundFeedbackDisplay from './SoundFeedbackDisplay';
import { soundFeedbackManager } from '@/utils/soundFeedback';
import type { Database } from '@/integrations/supabase/types';
import AnimatedMicButton from './AnimatedMicButton';
import { Clock } from 'lucide-react';

type QuestionType = Database['public']['Enums']['question_type_enum'];

interface Question {
  id: string;
  question: string;
  answer: string;
  imageName?: string;
  questionType?: QuestionType;
}

interface SingleQuestionViewProps {
  question: Question;
  imageUrl?: string;
  questionNumber: number;
  totalQuestions: number;
  therapistName: string;
  childName: string;
  speechDelayMode: boolean;
  onCorrectAnswer: () => void;
  onNextQuestion: () => void;
  onComplete: () => void;
  retryCount: number;
  onRetryCountChange: (count: number) => void;
  onSpeechDelayModeChange: (enabled: boolean) => void;
  onAmplifyMicChange?: (enabled: boolean) => void;
  onMicGainChange?: (gain: number) => void;
  comingFromCelebration?: boolean;
  showMicInput?: boolean;
  amplifyMic?: boolean;
  micGain?: number;
}

// Custom Microphone Icon component
const MicrophoneIcon = ({ isRecording, size = 48 }: { isRecording?: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor"/>
    <path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SingleQuestionView = ({
  question,
  imageUrl,
  questionNumber,
  totalQuestions,
  therapistName,
  childName,
  speechDelayMode,
  onCorrectAnswer,
  onNextQuestion,
  onComplete,
  retryCount,
  onRetryCountChange,
  onSpeechDelayModeChange,
  onAmplifyMicChange,
  onMicGainChange,
  comingFromCelebration = false,
  showMicInput = false,
  amplifyMic,
  micGain
}: SingleQuestionViewProps) => {
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(true);
  const [currentResponse, setCurrentResponse] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [hasCalledCorrectAnswer, setHasCalledCorrectAnswer] = useState(false);
  const [shouldReadQuestion, setShouldReadQuestion] = useState(true);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasUserAttemptedAnswer, setHasUserAttemptedAnswer] = useState(false);
  const [hasReadQuestion, setHasReadQuestion] = useState(false);
  const [lastMicInput, setLastMicInput] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  
  const { ttsSettings, isLoaded: ttsSettingsLoaded, getVoiceForTherapist, callTTS } = useTTSSettings(therapistName);
  
  const { isRecording, isProcessing, setIsProcessing, startRecording, stopRecording, audioLevel, lastAudioBlob } = useAudioRecorder(amplifyMic ?? false, micGain ?? 1.0);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

  // Playback handler
  const handlePlayback = () => {
    if (lastAudioBlob) {
      const url = URL.createObjectURL(lastAudioBlob);
      if (audioPlaybackRef.current) {
        audioPlaybackRef.current.src = url;
        audioPlaybackRef.current.play();
        setIsPlayingBack(true);
        audioPlaybackRef.current.onended = () => {
          setIsPlayingBack(false);
          URL.revokeObjectURL(url);
        };
      }
    }
  };
  const { toast } = useToast();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);



  // Effect 2: Reset State (Single Responsibility)
  useEffect(() => {
    console.log(`🔄 SingleQuestionView reset for question:`, {
      id: question.id,
      question: question.question,
      answer: question.answer,
      imageName: question.imageName,
      comingFromCelebration,
      currentRetryCount: retryCount
    });
    
    // Reset all state
    setHasCalledCorrectAnswer(false);
    setIsProcessingAnswer(false);
    setShowFeedback(false);
    setCurrentResponse('');
    setIsWaitingForAnswer(true);
    setShouldReadQuestion(!comingFromCelebration);
    setIsUserInteracting(false);
    setHasUserAttemptedAnswer(false);
    setHasReadQuestion(false);
    setLastMicInput(''); // Reset mic input for new question
    setIsAnswerCorrect(null); // Reset answer correctness for new question
    
    // Reset retry count when question changes (but not when retry count changes)
    if (!comingFromCelebration) {
      console.log(`🔄 Question changed - resetting retry count to 0`);
      onRetryCountChange(0);
    }
  }, [question.id, comingFromCelebration, onRetryCountChange]);

  // Effect 3: Play TTS (Single Responsibility)
  useEffect(() => {
    if (!ttsSettingsLoaded || !shouldReadQuestion || isUserInteracting || hasReadQuestion) {
      return;
    }

    const readQuestion = async () => {
      try {
        console.log(`🔊 Reading question with ${therapistName}'s voice: ${ttsSettings.voice}`);
        setIsPlaying(true);
        
        // Stop any previous audio
        stopGlobalAudio();
        
        // Use the hook's helper function to get the correct voice
        const voiceToUse = getVoiceForTherapist();
        console.log(`🎯 Final question voice selection for ${therapistName}: ${voiceToUse} (original: ${ttsSettings.voice})`);
        
        const response = await callTTS(question.question, voiceToUse, ttsSettings.speed);

        if (response.data?.audioContent) {
          await playGlobalTTS(response.data.audioContent, 'SingleQuestionView');
          setHasReadQuestion(true);
        }
      } catch (error) {
        console.error('TTS error in question reading:', error);
        setHasReadQuestion(true);
      } finally {
        setIsPlaying(false);
      }
    };

    readQuestion();
  }, [ttsSettingsLoaded, shouldReadQuestion, isUserInteracting, hasReadQuestion, question.question, therapistName, ttsSettings]);

  // Effect 4: Auto-scroll (Single Responsibility)
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [question.id]);

  const handleVoiceRecording = async () => {
    if (isProcessingAnswer) return;
    
    if (isRecording) {
      setIsProcessing(true);
      setIsUserInteracting(true);
      try {
        // 1. After recording stops, before STT
        const recordingStopped = new Date();
        console.log('[DEBUG] Recording stopped at', recordingStopped.toISOString());
        const base64Audio = await stopRecording();
        // 2. Before STT call
        console.log('[DEBUG] Calling STT at', new Date().toISOString());
        const { data, error } = await supabase.functions.invoke('openai-stt', {
          body: { audio: base64Audio }
        });
        // 3. After STT returns
        console.log('[DEBUG] STT transcript received at', new Date().toISOString());
        if (error) {
          console.error('Speech-to-text error:', error);
          toast({
            title: "Voice Recognition Error",
            description: "Failed to process your voice. Please try again.",
            variant: "destructive",
          });
          return;
        }
        if (data?.text && data.text.trim()) {
          setLastMicInput(data.text.trim());
          // 4. Before answer evaluation
          console.log('[DEBUG] Starting answer evaluation at', new Date().toISOString());
          await processAnswer(data.text.trim());
        } else {
          toast({
            title: "No Speech Detected",
            description: "Please try speaking again.",
          });
        }
      } catch (error) {
        console.error('Error processing voice recording:', error);
        toast({
          title: "Recording Error",
          description: "Failed to process voice recording. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      startRecording();
    }
  };

  const processAnswer = async (userAnswer: string) => {
    // Prevent processing if no user answer
    if (!userAnswer || !userAnswer.trim()) {
      console.log(`⚠️ processAnswer called with empty user answer - ignoring`);
      return;
    }
    
    console.log(`🎯 Processing answer for question:`, {
      questionId: question.id,
      questionText: question.question,
      expectedAnswer: question.answer,
      userAnswer,
      similarity: calculateSimilarity(userAnswer, question.answer, {
        speechDelayMode,
        threshold: speechDelayMode ? 0.3 : 0.6
      })
    });
    
    if (isProcessingAnswer) return;
    setIsProcessingAnswer(true);
    setHasUserAttemptedAnswer(true);
    
    stopGlobalAudio();
    
    const similarity = calculateSimilarity(userAnswer, question.answer, {
      speechDelayMode,
      threshold: speechDelayMode ? 0.3 : 0.6
    });

    const acceptanceThreshold = speechDelayMode ? 0.3 : 0.7;
    const newRetryCount = retryCount + 1;
    
    console.log(`🎯 Answer processing details:`, {
      similarity,
      acceptanceThreshold,
      currentRetryCount: retryCount,
      newRetryCount,
      hasUserAttemptedAnswer,
      willSkip: newRetryCount >= 2 && hasUserAttemptedAnswer
    });

    if (similarity > acceptanceThreshold) {
      setIsAnswerCorrect(true);
      let ttsPlayed = false;
      let feedbackForScreen = '';
      // Generate and play sound feedback TTS (and show on screen)
      if (userAnswer && question.answer) {
        await soundFeedbackManager.initialize();
        const { targetSound, confidence } = soundFeedbackManager.detectTargetSound(userAnswer);
        console.log('[TTS DEBUG] Detected target sound:', targetSound, 'Confidence:', confidence);
        if (targetSound && confidence > 0.6) {
          console.log('[DEBUG] Generating sound feedback prompt at', new Date().toISOString());
          // Use the new prompt type for speech delay mode
          const feedbackType = speechDelayMode ? 'correct_speech_delay' : 'correct';
          const feedback = await soundFeedbackManager.generateSoundFeedback({
            target_sound: question.answer, // Always use the target answer for the instruction tip
            user_attempt: userAnswer,
            therapistName,
            childName,
            question: question.question,
            correct_answer: question.answer
          }, feedbackType);
          console.log('[DEBUG] Sound feedback prompt generated at', new Date().toISOString());
          console.log('[TTS DEBUG] Generated feedback:', feedback);
          if (feedback) {
            feedbackForScreen = feedback;
            setCurrentResponse(feedbackForScreen);
            setShowFeedback(true);
            try {
              const ttsStart = new Date();
              console.log('[TTS DEBUG] Starting TTS request at', ttsStart.toISOString());
              const { data, error } = await callTTS(feedback, ttsSettings.voice, ttsSettings.speed);
              const ttsEnd = new Date();
              console.log('[TTS DEBUG] TTS response at', ttsEnd.toISOString(), 'Duration (ms):', ttsEnd.getTime() - ttsStart.getTime());
              console.log('[TTS DEBUG] TTS response:', data, 'Error:', error);
              if (data?.audioContent) {
                ttsPlayed = true;
                const playStart = new Date();
                console.log('[TTS DEBUG] Playing audio at', playStart.toISOString());
                await playGlobalTTS(data.audioContent, 'SoundFeedback-Correct'); // Wait for TTS to finish
                const playEnd = new Date();
                console.log('[TTS DEBUG] Audio playback finished at', playEnd.toISOString(), 'Duration (ms):', playEnd.getTime() - playStart.getTime());
              } else {
                console.warn('[TTS DEBUG] No audioContent in TTS response');
              }
            } catch (e) { console.error('TTS error (sound feedback correct):', e); }
          } else {
            console.warn('[TTS DEBUG] No feedback generated');
            setCurrentResponse('Great work!');
            setShowFeedback(true);
          }
        } else {
          console.warn('[TTS DEBUG] No target sound detected or confidence too low');
          setCurrentResponse('Great work!');
          setShowFeedback(true);
        }
      }
      // Get personalized celebration message
      const progressLevel = calculateProgressLevel(questionNumber);
      const celebrationMessage = await getCelebrationMessage({
        messageType: 'question_feedback',
        therapistName,
        messageCategory: 'correct_answer',
        progressLevel,
        childName
      });
      setCurrentResponse(celebrationMessage);
      setShowFeedback(true);
      // Don't play TTS here - let MiniCelebration handle it
      console.log(`✅ Correct answer! Moving to celebration - TTS will be handled by MiniCelebration`);
      if (!hasCalledCorrectAnswer) {
        setHasCalledCorrectAnswer(true);
        // Only transition after TTS feedback is done
        onCorrectAnswer();
      }
      setTimeout(() => {
        setIsProcessingAnswer(false);
        setIsUserInteracting(false);
      }, 500);
      
    } else if (similarity <= acceptanceThreshold) {
      setIsAnswerCorrect(false);
      let feedbackForScreen = '';
      // Generate and play sound feedback TTS (and show on screen)
      if (userAnswer && question.answer) {
        await soundFeedbackManager.initialize();
        const { targetSound, confidence } = soundFeedbackManager.detectTargetSound(question.answer);
        if (targetSound && confidence > 0.6) {
          const feedback = await soundFeedbackManager.generateSoundFeedback({
            target_sound: targetSound.sound,
            user_attempt: userAnswer,
            therapistName,
            childName,
            question: question.question,
            correct_answer: question.answer
          }, 'incorrect');
          if (feedback) {
            feedbackForScreen = feedback;
            setCurrentResponse(feedbackForScreen);
            setShowFeedback(true);
            try {
              const { data, error } = await callTTS(feedback, ttsSettings.voice, ttsSettings.speed);
              if (data?.audioContent) {
                await playGlobalTTS(data.audioContent, 'SoundFeedback-Incorrect');
              }
            } catch (e) { console.error('TTS error (sound feedback incorrect):', e); }
          }
        }
      }
      // After feedback, proceed to retry or next logic
      const newRetryCount = retryCount + 1;
      onRetryCountChange(newRetryCount);
      
      // Check if we've reached the maximum attempts (1)
      if (newRetryCount >= 1) {
        console.log(`❌ Maximum attempts (1) reached for question: ${question.question}`);
        // Wait for TTS to finish, then move to next question
        const waitForTTSAndProceed = () => {
          setShowFeedback(false);
          setIsWaitingForAnswer(false);
          setIsProcessingAnswer(false);
          setIsUserInteracting(false);
          onNextQuestion();
        };
        
        // If TTS is playing, wait for it to finish; otherwise proceed immediately
        if (feedbackForScreen) {
          // Wait a bit for TTS to start, then check if it's still playing
          setTimeout(() => {
            // Check if audio is still playing (you might need to implement this check)
            // For now, we'll proceed after a short delay to allow TTS to finish
            setTimeout(waitForTTSAndProceed, 1000);
          }, 500);
        } else {
          // No TTS feedback, proceed immediately
          waitForTTSAndProceed();
        }
      } else {
        // Allow another attempt - wait for TTS to finish
        const waitForTTSAndRetry = () => {
          setShowFeedback(false);
          setIsWaitingForAnswer(true);
          setIsProcessingAnswer(false);
          setIsUserInteracting(false);
        };
        
        if (feedbackForScreen) {
          // Wait for TTS to finish before allowing retry
          setTimeout(() => {
            setTimeout(waitForTTSAndRetry, 1000);
          }, 500);
        } else {
          // No TTS feedback, allow retry immediately
          waitForTTSAndRetry();
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      {/* Header with therapist, progress, and speech delay toggle */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Avatar className="h-20 w-20 border-2 border-white shadow-sm">
            <AvatarImage src={`/lovable-uploads/${therapistName}.png`} alt={therapistName} />
            <AvatarFallback className="bg-blue-200 text-blue-800 font-semibold">
              {therapistName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-blue-900 text-2xl">{therapistName}</h3>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => onSpeechDelayModeChange(!speechDelayMode)}
            className={`flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-200 to-blue-200 text-blue-800 font-semibold border border-blue-200 shadow-sm hover:bg-blue-100 transition`}
            title={speechDelayMode ? 'Speech Delay: ON' : 'Speech Delay: OFF'}
            aria-label="Toggle Speech Delay Mode"
          >
            <Clock className="w-5 h-5" />
            <span>Speech Delay</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${speechDelayMode ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {speechDelayMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Mic Amplification Control */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const newAmplifyMic = !amplifyMic;
                if (onAmplifyMicChange) {
                  onAmplifyMicChange(newAmplifyMic);
                }
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-200 to-blue-200 text-blue-800 font-semibold border border-blue-200 shadow-sm hover:bg-blue-100 transition`}
              title={amplifyMic ? 'Mic Amplification: ON' : 'Mic Amplification: OFF'}
              aria-label="Toggle Mic Amplification"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span>Mic Boost</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${amplifyMic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {amplifyMic ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Mic Gain Slider - only show when amplification is on */}
            {amplifyMic && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-700">Gain:</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={micGain || 1}
                  onChange={(e) => {
                    const newGain = parseFloat(e.target.value);
                    if (onMicGainChange) {
                      onMicGainChange(newGain);
                    }
                  }}
                  className="w-20 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: 'linear-gradient(to right, #93c5fd 0%, #93c5fd 50%, #dbeafe 50%, #dbeafe 100%)'
                  }}
                  title={`Mic Gain: ${micGain || 1}x`}
                />
                <span className="text-xs font-medium text-blue-700 w-8">
                  {micGain || 1}x
                </span>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-xl font-bold text-purple-800">
              Question {questionNumber} of {totalQuestions}
            </p>
          </div>
        </div>
      </div>

      {/* Main Question Area */}
      <div ref={mainContentRef} className="flex-grow flex flex-col items-center justify-center max-w-7xl mx-auto w-full">
        {/* Question Text - Hidden from UI but TTS still reads it */}
        <div className="mb-8 animate-fade-in sr-only">
          <h2 className="text-4xl font-bold text-center text-blue-900 leading-relaxed">
            {question.question}
          </h2>
        </div>

        {/* Question Image */}
        {imageUrl && (
          <div className="mb-8 animate-scale-in flex justify-center">
            <div className="inline-block rounded-3xl shadow-2xl border-4 border-white overflow-hidden">
              <img
                src={imageUrl}
                alt="Question"
                className="w-auto h-[32rem] max-w-6xl object-contain"
                onError={(e) => {
                  console.error('Error loading question image:', imageUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Feedback Area */}
        {showFeedback && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-200 rounded-3xl p-6 max-w-2xl mx-auto mb-8 animate-fade-in">
            <p className="text-lg text-center text-green-800 font-medium">
              {currentResponse}
            </p>
          </div>
        )}

        {/* Simplified Mic Input Display */}
        {showMicInput && (
          <div className="mt-6 max-w-2xl mx-auto animate-fade-in mb-8">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <span className="text-sm font-semibold text-blue-600">Voice Input:</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-blue-300 shadow-sm">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {lastMicInput || (
                      <span className="text-gray-500 italic">Listening for your response...</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fixed Microphone Button */}
        {isWaitingForAnswer && !showFeedback && !isProcessingAnswer && (
          <div className="text-center animate-fade-in">
            <div className="flex flex-col items-center">
              <AnimatedMicButton
                isRecording={isRecording}
                onClick={handleVoiceRecording}
                audioLevel={audioLevel}
                label={isRecording ? 'Recording...' : ''}
              />

              {amplifyMic && lastAudioBlob && (
                <div className="mt-2">
                  <button
                    onClick={handlePlayback}
                    disabled={isPlayingBack}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold shadow hover:from-purple-600 hover:to-blue-600 transition-all"
                  >
                    {isPlayingBack ? 'Playing...' : 'Play Back Recording'}
                  </button>
                  <audio ref={audioPlaybackRef} hidden />
                </div>
              )}
            
            <div className="mt-4 text-center">
              {isRecording ? (
                <p className="text-blue-600 font-normal text-base mt-2">🔴 Recording... Tap again to stop</p>
              ) : isProcessing ? (
                <p className="text-blue-600 font-normal text-base mt-2">🔄 Processing your voice...</p>
              ) : isPlaying ? (
                <p className="text-blue-600 font-normal text-base mt-2">🎵 Playing...</p>
              ) : null}
              {/* Tap to answer styled and positioned below mic button */}
              {!(isRecording || isProcessing || isPlaying) && (
                <p className="text-blue-400 italic text-base mt-2">Tap to answer</p>
              )}
              {retryCount > 0 && (
                <p className="text-sm text-purple-600 mt-2">
                  Attempt {retryCount + 1} of 2
                </p>
              )}
            </div>
            </div>
          </div>
        )}

        {/* Processing State - Show when processing answer but no feedback yet */}
        {isProcessingAnswer && !showFeedback && (
          <div className="text-center animate-fade-in">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-200 to-blue-200 flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-blue-600 font-normal text-lg">🔄 Processing your answer...</p>
              {lastMicInput && (
                <p className="text-gray-600 text-sm mt-2 italic">
                  "I heard: {lastMicInput}"
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Floating Action Button for Speech Delay Toggle
const SpeechDelayFAB = ({ speechDelayMode, onToggle }: { speechDelayMode: boolean; onToggle: () => void }) => (
  <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center">
    <button
      onClick={onToggle}
      className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-200
        bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white
        hover:scale-105 active:scale-95 focus:outline-none`}
      title={speechDelayMode ? 'Speech Delay: ON' : 'Speech Delay: OFF'}
      aria-label="Toggle Speech Delay Mode"
    >
      <Clock className="w-8 h-8" />
    </button>
    <span className="mt-2 text-xs font-medium text-blue-700 bg-white/80 px-2 py-1 rounded shadow">
      Speech Delay
    </span>
  </div>
);

export default SingleQuestionView;

import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useTTSSettings } from '@/hooks/useTTSSettings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateSimilarity } from '@/components/chat/fuzzyMatching';
import { stopAllAudio, playGlobalTTS, stopGlobalAudio } from '@/utils/audioUtils';
import type { Database } from '@/integrations/supabase/types';

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
  comingFromCelebration?: boolean;
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
  comingFromCelebration = false
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
  
  const { ttsSettings, isLoaded: ttsSettingsLoaded, getVoiceForTherapist, callTTS } = useTTSSettings(therapistName);
  
  const { isRecording, isProcessing, setIsProcessing, startRecording, stopRecording } = useAudioRecorder();
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
        const base64Audio = await stopRecording();
        
        const { data, error } = await supabase.functions.invoke('openai-stt', {
          body: { audio: base64Audio }
        });

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
      // Set user interacting immediately when they start recording
      setIsUserInteracting(true);
      console.log('🎤 User started recording - stopping any question TTS and setting interaction flag');
      // Stop any currently playing question TTS immediately
      stopGlobalAudio();
      try {
        await startRecording();
      } catch (error) {
        console.error('Error starting recording:', error);
        toast({
          title: "Microphone Error",
          description: "Failed to access microphone. Please check permissions.",
          variant: "destructive",
        });
        // Reset the flag if recording fails
        setIsUserInteracting(false);
      }
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
      setCurrentResponse(`Amazing work, ${childName}! That's exactly right! The answer is "${question.answer}" 🎉`);
      setShowFeedback(true);
      
      // Don't play TTS here - let MiniCelebration handle it
      console.log(`✅ Correct answer! Moving to celebration - TTS will be handled by MiniCelebration`);
      
      if (!hasCalledCorrectAnswer) {
        setHasCalledCorrectAnswer(true);
        console.log('🎉 Calling onCorrectAnswer for question:', questionNumber);
        onCorrectAnswer();
      }
      
      setTimeout(() => {
        setIsProcessingAnswer(false);
        setIsUserInteracting(false);
      }, 500);
      
    } else if (newRetryCount >= 2 && hasUserAttemptedAnswer && userAnswer.trim()) {
      // Only skip to next question if user has actually attempted to answer multiple times
      console.log(`🔄 Max retries reached (${newRetryCount}) with user answer: "${userAnswer}" and hasUserAttemptedAnswer: ${hasUserAttemptedAnswer} - moving to next question`);
      console.log(`📊 Retry details: currentRetryCount=${retryCount}, newRetryCount=${newRetryCount}, threshold=2`);
      onRetryCountChange(newRetryCount);
      setCurrentResponse(`Good try, ${childName}! The correct answer is "${question.answer}". We'll practice that more later! 🌟`);
      setShowFeedback(true);
      
      try {
        console.log(`🔊 Playing final feedback with ${therapistName}'s voice: ${ttsSettings.voice}`);
        stopGlobalAudio(); // Stop any previous audio
        
        const { data, error } = await callTTS(`Good try, ${childName}! The correct answer is "${question.answer}". We'll practice that more later!`, ttsSettings.voice, ttsSettings.speed);

        if (data?.audioContent) {
          await playGlobalTTS(data.audioContent, 'SingleQuestionView-Final');
        }
      } catch (error) {
        console.error('TTS error:', error);
      }

      setTimeout(() => {
        if (questionNumber < totalQuestions) {
          onNextQuestion();
        } else {
          onComplete();
        }
        setIsProcessingAnswer(false);
        setIsUserInteracting(false);
      }, 1000);
      
    } else {
      console.log(`🔄 Retry attempt ${newRetryCount} - giving another chance`);
      console.log(`📊 Retry details: currentRetryCount=${retryCount}, newRetryCount=${newRetryCount}, threshold=2, willSkip=${newRetryCount >= 2}`);
      onRetryCountChange(newRetryCount);
      setCurrentResponse(`Good try! The correct answer is "${question.answer}". Look at the picture carefully and try again! 🤔`);
      setShowFeedback(true);
      
      try {
        console.log(`🔊 Playing retry feedback with ${therapistName}'s voice: ${ttsSettings.voice}`);
        stopGlobalAudio(); // Stop any previous audio
        
        const { data, error } = await callTTS(`Good try! The correct answer is "${question.answer}". Look carefully and try again!`, ttsSettings.voice, ttsSettings.speed);

        if (data?.audioContent) {
          await playGlobalTTS(data.audioContent, 'SingleQuestionView-Retry');
        }
      } catch (error) {
        console.error('TTS error:', error);
      }

      setTimeout(() => {
        setShowFeedback(false);
        setIsWaitingForAnswer(true);
        setIsProcessingAnswer(false);
        setIsUserInteracting(false);
      }, 2000);
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
          <Button
            variant="outline"
            size="lg"
            onClick={() => onSpeechDelayModeChange(!speechDelayMode)}
            className={`border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 shadow-sm px-6 py-3 text-lg font-semibold transition-all ${
              speechDelayMode ? "bg-purple-200 border-purple-400 text-purple-800" : "bg-white"
            }`}
          >
            Speech Delay Mode: {speechDelayMode ? "ON" : "OFF"}
          </Button>
          
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

        {/* Fixed Microphone Button */}
        {isWaitingForAnswer && !showFeedback && !isProcessingAnswer && (
          <div className="text-center animate-fade-in">
            <div className="flex flex-col items-center">
              <button
              onClick={handleVoiceRecording}
              disabled={isProcessing || isPlaying || isProcessingAnswer}
                className={`w-32 h-32 rounded-full border-4 shadow-xl transition-all duration-300 flex items-center justify-center ${
                  isRecording 
                    ? 'bg-red-300 border-red-200 text-white transform scale-105' 
                    : 'bg-slate-200 hover:bg-slate-300 border-slate-100 text-slate-600 hover:scale-105'
                } ${(isProcessing || isPlaying || isProcessingAnswer) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <MicrophoneIcon isRecording={isRecording} size={64} />
              </button>
            
            <div className="mt-4 text-center">
              <p className="text-blue-600 font-semibold text-lg">
                {isRecording ? "🔴 Recording... Tap again to stop" : 
                 isProcessing ? "🔄 Processing your voice..." :
                 isPlaying ? "🎵 Playing..." :
                 "Tap to answer"}
              </p>
              {retryCount > 0 && (
                <p className="text-sm text-purple-600 mt-2">
                  Attempt {retryCount + 1} of 2
                </p>
              )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleQuestionView;

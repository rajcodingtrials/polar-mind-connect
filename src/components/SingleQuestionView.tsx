
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateSimilarity } from '@/components/chat/fuzzyMatching';
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
  
  const { isRecording, isProcessing, setIsProcessing, startRecording, stopRecording } = useAudioRecorder();
  const { playAudio, isPlaying, stopAudio } = useAudioPlayer();
  const { toast } = useToast();

  useEffect(() => {
    setHasCalledCorrectAnswer(false);
    setIsProcessingAnswer(false);
    setShowFeedback(false);
    setCurrentResponse('');
    setIsWaitingForAnswer(true);
    setShouldReadQuestion(!comingFromCelebration);
  }, [question.id, comingFromCelebration]);

  useEffect(() => {
    const readQuestion = async () => {
      console.log('🔊 Question reading check:', { shouldReadQuestion, comingFromCelebration });
      if (!shouldReadQuestion) {
        console.log('🔇 Skipping question reading - coming from celebration');
        return;
      }
      
      try {
        stopAudio();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const response = await supabase.functions.invoke('openai-tts', {
          body: {
            text: question.question,
            voice: 'nova',
            speed: 1.0
          }
        });

        if (response.data?.audioContent) {
          await playAudio(response.data.audioContent);
        }
      } catch (error) {
        console.error('Error reading question:', error);
      }
    };

    setTimeout(readQuestion, 1000);
  }, [question.question, playAudio, stopAudio, shouldReadQuestion]);

  const handleVoiceRecording = async () => {
    if (isProcessingAnswer) return;
    
    if (isRecording) {
      setIsProcessing(true);
      
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
      try {
        await startRecording();
      } catch (error) {
        console.error('Error starting recording:', error);
        toast({
          title: "Microphone Error",
          description: "Failed to access microphone. Please check permissions.",
          variant: "destructive",
        });
      }
    }
  };

  const processAnswer = async (userAnswer: string) => {
    if (isProcessingAnswer) return;
    setIsProcessingAnswer(true);
    
    stopAudio();
    
    const similarity = calculateSimilarity(userAnswer, question.answer, {
      speechDelayMode,
      threshold: speechDelayMode ? 0.3 : 0.6
    });

    const acceptanceThreshold = speechDelayMode ? 0.3 : 0.7;
    const newRetryCount = retryCount + 1;

    if (similarity > acceptanceThreshold) {
      setCurrentResponse(`Amazing work, ${childName}! That's exactly right! The answer is "${question.answer}" 🎉`);
      setShowFeedback(true);
      
      if (!hasCalledCorrectAnswer) {
        setHasCalledCorrectAnswer(true);
        console.log('🎉 Calling onCorrectAnswer for question:', questionNumber);
        onCorrectAnswer();
      }
      
      setTimeout(() => {
        setIsProcessingAnswer(false);
      }, 500);
      
    } else if (newRetryCount >= 2) {
      onRetryCountChange(newRetryCount);
      setCurrentResponse(`Good try, ${childName}! The correct answer is "${question.answer}". We'll practice that more later! 🌟`);
      setShowFeedback(true);
      
      try {
        const response = await supabase.functions.invoke('openai-tts', {
          body: {
            text: `Good try! The correct answer is "${question.answer}". We'll practice that more later!`,
            voice: 'nova',
            speed: 1.0
          }
        });

        if (response.data?.audioContent) {
          await playAudio(response.data.audioContent);
          await new Promise(resolve => {
            const checkAudioFinished = () => {
              if (!isPlaying) {
                resolve(undefined);
              } else {
                setTimeout(checkAudioFinished, 100);
              }
            };
            setTimeout(checkAudioFinished, 1000);
          });
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
      }, 1000);
      
    } else {
      onRetryCountChange(newRetryCount);
      setCurrentResponse(`Good try! The correct answer is "${question.answer}". Look at the picture carefully and try again! 🤔`);
      setShowFeedback(true);
      
      try {
        const response = await supabase.functions.invoke('openai-tts', {
          body: {
            text: `Good try! The correct answer is "${question.answer}". Look carefully and try again!`,
            voice: 'nova',
            speed: 1.0
          }
        });

        if (response.data?.audioContent) {
          await playAudio(response.data.audioContent);
          await new Promise(resolve => {
            const checkAudioFinished = () => {
              if (!isPlaying) {
                resolve(undefined);
              } else {
                setTimeout(checkAudioFinished, 100);
              }
            };
            setTimeout(checkAudioFinished, 1000);
          });
        }
      } catch (error) {
        console.error('TTS error:', error);
      }

      setTimeout(() => {
        setShowFeedback(false);
        setIsWaitingForAnswer(true);
        setIsProcessingAnswer(false);
      }, 2000);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header with therapist, progress, and speech delay toggle */}
      <div className="flex items-center justify-between p-4 bg-white/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
            <AvatarImage src="/lovable-uploads/Laura.png" alt={therapistName} />
            <AvatarFallback className="bg-blue-200 text-blue-800 font-semibold">
              {therapistName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-blue-900 text-xl">{therapistName}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSpeechDelayModeChange(!speechDelayMode)}
            className={`border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 shadow-sm px-4 py-2 font-semibold transition-all ${
              speechDelayMode ? "bg-purple-200 border-purple-400 text-purple-800" : "bg-white"
            }`}
          >
            Speech Delay Mode: {speechDelayMode ? "ON" : "OFF"}
          </Button>
          
          <div className="text-center">
            <p className="text-lg font-bold text-purple-800">
              Question {questionNumber} of {totalQuestions}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 space-y-6">
        {/* Question Text */}
        <div className="text-center animate-fade-in">
          <h2 className="text-3xl font-bold text-blue-900 leading-relaxed max-w-4xl">
            {question.question}
          </h2>
        </div>

        {/* Question Image - Centered and optimized size */}
        {imageUrl && (
          <div className="animate-scale-in flex justify-center">
            <div className="inline-block rounded-2xl shadow-xl border-3 border-white overflow-hidden">
              <img
                src={imageUrl}
                alt="Question"
                className="w-auto h-64 max-w-2xl object-contain"
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
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-3 border-green-200 rounded-2xl p-4 max-w-xl mx-auto animate-fade-in">
            <p className="text-base text-center text-green-800 font-medium">
              {currentResponse}
            </p>
          </div>
        )}

        {/* Microphone Button - Centered */}
        {isWaitingForAnswer && !showFeedback && !isProcessingAnswer && (
          <div className="text-center animate-fade-in">
            <div className="flex flex-col items-center space-y-3">
              <button
                onClick={handleVoiceRecording}
                disabled={isProcessing || isPlaying || isProcessingAnswer}
                className={`w-24 h-24 rounded-full border-3 shadow-lg transition-all duration-300 flex items-center justify-center ${
                  isRecording 
                    ? 'bg-red-300 border-red-200 text-white transform scale-105' 
                    : 'bg-slate-200 hover:bg-slate-300 border-slate-100 text-slate-600 hover:scale-105'
                } ${(isProcessing || isPlaying || isProcessingAnswer) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <MicrophoneIcon isRecording={isRecording} size={48} />
              </button>
              
              <div className="text-center">
                <p className="text-blue-600 font-semibold text-base">
                  {isRecording ? "🔴 Recording... Tap again to stop" : 
                   isProcessing ? "🔄 Processing your voice..." :
                   isPlaying ? "🎵 Playing..." :
                   "Tap to answer"}
                </p>
                {retryCount > 0 && (
                  <p className="text-sm text-purple-600 mt-1">
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

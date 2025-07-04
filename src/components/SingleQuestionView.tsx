import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
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

  // Reset flags when question changes
  useEffect(() => {
    setHasCalledCorrectAnswer(false);
    setIsProcessingAnswer(false);
    setShowFeedback(false);
    setCurrentResponse('');
    setIsWaitingForAnswer(true);
    setShouldReadQuestion(!comingFromCelebration);
  }, [question.id, comingFromCelebration]);

  // Auto-read question when component loads
  useEffect(() => {
    const readQuestion = async () => {
      console.log('🔊 Question reading check:', { shouldReadQuestion, comingFromCelebration });
      // Only read question if flag is set to true
      if (!shouldReadQuestion) {
        console.log('🔇 Skipping question reading - coming from celebration');
        return;
      }
      
      try {
        // Stop any currently playing audio first
        stopAudio();
        
        // Add a longer delay to ensure any celebration TTS has finished
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

    // Increased delay to prevent overlap with celebration TTS
    setTimeout(readQuestion, 1000);
  }, [question.question, playAudio, stopAudio, shouldReadQuestion]);

  const handleVoiceRecording = async () => {
    if (isProcessingAnswer) return; // Prevent multiple submissions
    
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
    if (isProcessingAnswer) return; // Prevent double processing
    setIsProcessingAnswer(true);
    
    // Stop any currently playing audio
    stopAudio();
    
    const similarity = calculateSimilarity(userAnswer, question.answer, {
      speechDelayMode,
      threshold: speechDelayMode ? 0.3 : 0.6
    });

    const acceptanceThreshold = speechDelayMode ? 0.3 : 0.7;
    const newRetryCount = retryCount + 1;

    if (similarity > acceptanceThreshold) {
      // Correct answer - show feedback and move to celebration
      setCurrentResponse(`Amazing work, ${childName}! That's exactly right! The answer is "${question.answer}" 🎉`);
      setShowFeedback(true);
      
      // Prevent multiple calls to onCorrectAnswer
      if (!hasCalledCorrectAnswer) {
        setHasCalledCorrectAnswer(true);
        console.log('🎉 Calling onCorrectAnswer for question:', questionNumber);
        onCorrectAnswer();
      }
      
      // Reset processing state after a short delay
      setTimeout(() => {
        setIsProcessingAnswer(false);
      }, 500);
      
    } else if (newRetryCount >= 2) {
      // After 2 attempts, move to next question
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
          // Wait for audio to finish
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

      // After 2 failed attempts, move to next question directly
      setTimeout(() => {
        if (questionNumber < totalQuestions) {
          onNextQuestion();
        } else {
          onComplete();
        }
        setIsProcessingAnswer(false);
      }, 1000);
      
    } else {
      // First attempt - encourage to try again
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
          // Wait for audio to finish
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

      // Reset for another attempt
      setTimeout(() => {
        setShowFeedback(false);
        setIsWaitingForAnswer(true);
        setIsProcessingAnswer(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      {/* Header with therapist, progress, and speech delay toggle */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Avatar className="h-20 w-20 border-2 border-white shadow-sm">
            <AvatarImage src="/lovable-uploads/Laura.png" alt={therapistName} />
            <AvatarFallback className="bg-blue-200 text-blue-800 font-semibold">
              {therapistName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-blue-900 text-2xl">{therapistName}</h3>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-xl font-bold text-purple-800">
              Question {questionNumber} of {totalQuestions}
            </p>
          </div>
          
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
        </div>
      </div>

      {/* Main Question Area */}
      <div className="flex-grow flex flex-col items-center justify-center max-w-7xl mx-auto w-full">
        {/* Question Text */}
        <div className="mb-8 animate-fade-in">
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
                className="w-96 h-72 object-cover"
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

        {/* Voice Input Button - Fixed positioning and styling */}
        {isWaitingForAnswer && !showFeedback && !isProcessingAnswer && (
          <div className="flex flex-col items-center animate-fade-in mb-8">
            <div className="flex items-center gap-6">
              <Button
                size="lg"
                onClick={handleVoiceRecording}
                disabled={isProcessing || isPlaying || isProcessingAnswer}
                className={`w-40 h-40 rounded-full border-4 shadow-xl transform hover:scale-105 transition-all duration-300 ${
                  isRecording 
                    ? "bg-red-500 hover:bg-red-600 border-red-400 text-white" 
                    : "bg-green-500 hover:bg-green-600 border-green-400 text-white"
                }`}
              >
                {isRecording ? <MicOff className="h-24 w-24" /> : <Mic className="h-24 w-24" />}
              </Button>
              
              <div className="text-left">
                <p className="text-2xl font-bold text-blue-700 mb-2">
                  Tap to record
                </p>
                <p className="text-lg text-blue-600 font-semibold">
                  {isRecording ? "🔴 Recording... Tap again to stop" : 
                   isProcessing ? "🔄 Processing your voice..." :
                   isPlaying ? "🎵 Playing..." :
                   "Press and speak your answer"}
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

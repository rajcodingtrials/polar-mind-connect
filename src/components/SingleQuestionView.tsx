
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
  onSpeechDelayModeChange
}: SingleQuestionViewProps) => {
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(true);
  const [currentResponse, setCurrentResponse] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  
  const { isRecording, isProcessing, setIsProcessing, startRecording, stopRecording } = useAudioRecorder();
  const { playAudio, isPlaying } = useAudioPlayer();
  const { toast } = useToast();

  // Auto-read question when component loads
  useEffect(() => {
    const readQuestion = async () => {
      try {
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

    setTimeout(readQuestion, 500);
  }, [question.question, playAudio]);

  const handleVoiceRecording = async () => {
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
    const similarity = calculateSimilarity(userAnswer, question.answer, {
      speechDelayMode,
      threshold: speechDelayMode ? 0.3 : 0.6
    });

    const acceptanceThreshold = speechDelayMode ? 0.3 : 0.7;
    const newRetryCount = retryCount + 1;

    if (similarity > acceptanceThreshold) {
      // Correct answer
      setCurrentResponse(`Amazing work, ${childName}! That's exactly right! The answer is "${question.answer}" 🎉`);
      setShowFeedback(true);
      onCorrectAnswer();
      
      // Play success TTS
      try {
        const response = await supabase.functions.invoke('openai-tts', {
          body: {
            text: `Amazing work, ${childName}! That's exactly right!`,
            voice: 'nova',
            speed: 1.0
          }
        });

        if (response.data?.audioContent) {
          await playAudio(response.data.audioContent);
        }
      } catch (error) {
        console.error('TTS error:', error);
      }

      // Continue to next question or complete
      setTimeout(() => {
        if (questionNumber < totalQuestions) {
          onNextQuestion();
        } else {
          onComplete();
        }
      }, 3000);
      
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
      }, 4000);
      
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
        }
      } catch (error) {
        console.error('TTS error:', error);
      }

      // Reset for another attempt
      setTimeout(() => {
        setShowFeedback(false);
        setIsWaitingForAnswer(true);
      }, 4000);
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
            className={`border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 shadow-sm px-6 py-3 text-lg font-semibold ${
              speechDelayMode ? "bg-purple-100 border-purple-300" : ""
            }`}
          >
            Speech Delay Mode
          </Button>
        </div>
      </div>

      {/* Main Question Area */}
      <div className="flex-grow flex flex-col items-center justify-center max-w-7xl mx-auto w-full">
        {/* Question Text - No white block background */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl font-bold text-center text-blue-900 leading-relaxed">
            {question.question}
          </h2>
        </div>

        {/* Question Image - Much wider and larger */}
        {imageUrl && (
          <div className="mb-8 animate-scale-in w-full max-w-5xl">
            <img
              src={imageUrl}
              alt="Question"
              className="w-full max-h-96 object-contain rounded-3xl shadow-2xl border-4 border-white"
              onError={(e) => {
                console.error('Error loading question image:', imageUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
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

        {/* Voice Input Button - Bigger microphone */}
        {isWaitingForAnswer && !showFeedback && (
          <div className="text-center animate-fade-in">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "outline"}
              onClick={handleVoiceRecording}
              disabled={isProcessing || isPlaying}
              className="w-28 h-28 rounded-full border-4 border-blue-300 hover:border-blue-400 shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              {isRecording ? <MicOff className="h-14 w-14" /> : <Mic className="h-14 w-14" />}
            </Button>
            
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
        )}
      </div>
    </div>
  );
};

export default SingleQuestionView;

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useTherapistTTS } from '@/hooks/useTherapistTTS';
import VoiceRecorder from './chat/VoiceRecorder';
import { fuzzyMatch } from './chat/fuzzyMatching';
import { phoneticMatch } from './chat/phoneticMatching';

interface Question {
  id: string;
  question: string;
  answer: string;
  imageName?: string;
  questionType?: string;
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
  const [userResponse, setUserResponse] = useState('');
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | 'close' | null; message: string }>({ type: null, message: '' });
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);
  const [hasPlayedInitialTTS, setHasPlayedInitialTTS] = useState(false);
  const { playAudio, isPlaying } = useAudioPlayer();
  const { settings: ttsSettings, loading: ttsLoading } = useTherapistTTS(therapistName);
  const questionPlayedRef = useRef(false);
  const comingFromCelebrationRef = useRef(comingFromCelebration);

  // Update the ref when the prop changes
  useEffect(() => {
    comingFromCelebrationRef.current = comingFromCelebration;
  }, [comingFromCelebration]);

  // Reset states when question changes, but handle celebration flow
  useEffect(() => {
    if (!comingFromCelebrationRef.current) {
      console.log('🔄 New question loaded, resetting states');
      setUserResponse('');
      setFeedback({ type: null, message: '' });
      setIsCheckingAnswer(false);
      setHasPlayedInitialTTS(false);
      questionPlayedRef.current = false;
    } else {
      console.log('🎊 Coming from celebration, keeping existing states');
      // Reset the flag after handling
      comingFromCelebrationRef.current = false;
    }
  }, [question.id]);

  // Play question TTS when component mounts or question changes
  useEffect(() => {
    if (!ttsLoading && !questionPlayedRef.current && !hasPlayedInitialTTS) {
      playQuestionTTS();
    }
  }, [question.id, ttsLoading, hasPlayedInitialTTS]);

  const playQuestionTTS = async () => {
    if (ttsLoading || questionPlayedRef.current) return;
    
    try {
      console.log(`🎤 Playing question TTS with ${therapistName}'s voice (${ttsSettings.voice})`);
      setIsPlayingQuestion(true);
      questionPlayedRef.current = true;
      setHasPlayedInitialTTS(true);

      const questionText = `Here's your question, ${childName}: ${question.question}`;

      const response = await supabase.functions.invoke('openai-tts', {
        body: {
          text: questionText,
          voice: ttsSettings.voice,
          speed: ttsSettings.speed
        }
      });

      if (response.data?.audioContent) {
        await playAudio(response.data.audioContent);
      }
    } catch (error) {
      console.error('Error playing question TTS:', error);
    } finally {
      setIsPlayingQuestion(false);
    }
  };

  const playFeedbackTTS = async (text: string) => {
    if (ttsLoading) return;
    
    try {
      console.log(`🎤 Playing feedback TTS with ${therapistName}'s voice (${ttsSettings.voice}):`, text);
      
      const response = await supabase.functions.invoke('openai-tts', {
        body: {
          text: text,
          voice: ttsSettings.voice,
          speed: ttsSettings.speed
        }
      });

      if (response.data?.audioContent) {
        await playAudio(response.data.audioContent);
      }
    } catch (error) {
      console.error('Error playing feedback TTS:', error);
    }
  };

  const handleCheckAnswer = async () => {
    if (!userResponse.trim()) return;
    
    setIsCheckingAnswer(true);
    console.log('🔍 Checking answer:', userResponse, 'against:', question.answer);
    
    try {
      // Check for exact match (case insensitive)
      const userResponseLower = userResponse.toLowerCase().trim();
      const correctAnswerLower = question.answer.toLowerCase().trim();
      
      if (userResponseLower === correctAnswerLower) {
        setFeedback({ type: 'correct', message: 'Perfect! That\'s exactly right!' });
        await playFeedbackTTS(`Perfect, ${childName}! That's exactly right!`);
        setTimeout(() => {
          onCorrectAnswer();
        }, 2000);
        return;
      }
      
      // Check for fuzzy match
      const fuzzyScore = fuzzyMatch(userResponseLower, correctAnswerLower);
      const phoneticScore = phoneticMatch(userResponseLower, correctAnswerLower);
      const bestScore = Math.max(fuzzyScore, phoneticScore);
      
      console.log('🎯 Matching scores:', { fuzzy: fuzzyScore, phonetic: phoneticScore, best: bestScore });
      
      if (bestScore >= 0.8) {
        // Very close match - accept as correct
        setFeedback({ type: 'correct', message: 'Great job! That\'s right!' });
        await playFeedbackTTS(`Great job, ${childName}! That's right!`);
        setTimeout(() => {
          onCorrectAnswer();
        }, 2000);
      } else if (bestScore >= 0.6) {
        // Close but not quite right
        const newRetryCount = retryCount + 1;
        onRetryCountChange(newRetryCount);
        
        if (newRetryCount >= 3) {
          // Enable speech delay mode and give the answer
          onSpeechDelayModeChange(true);
          setFeedback({ 
            type: 'close', 
            message: `Close try! The answer is "${question.answer}". Let's practice saying it together slowly.` 
          });
          await playFeedbackTTS(`Close try, ${childName}! The answer is "${question.answer}". Let's practice saying it together slowly.`);
        } else {
          setFeedback({ 
            type: 'close', 
            message: `Close! Try again. Think about "${question.answer}".` 
          });
          await playFeedbackTTS(`Close, ${childName}! Try again. Think about "${question.answer}".`);
        }
      } else {
        // Not close - give hint
        const newRetryCount = retryCount + 1;
        onRetryCountChange(newRetryCount);
        
        if (newRetryCount >= 3) {
          // Give the answer after 3 attempts
          onSpeechDelayModeChange(true);
          setFeedback({ 
            type: 'incorrect', 
            message: `The answer is "${question.answer}". Let's practice saying it together.` 
          });
          await playFeedbackTTS(`The answer is "${question.answer}", ${childName}. Let's practice saying it together.`);
        } else {
          setFeedback({ 
            type: 'incorrect', 
            message: `Not quite right. The answer starts with "${question.answer.charAt(0)}". Try again!` 
          });
          await playFeedbackTTS(`Not quite right, ${childName}. The answer starts with "${question.answer.charAt(0)}". Try again!`);
        }
      }
    } catch (error) {
      console.error('Error checking answer:', error);
      setFeedback({ type: 'incorrect', message: 'Sorry, there was an error. Please try again.' });
    } finally {
      setIsCheckingAnswer(false);
    }
  };

  const handleVoiceResult = (transcript: string) => {
    console.log('🎤 Voice result received:', transcript);
    setUserResponse(transcript);
  };

  const progress = ((questionNumber - 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6">
      <div className="w-full max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-purple-700">Question {questionNumber} of {totalQuestions}</span>
            <span className="text-sm font-medium text-purple-700">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full h-3 bg-purple-200" />
        </div>

        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-2 border-purple-200">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-purple-800 mb-2">
              {therapistName} asks:
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Question Image */}
            {imageUrl && (
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img 
                    src={imageUrl}
                    alt="Question image"
                    className="max-w-md max-h-64 object-contain rounded-lg shadow-lg border-4 border-purple-200"
                    onError={(e) => {
                      console.error('Error loading question image:', imageUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Question Text */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200 text-center">
              <p className="text-2xl font-bold text-purple-800 mb-4">
                {question.question}
              </p>
              
              <Button
                onClick={playQuestionTTS}
                disabled={isPlayingQuestion || isPlaying || ttsLoading}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                {isPlayingQuestion || isPlaying ? `🎵 ${therapistName} is speaking...` : `🎤 Hear ${therapistName} again`}
              </Button>
            </div>

            {/* Speech Delay Mode Instructions */}
            {speechDelayMode && (
              <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl">
                <p className="text-lg font-semibold text-yellow-800 text-center mb-2">
                  🗣️ Let's practice saying it slowly together:
                </p>
                <p className="text-2xl font-bold text-yellow-900 text-center">
                  "{question.answer}"
                </p>
                <p className="text-sm text-yellow-700 text-center mt-2">
                  Take your time and repeat after {therapistName}!
                </p>
              </div>
            )}

            {/* Voice Recorder */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200">
              <VoiceRecorder 
                onResult={handleVoiceResult}
                className="w-full"
              />
              
              {userResponse && (
                <div className="mt-4 p-4 bg-white rounded-xl border border-blue-200">
                  <p className="text-lg font-semibold text-blue-800 mb-2">You said:</p>
                  <p className="text-xl text-blue-900 font-bold">"{userResponse}"</p>
                </div>
              )}
            </div>

            {/* Feedback */}
            {feedback.type && (
              <div className={`p-4 rounded-xl border-2 text-center ${
                feedback.type === 'correct' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : feedback.type === 'close'
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <p className="text-lg font-bold">
                  {feedback.message}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={handleCheckAnswer}
                disabled={!userResponse.trim() || isCheckingAnswer || isPlaying}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                {isCheckingAnswer ? 'Checking...' : '✅ Check My Answer'}
              </Button>
              
              {speechDelayMode && (
                <Button
                  onClick={onCorrectAnswer}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  🎉 I practiced! Next question
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SingleQuestionView;

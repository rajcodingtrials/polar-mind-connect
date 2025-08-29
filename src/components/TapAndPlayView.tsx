import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTTSSettings } from '@/hooks/useTTSSettings';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { stopAllAudio, playGlobalTTS, stopGlobalAudio } from '@/utils/audioUtils';
import { getCelebrationMessage, calculateProgressLevel } from '@/utils/celebrationMessages';
import { soundFeedbackManager } from '@/utils/soundFeedback';
import type { Database } from '@/integrations/supabase/types';
import { Clock } from 'lucide-react';

type QuestionType = Database['public']['Enums']['question_type_enum'];

interface Question {
  id: string;
  question: string;
  answer: string;
  images?: string[]; // Array of image names for tap_and_play
  correctImageIndex?: number; // Index of the correct image (0-based)
  questionType?: QuestionType;
}

interface TapAndPlayViewProps {
  question: Question;
  imageUrls?: { [key: string]: string };
  questionNumber: number;
  totalQuestions: number;
  therapistName: string;
  childName: string;
  onCorrectAnswer: () => void;
  onNextQuestion: () => void;
  onComplete: () => void;
  retryCount: number;
  onRetryCountChange: (count: number) => void;
  comingFromCelebration?: boolean;
}

const TapAndPlayView = ({
  question,
  imageUrls = {},
  questionNumber,
  totalQuestions,
  therapistName,
  childName,
  onCorrectAnswer,
  onNextQuestion,
  onComplete,
  retryCount,
  onRetryCountChange,
  comingFromCelebration = false,
}: TapAndPlayViewProps) => {
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(true);
  const [currentResponse, setCurrentResponse] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [hasCalledCorrectAnswer, setHasCalledCorrectAnswer] = useState(false);
  const [shouldReadQuestion, setShouldReadQuestion] = useState(true);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasReadQuestion, setHasReadQuestion] = useState(false);
  
  const { ttsSettings, isLoaded: ttsSettingsLoaded, getVoiceForTherapist, callTTS } = useTTSSettings(therapistName);
  const { preferences } = useUserPreferences();
  const { toast } = useToast();
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Reset state when question changes
  useEffect(() => {
    console.log(`🔄 TapAndPlayView reset for question:`, {
      id: question.id,
      question: question.question,
      answer: question.answer,
      images: question.images,
      correctImageIndex: question.correctImageIndex,
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
    setHasReadQuestion(false);
    setIsCorrect(null);
    setSelectedImageIndex(null);
    
    // Reset retry count when question changes
    if (!comingFromCelebration) {
      console.log(`🔄 Question changed - resetting retry count to 0`);
      onRetryCountChange(0);
    }
  }, [question.id, comingFromCelebration, onRetryCountChange]);

  // Play TTS for question
  useEffect(() => {
    if (!ttsSettingsLoaded || !shouldReadQuestion || isUserInteracting || hasReadQuestion) {
      return;
    }

    const readQuestion = async () => {
      try {
        console.log(`🔊 Reading tap and play question with ${therapistName}'s voice: ${ttsSettings.voice}`);
        setIsPlaying(true);
        
        // Stop any previous audio
        stopGlobalAudio();
        
        const voiceToUse = getVoiceForTherapist();
        console.log(`🎯 Final question voice selection for ${therapistName}: ${voiceToUse}`);
        
        const response = await callTTS(question.question, voiceToUse, ttsSettings.speed);

        if (response.data?.audioContent) {
          await playGlobalTTS(response.data.audioContent, 'TapAndPlayView');
          setHasReadQuestion(true);
        }
      } catch (error) {
        console.error('TTS error in tap and play question reading:', error);
        setHasReadQuestion(true);
      } finally {
        setIsPlaying(false);
      }
    };

    readQuestion();
  }, [ttsSettingsLoaded, shouldReadQuestion, isUserInteracting, hasReadQuestion, question.question, therapistName, ttsSettings]);

  // Auto-scroll effect
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [question.id]);

  const handleImageClick = async (imageIndex: number) => {
    if (isProcessingAnswer || !isWaitingForAnswer) return;
    
    console.log(`🎯 Processing tap and play answer:`, {
      questionId: question.id,
      selectedImageIndex: imageIndex,
      correctImageIndex: question.correctImageIndex,
      isCorrect: imageIndex === question.correctImageIndex
    });
    
    setIsProcessingAnswer(true);
    setIsUserInteracting(true);
    setSelectedImageIndex(imageIndex);
    stopGlobalAudio();
    
    const isAnswerCorrect = imageIndex === question.correctImageIndex;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      // Correct answer logic
      let feedbackForScreen = '';
      
      // Generate sound feedback if available
      if (question.answer) {
        await soundFeedbackManager.initialize();
        const { targetSound, confidence } = soundFeedbackManager.detectTargetSound(question.answer);
        
        if (targetSound && confidence > 0.6) {
          const feedback = await soundFeedbackManager.generateSoundFeedback({
            target_sound: question.answer,
            user_attempt: question.answer, // Since they clicked correctly, use the expected answer
            therapistName,
            childName,
            question: question.question,
            correct_answer: question.answer
          }, 'correct');
          
          if (feedback) {
            feedbackForScreen = feedback;
            setCurrentResponse(feedbackForScreen);
            setShowFeedback(true);
            try {
              const { data, error } = await callTTS(feedback, ttsSettings.voice, ttsSettings.speed);
              if (data?.audioContent) {
                await playGlobalTTS(data.audioContent, 'TapAndPlay-Correct');
              }
            } catch (e) { 
              console.error('TTS error (tap and play correct):', e); 
            }
          }
        }
      }

      // Get celebration message
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
      
      console.log(`✅ Correct tap and play answer! Moving to celebration`);
      
      if (!hasCalledCorrectAnswer) {
        setHasCalledCorrectAnswer(true);
        onCorrectAnswer();
      }
      
      setTimeout(() => {
        setIsProcessingAnswer(false);
        setIsUserInteracting(false);
      }, 500);
      
    } else {
      // Incorrect answer logic
      let feedbackForScreen = '';
      
      // Generate feedback for incorrect answer
      if (question.answer) {
        await soundFeedbackManager.initialize();
        const { targetSound, confidence } = soundFeedbackManager.detectTargetSound(question.answer);
        
        if (targetSound && confidence > 0.6) {
          const feedback = await soundFeedbackManager.generateSoundFeedback({
            target_sound: targetSound.sound,
            user_attempt: 'incorrect selection', // User clicked wrong image
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
                await playGlobalTTS(data.audioContent, 'TapAndPlay-Incorrect');
              }
            } catch (e) { 
              console.error('TTS error (tap and play incorrect):', e); 
            }
          }
        }
      }
      
      const newRetryCount = retryCount + 1;
      onRetryCountChange(newRetryCount);
      
      // Check if we've reached the maximum attempts (1)
      if (newRetryCount >= 1) {
        console.log(`❌ Maximum attempts (1) reached for tap and play question: ${question.question}`);
        
        const waitForTTSAndProceed = () => {
          setShowFeedback(false);
          setIsWaitingForAnswer(false);
          setIsProcessingAnswer(false);
          setIsUserInteracting(false);
          onNextQuestion();
        };
        
        if (feedbackForScreen) {
          setTimeout(() => {
            setTimeout(waitForTTSAndProceed, 1000);
          }, 500);
        } else {
          waitForTTSAndProceed();
        }
      } else {
        // Allow another attempt
        const waitForTTSAndRetry = () => {
          setShowFeedback(false);
          setIsWaitingForAnswer(true);
          setIsProcessingAnswer(false);
          setIsUserInteracting(false);
          setSelectedImageIndex(null);
        };
        
        if (feedbackForScreen) {
          setTimeout(() => {
            setTimeout(waitForTTSAndRetry, 1000);
          }, 500);
        } else {
          waitForTTSAndRetry();
        }
      }
    }
  };

  // Validate that we have the required data for tap and play
  if (!question.images || question.images.length !== 2 || question.correctImageIndex === undefined) {
    console.error('Invalid tap and play question data:', question);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Configuration Error</h2>
          <p className="text-muted-foreground">This question is missing required images or configuration for Tap and Play.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted p-6" ref={mainContentRef}>
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-primary">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>

      {/* Therapist avatar and question */}
      <div className="flex flex-col items-center mb-8 text-center max-w-2xl">
        <div className="mb-6">
          <Avatar className="w-20 h-20 border-4 border-primary/20">
            <AvatarImage src={`/lovable-uploads/${therapistName}.png`} alt={therapistName} />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {therapistName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="bg-card rounded-2xl p-6 shadow-lg border-2 border-primary/10">
          <h2 className="text-2xl font-bold text-foreground mb-4">{question.question}</h2>
          <p className="text-muted-foreground">Tap the correct picture!</p>
        </div>
      </div>

      {/* Two images side by side */}
      <div className="flex gap-6 mb-8">
        {question.images.map((imageName, index) => {
          const imageUrl = imageUrls[imageName];
          const isSelected = selectedImageIndex === index;
          const isCorrectAnswer = question.correctImageIndex === index;
          const showResult = selectedImageIndex !== null;
          
          let borderStyle = 'border-2 border-muted-foreground/30';
          if (showResult) {
            if (isSelected && isCorrect) {
              borderStyle = 'border-4 border-green-500 bg-green-50';
            } else if (isSelected && !isCorrect) {
              borderStyle = 'border-4 border-red-500 bg-red-50';
            } else if (!isSelected && isCorrectAnswer && !isCorrect) {
              borderStyle = 'border-4 border-green-500 bg-green-50';
            }
          }
          
          return (
            <div
              key={index}
              className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 ${borderStyle} ${
                isProcessingAnswer ? 'pointer-events-none' : ''
              }`}
              onClick={() => handleImageClick(index)}
              style={{ width: '200px', height: '200px' }}
            >
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={`Option ${index + 1}`}
                  className="w-full h-full object-cover"
                  style={{ pointerEvents: 'none' }}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">Image {index + 1}</span>
                </div>
              )}
              
              {/* Result indicators */}
              {showResult && isSelected && (
                <div className={`absolute inset-0 flex items-center justify-center ${
                  isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  <div className={`text-4xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? '✓' : '✗'}
                  </div>
                </div>
              )}
              
              {showResult && !isSelected && isCorrectAnswer && !isCorrect && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                  <div className="text-4xl text-green-600">✓</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Feedback display */}
      {showFeedback && currentResponse && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 max-w-md text-center">
          <p className="text-accent-foreground font-medium">{currentResponse}</p>
        </div>
      )}
    </div>
  );
};

export default TapAndPlayView;
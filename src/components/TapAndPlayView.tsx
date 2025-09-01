import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTTSSettings } from '@/hooks/useTTSSettings';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { stopAllAudio, playGlobalTTS, stopGlobalAudio } from '@/utils/audioUtils';
import { getCelebrationMessage, calculateProgressLevel } from '@/utils/celebrationMessages';
// Removed soundFeedbackManager import - now using direct OpenAI chat calls
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
      // Correct answer logic - use tap_feedback_correct prompt
      let feedbackForScreen = '';
      try {
        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: {
            messages: [
              {
                role: 'user',
                content: 'Generate tap feedback for correct answer'
              }
            ],
            promptType: 'tap_feedback_correct',
            childName,
            therapistName,
            customVariables: {
              correct_answer: question.answer,
              question: question.question,
              child_name: childName,
              therapist_name: therapistName
            }
          }
        });

        if (data?.content) {
          feedbackForScreen = data.content;
          setCurrentResponse(feedbackForScreen);
          setShowFeedback(true);
          
          try {
            const ttsResponse = await callTTS(feedbackForScreen, ttsSettings.voice, ttsSettings.speed);
            if (ttsResponse.data?.audioContent) {
              await playGlobalTTS(ttsResponse.data.audioContent, 'TapAndPlay-Correct');
            }
          } catch (e) { 
            console.error('TTS error (tap and play correct):', e); 
          }
        }
      } catch (error) {
        console.error('Error generating tap feedback for correct answer:', error);
      }

      // Get personalized celebration message (same pattern as SingleQuestionView)
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
      // Incorrect answer logic - use tap_feedback_incorrect prompt
      let feedbackForScreen = '';
      
      try {
        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: {
            messages: [
              {
                role: 'user',
                content: 'Generate tap feedback for incorrect answer'
              }
            ],
            promptType: 'tap_feedback_incorrect',
            childName,
            therapistName,
            customVariables: {
              correct_answer: question.answer,
              question: question.question,
              child_name: childName,
              therapist_name: therapistName
            }
          }
        });

        if (data?.content) {
          feedbackForScreen = data.content;
          setCurrentResponse(feedbackForScreen);
          setShowFeedback(true);
          
          try {
            const ttsResponse = await callTTS(feedbackForScreen, ttsSettings.voice, ttsSettings.speed);
            if (ttsResponse.data?.audioContent) {
              await playGlobalTTS(ttsResponse.data.audioContent, 'TapAndPlay-Incorrect');
            }
          } catch (e) { 
            console.error('TTS error (tap and play incorrect):', e); 
          }
        }
      } catch (error) {
        console.error('Error generating tap feedback for incorrect answer:', error);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      {/* Header with therapist and progress - matching SingleQuestionView exactly */}
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
          <div className="text-center">
            <p className="text-xl font-bold text-purple-800">
              Question {questionNumber} of {totalQuestions}
            </p>
          </div>
        </div>
      </div>

      {/* Main Question Area - matching SingleQuestionView structure */}
      <div ref={mainContentRef} className="flex-grow flex flex-col items-center justify-center max-w-7xl mx-auto w-full">
        {/* Question Text - Hidden from UI but TTS still reads it */}
        <div className="mb-8 animate-fade-in sr-only">
          <h2 className="text-4xl font-bold text-center text-blue-900 leading-relaxed">
            {question.question}
          </h2>
        </div>

        {/* Instruction Text */}
        <div className="mb-8 animate-fade-in text-center">
          <h2 className="text-4xl font-bold text-blue-900 leading-relaxed mb-4">
            {question.question}
          </h2>
          <p className="text-2xl text-blue-700 font-medium">Tap the correct picture!</p>
        </div>

        {/* Two Images - matching the image styling from SingleQuestionView */}
        <div className="mb-8 animate-scale-in flex justify-center gap-8">
          {question.images.map((imageName, index) => {
            // Fix image URL resolution - check multiple possible sources
            let imageUrl = imageUrls[imageName];
            
            console.log(`TapAndPlay: Checking image ${imageName}:`, { 
              imageUrl, 
              availableUrls: Object.keys(imageUrls),
              allImageUrls: imageUrls 
            });
            
            if (!imageUrl) {
              // Try with full URL if it's already a URL
              if (imageName.startsWith('http')) {
                imageUrl = imageName;
              } else {
                // Try constructing the Supabase storage URL directly
                imageUrl = `https://gsnsjrfudxyczpldbkzc.supabase.co/storage/v1/object/public/question-images/${imageName}`;
                console.log(`TapAndPlay: Constructed URL for ${imageName}:`, imageUrl);
              }
            }
            
            const isSelected = selectedImageIndex === index;
            const isCorrectAnswer = question.correctImageIndex === index;
            const showResult = selectedImageIndex !== null;
            
            let borderStyle = 'border-4 border-white';
            let overlayClass = '';
            
            if (showResult) {
              if (isSelected && isCorrect) {
                borderStyle = 'border-4 border-green-500';
                overlayClass = 'bg-green-500/20';
              } else if (isSelected && !isCorrect) {
                borderStyle = 'border-4 border-red-500';
                overlayClass = 'bg-red-500/20';
              } else if (!isSelected && isCorrectAnswer && !isCorrect) {
                borderStyle = 'border-4 border-green-500';
                overlayClass = 'bg-green-500/20';
              }
            }
            
            return (
              <div
                key={index}
                className={`inline-block rounded-3xl shadow-2xl ${borderStyle} overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 ${
                  isProcessingAnswer ? 'pointer-events-none' : ''
                }`}
                onClick={() => handleImageClick(index)}
              >
                <div className={`relative ${overlayClass}`}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={`Option ${index + 1}: ${imageName.split('.')[0]}`}
                      className="w-auto h-[24rem] max-w-3xl object-contain"
                      style={{ pointerEvents: 'none' }}
                      loading="lazy"
                      onError={(e) => {
                        console.error(`TapAndPlay: Failed to load image: ${imageUrl} for ${imageName}`);
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback') as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                      onLoad={() => {
                        console.log(`TapAndPlay: Successfully loaded image: ${imageUrl} for ${imageName}`);
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback display */}
                  <div 
                    className={`image-fallback w-auto h-[24rem] max-w-3xl bg-blue-100 border-2 border-blue-300 flex flex-col items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}
                    style={{ minWidth: '300px' }}
                  >
                    <div className="text-6xl mb-4">🖼️</div>
                    <span className="text-blue-700 text-lg font-medium text-center px-4">
                      {imageName.split('.')[0].replace(/[-_]/g, ' ').toUpperCase()}
                    </span>
                    <span className="text-blue-500 text-sm mt-2">Image {index + 1}</span>
                  </div>
                  
                  {/* Result indicators - matching SingleQuestionView feedback styling */}
                  {showResult && isSelected && (
                    <div className={`absolute inset-0 flex items-center justify-center ${
                      isCorrect ? 'bg-green-500/30' : 'bg-red-500/30'
                    }`}>
                      <div className={`text-8xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrect ? '✓' : '✗'}
                      </div>
                    </div>
                  )}
                  
                  {showResult && !isSelected && isCorrectAnswer && !isCorrect && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/30">
                      <div className="text-8xl font-bold text-green-600">✓</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feedback Area - exactly matching SingleQuestionView */}
        {showFeedback && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-200 rounded-3xl p-6 max-w-2xl mx-auto mb-8 animate-fade-in">
            <p className="text-lg text-center text-green-800 font-medium">
              {currentResponse}
            </p>
          </div>
        )}

        {/* Processing State - matching SingleQuestionView */}
        {isProcessingAnswer && !showFeedback && (
          <div className="text-center animate-fade-in">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-200 to-blue-200 flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-blue-600 font-normal text-lg">🔄 Processing your answer...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TapAndPlayView;
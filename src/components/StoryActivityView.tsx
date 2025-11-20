import React, { useState, useEffect } from 'react';
import { useTTSSettings } from '@/hooks/useTTSSettings';
import { useToast } from '@/hooks/use-toast';
import { stopGlobalAudio } from '@/utils/audioUtils';
import type { Database } from '@/integrations/supabase/types';

type QuestionType = Database['public']['Enums']['question_type_enum'];

interface Question {
  id: string;
  question: string;
  answer: string;
  images?: string[];
  correctImageIndex?: number;
  questionType?: QuestionType;
  scene_image?: string;
  scene_narration?: string;
  sequence_number?: number;
  is_scene?: boolean;
}

interface StoryActivityViewProps {
  storyEntries: Question[];
  imageUrls?: { [key: string]: string };
  questionNumber: number;
  totalQuestions: number;
  therapistName: string;
  childName: string;
  onCorrectAnswer: () => void;
  onComplete: () => void;
  comingFromCelebration?: boolean;
}

const StoryActivityView = ({
  storyEntries,
  imageUrls = {},
  therapistName,
  childName,
  onCorrectAnswer,
  onComplete,
}: StoryActivityViewProps) => {
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<'scene' | 'question'>('scene');
  const [hasReadScene, setHasReadScene] = useState(false);
  const [hasReadQuestion, setHasReadQuestion] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const { ttsSettings, isLoaded: ttsSettingsLoaded, callTTS } = useTTSSettings(therapistName);
  const { toast } = useToast();

  const currentEntry = storyEntries[currentSequenceIndex];
  const totalScenes = 5;
  const totalStoryQuestions = 4;
  const currentSceneNumber = Math.floor(currentSequenceIndex / 2) + 1;
  const currentQuestionNumber = Math.floor(currentSequenceIndex / 2);

  // Reset to beginning when storyEntries change
  useEffect(() => {
    console.log('📖 StoryActivityView received entries:', storyEntries.map(q => ({
      seq: q.sequence_number,
      isScene: q.is_scene,
      question: q.question?.substring(0, 30)
    })));
    setCurrentSequenceIndex(0);
    setCurrentStep('scene');
    setHasReadScene(false);
    setHasReadQuestion(false);
    setShowFeedback(false);
    setSelectedImageIndex(null);
    setIsProcessingAnswer(false);
  }, [storyEntries]);

  // Debug log for sequencing
  useEffect(() => {
    if (currentEntry) {
      console.log('📍 Current state:', {
        arrayIndex: currentSequenceIndex,
        sequenceNumber: currentEntry.sequence_number,
        isScene: currentEntry.is_scene,
        currentStep,
      });
    }
  }, [currentSequenceIndex, currentEntry, currentStep]);

  // Read scene narration automatically
  useEffect(() => {
    if (currentStep === 'scene' && currentEntry?.is_scene && !hasReadScene && !isPlaying && ttsSettingsLoaded) {
      const narration = currentEntry.scene_narration || '';
      if (narration) {
        console.log('🎬 Playing scene narration for sequence:', currentEntry.sequence_number);
        setIsPlaying(true);
        setHasReadScene(true); // Mark as read immediately to prevent retriggering
        const voiceToUse = ttsSettings.voice;
        callTTS(narration, voiceToUse, ttsSettings.speed)
          .then((response) => {
            if (response.data?.audioContent) {
              const audio = new Audio(`data:audio/mp3;base64,${response.data.audioContent}`);
              audio.play();
              audio.onended = () => {
                setIsPlaying(false);
                console.log('✅ Scene narration ended for sequence:', currentEntry.sequence_number);
                if (currentEntry.sequence_number === 9) {
                  setTimeout(() => {
                    onComplete();
                  }, 2000);
                } else {
                  setTimeout(() => {
                    setCurrentStep('question');
                    setCurrentSequenceIndex(prev => prev + 1);
                    setHasReadQuestion(false); // Reset for next question
                  }, 1000);
                }
              };
            } else {
              setIsPlaying(false);
            }
          })
          .catch((error) => {
            console.error('TTS error:', error);
            setIsPlaying(false);
          });
      }
    }
  }, [currentStep, currentEntry, hasReadScene, isPlaying, ttsSettingsLoaded, callTTS, ttsSettings, onComplete]);

  // Read question
  useEffect(() => {
    if (currentStep === 'question' && currentEntry && !currentEntry.is_scene && !hasReadQuestion && !isPlaying && !showFeedback && ttsSettingsLoaded) {
      const question = currentEntry.question || '';
      if (question) {
        console.log('❓ Playing question for sequence:', currentEntry.sequence_number);
        setIsPlaying(true);
        setHasReadQuestion(true); // Mark as read immediately to prevent retriggering
        const voiceToUse = ttsSettings.voice;
        callTTS(question, voiceToUse, ttsSettings.speed)
          .then((response) => {
            if (response.data?.audioContent) {
              const audio = new Audio(`data:audio/mp3;base64,${response.data.audioContent}`);
              audio.play();
              audio.onended = () => {
                setIsPlaying(false);
                console.log('✅ Question ended for sequence:', currentEntry.sequence_number);
              };
            } else {
              setIsPlaying(false);
            }
          })
          .catch((error) => {
            console.error('TTS error:', error);
            setIsPlaying(false);
          });
      }
    }
  }, [currentStep, currentEntry, hasReadQuestion, isPlaying, showFeedback, ttsSettingsLoaded, callTTS, ttsSettings]);

  const handleImageClick = async (index: number) => {
    if (isProcessingAnswer || showFeedback || !currentEntry) return;

    setIsProcessingAnswer(true);
    setSelectedImageIndex(index);

    const correctIndex = currentEntry.correctImageIndex ?? 0;
    const answerIsCorrect = index === correctIndex;
    setIsCorrect(answerIsCorrect);
    setShowFeedback(true);

    const feedbackText = answerIsCorrect 
      ? "Great job! That's correct!" 
      : "Not quite, but that's okay! Let's try the other one.";

    try {
      const voiceToUse = ttsSettings.voice;
      const response = await callTTS(feedbackText, voiceToUse, ttsSettings.speed);
      
      if (response.data?.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${response.data.audioContent}`);
        audio.play();
        
        audio.onended = () => {
          if (answerIsCorrect) {
            onCorrectAnswer();
            
            setTimeout(() => {
              const nextIndex = currentSequenceIndex + 1;
              console.log('➡️ Moving to next entry, index:', nextIndex);
              if (nextIndex < storyEntries.length) {
                setCurrentSequenceIndex(nextIndex);
                setCurrentStep('scene');
                setShowFeedback(false);
                setSelectedImageIndex(null);
                setIsProcessingAnswer(false);
                setHasReadScene(false); // Reset for next scene
              } else {
                onComplete();
              }
            }, 2000);
          } else {
            setTimeout(() => {
              setShowFeedback(false);
              setSelectedImageIndex(null);
              setIsProcessingAnswer(false);
            }, 2000);
          }
        };
      } else {
        setIsProcessingAnswer(false);
      }
    } catch (error) {
      console.error('Feedback TTS error:', error);
      setIsProcessingAnswer(false);
    }
  };

  useEffect(() => {
    return () => {
      stopGlobalAudio();
    };
  }, []);

  if (!currentEntry) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-600">Loading story...</p>
      </div>
    );
  }

  // Render scene
  if (currentStep === 'scene' && currentEntry.is_scene) {
    const sceneImageUrl = currentEntry.scene_image 
      ? imageUrls[currentEntry.scene_image] || currentEntry.scene_image 
      : '';

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="w-full max-w-4xl">
          <div className="mb-6 text-center">
            <p className="text-2xl font-bold text-purple-800">
              Scene {currentSceneNumber} of {totalScenes}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(currentSceneNumber / totalScenes) * 100}%` }}
              />
            </div>
          </div>

          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
            {sceneImageUrl && (
              <img
                src={sceneImageUrl}
                alt={`Scene ${currentSceneNumber}`}
                className="w-full h-auto object-contain max-h-[60vh]"
              />
            )}
            {isPlaying && (
              <div className="absolute bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full animate-pulse">
                🔊 Listening...
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xl text-gray-700 italic">
              {currentEntry.scene_narration}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render question
  if (currentStep === 'question' && !currentEntry.is_scene) {
    const questionImages = currentEntry.images || [];
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="w-full max-w-5xl">
          <div className="mb-6 text-center">
            <p className="text-2xl font-bold text-indigo-800">
              Question {currentQuestionNumber} of {totalStoryQuestions}
            </p>
          </div>

          <div className="mb-8 text-center">
            <p className="text-3xl font-bold text-gray-800">
              {currentEntry.question}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 max-w-3xl mx-auto">
            {questionImages.map((imageName, index) => {
              const imageUrl = imageUrls[imageName] || imageName;
              const isSelected = selectedImageIndex === index;
              
              return (
                <button
                  key={index}
                  onClick={() => handleImageClick(index)}
                  disabled={isProcessingAnswer || showFeedback}
                  className={`
                    relative aspect-square rounded-3xl overflow-hidden shadow-xl
                    transform transition-all duration-300
                    ${!showFeedback ? 'hover:scale-105 hover:shadow-2xl cursor-pointer' : ''}
                    ${isSelected && showFeedback 
                      ? isCorrect 
                        ? 'ring-8 ring-green-400 scale-105' 
                        : 'ring-8 ring-red-400'
                      : 'ring-4 ring-gray-200'
                    }
                    ${isProcessingAnswer || showFeedback ? 'cursor-not-allowed' : ''}
                  `}
                >
                  <img
                    src={imageUrl}
                    alt={`Choice ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {showFeedback && isSelected && (
                    <div className={`
                      absolute inset-0 flex items-center justify-center
                      ${isCorrect ? 'bg-green-500/80' : 'bg-red-500/80'}
                    `}>
                      <span className="text-7xl">
                        {isCorrect ? '✓' : '✗'}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div className="mt-8 text-center">
              <p className={`text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-orange-600'}`}>
                {isCorrect ? "Great job! That's correct!" : "Not quite, but that's okay! Try again!"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default StoryActivityView;

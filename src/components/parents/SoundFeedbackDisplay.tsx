import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { soundFeedbackManager, SoundConfig } from '@/utils/soundFeedback';

interface SoundFeedbackDisplayProps {
  userInput: string;
  isVisible: boolean;
  therapistName: string;
  childName: string;
  currentQuestion?: {
    question: string;
    answer: string;
  };
  isAnswerCorrect?: boolean;
}

const SoundFeedbackDisplay: React.FC<SoundFeedbackDisplayProps> = ({
  userInput,
  isVisible,
  therapistName,
  childName,
  currentQuestion,
  isAnswerCorrect
}) => {
  const [detectedSound, setDetectedSound] = useState<SoundConfig | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | 'encouragement' | 'instruction' | null>(null);

  useEffect(() => {
    // Initialize sound feedback manager if not already done
    if (!soundFeedbackManager.isInitialized()) {
      soundFeedbackManager.initialize();
    }
  }, []);

  useEffect(() => {
    if (!isVisible || !userInput.trim() || !soundFeedbackManager.isInitialized()) {
      setDetectedSound(null);
      setFeedback(null);
      setConfidence(0);
      setFeedbackType(null);
      return;
    }

    const detectAndProvideFeedback = async () => {
      setIsLoading(true);
      
      try {
        // Only provide sound feedback if:
        // 1. Answer is correct (celebrate the sound they used correctly)
        // 2. Answer is incorrect but we want to provide guidance on the correct answer's sounds
        if (isAnswerCorrect === undefined || !currentQuestion) {
          // No question context, don't provide sound feedback
          setDetectedSound(null);
          setFeedback(null);
          setConfidence(0);
          setFeedbackType(null);
          return;
        }

        if (isAnswerCorrect) {
          // Answer is correct - celebrate the sounds they used correctly
          const { targetSound, confidence: detectedConfidence } = soundFeedbackManager.detectTargetSound(userInput);
          
          if (targetSound && detectedConfidence > 0.6) {
            setDetectedSound(targetSound);
            setConfidence(detectedConfidence);
            setFeedbackType('correct');

            const generatedFeedback = await soundFeedbackManager.generateSoundFeedback({
              target_sound: targetSound.sound,
              user_attempt: userInput,
              therapistName,
              childName,
              question: currentQuestion.question,
              correct_answer: currentQuestion.answer
            }, 'correct');

            if (generatedFeedback) {
              setFeedback(generatedFeedback);
            }
          }
        } else {
          // Answer is incorrect - provide guidance on sounds in the correct answer
          const { targetSound, confidence: detectedConfidence } = soundFeedbackManager.detectTargetSound(currentQuestion.answer);
          
          if (targetSound && detectedConfidence > 0.6) {
            setDetectedSound(targetSound);
            setConfidence(detectedConfidence);
            setFeedbackType('instruction');

            const generatedFeedback = await soundFeedbackManager.generateSoundFeedback({
              target_sound: targetSound.sound,
              user_attempt: userInput,
              therapistName,
              childName,
              question: currentQuestion.question,
              correct_answer: currentQuestion.answer
            }, 'instruction');

            if (generatedFeedback) {
              setFeedback(generatedFeedback);
            }
          }
        }
      } catch (error) {
        console.error('Error in sound feedback detection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to avoid too frequent feedback
    const timeoutId = setTimeout(detectAndProvideFeedback, 500);
    return () => clearTimeout(timeoutId);
  }, [userInput, isVisible, therapistName, childName, currentQuestion, isAnswerCorrect]);

  if (!isVisible || !detectedSound) {
    return null;
  }

  return (
    <Card className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-lg">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Sound Detection Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{detectedSound.emoji}</span>
              <div>
                <h3 className="font-bold text-blue-800 text-sm">
                  Detected: {detectedSound.sound.toUpperCase()} Sound
                </h3>
                <p className="text-xs text-gray-600">{detectedSound.description}</p>
              </div>
            </div>
            <Badge 
              variant={confidence > 0.8 ? "default" : confidence > 0.6 ? "secondary" : "outline"}
              className="text-xs"
            >
              {Math.round(confidence * 100)}% match
            </Badge>
          </div>

          {/* Confidence Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Confidence</span>
              <span>{Math.round(confidence * 100)}%</span>
            </div>
            <Progress 
              value={confidence * 100} 
              className="h-2"
              style={{
                '--progress-background': confidence > 0.8 ? '#10b981' : confidence > 0.6 ? '#f59e0b' : '#6b7280'
              } as React.CSSProperties}
            />
          </div>

          {/* Feedback Message */}
          {isLoading ? (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Analyzing your speech...</span>
            </div>
          ) : feedback ? (
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <div className="flex items-start space-x-2">
                <span className="text-lg">
                  {feedbackType === 'correct' ? '🌟' : 
                   feedbackType === 'incorrect' ? '🎯' : 
                   feedbackType === 'encouragement' ? '💪' : '📚'}
                </span>
                <p className="text-sm text-gray-800 leading-relaxed">{feedback}</p>
              </div>
            </div>
          ) : null}

          {/* Sound Instruction */}
          {feedbackType === 'incorrect' && (
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-start space-x-2">
                <span className="text-lg">💡</span>
                <div>
                  <p className="text-xs font-semibold text-yellow-800 mb-1">Try this:</p>
                  <p className="text-sm text-yellow-700">{detectedSound.instruction}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SoundFeedbackDisplay; 
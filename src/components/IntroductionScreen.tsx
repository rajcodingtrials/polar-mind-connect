
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type QuestionType = Database['public']['Enums']['question_type_enum'];

interface IntroductionScreenProps {
  selectedQuestionType: QuestionType;
  therapistName: string;
  childName: string;
  onStartQuestions: () => void;
}

const IntroductionScreen = ({ selectedQuestionType, therapistName, childName, onStartQuestions }: IntroductionScreenProps) => {
  const [introMessage, setIntroMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const { playAudio, isPlaying } = useAudioPlayer();

  const getActivityName = (type: QuestionType) => {
    switch (type) {
      case 'first_words': return 'First Words';
      case 'question_time': return 'Question Time';
      case 'build_sentence': return 'Build a Sentence';
      case 'lets_chat': return 'Let\'s Chat';
      default: return 'Learning';
    }
  };

  useEffect(() => {
    const generateIntroduction = async () => {
      try {
        const activityName = getActivityName(selectedQuestionType);
        
        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: {
            messages: [{
              role: 'user',
              content: `Create a warm, encouraging introduction for ${childName} starting a ${activityName} activity. Keep it short (2-3 sentences), friendly, and exciting for a child. End with something like "Let's begin!" or "Are you ready?"`
            }],
            activityType: selectedQuestionType,
            customInstructions: `You are ${therapistName}, a warm and encouraging AI speech therapy assistant. Speak directly to ${childName} in a friendly, upbeat tone.`,
            therapistName,
            childName
          }
        });

        if (error) {
          console.error('Error generating introduction:', error);
          setIntroMessage(`Hi ${childName}! I'm ${therapistName}, and I'm so excited to work on ${activityName} with you today! Are you ready to have some fun learning together?`);
        } else if (data?.choices?.[0]?.message?.content) {
          setIntroMessage(data.choices[0].message.content);
        }

        // Auto-play TTS after a short delay
        setTimeout(async () => {
          try {
            const ttsResponse = await supabase.functions.invoke('openai-tts', {
              body: {
                text: introMessage || `Hi ${childName}! I'm ${therapistName}, and I'm so excited to work on ${activityName} with you today! Are you ready to have some fun learning together?`,
                voice: 'nova',
                speed: 1.0
              }
            });

            if (ttsResponse.data?.audioContent) {
              await playAudio(ttsResponse.data.audioContent);
              // Show continue button after TTS finishes
              setTimeout(() => setShowContinueButton(true), 3000);
            } else {
              setShowContinueButton(true);
            }
          } catch (error) {
            console.error('TTS error:', error);
            setShowContinueButton(true);
          }
        }, 1000);

      } catch (error) {
        console.error('Error in generateIntroduction:', error);
        setIntroMessage(`Hi ${childName}! I'm ${therapistName}, and I'm so excited to work with you today! Are you ready to have some fun learning together?`);
        setShowContinueButton(true);
      } finally {
        setIsLoading(false);
      }
    };

    generateIntroduction();
  }, [selectedQuestionType, therapistName, childName, playAudio]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-6 animate-fade-in">
      <div className="flex-grow flex flex-col items-center justify-center max-w-4xl mx-auto">
        {/* Therapist Avatar */}
        <div className="mb-8 animate-scale-in">
          <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
            <AvatarImage 
              src="/lovable-uploads/Laura.png" 
              alt={`${therapistName} - Speech Therapist`}
            />
            <AvatarFallback className="bg-blue-200 text-blue-800 text-4xl font-bold">
              {therapistName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Welcome Message */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-purple-200 max-w-2xl mx-auto mb-8 animate-fade-in" 
             style={{ animationDelay: '0.3s' }}>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-purple-800 mb-4">
              Welcome to {getActivityName(selectedQuestionType)}!
            </h1>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            ) : (
              <p className="text-lg text-gray-700 leading-relaxed">
                {introMessage}
              </p>
            )}
          </div>
        </div>

        {/* Continue Button */}
        {showContinueButton && (
          <Button
            onClick={onStartQuestions}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-12 py-4 text-xl font-bold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: '0.6s' }}
            disabled={isPlaying}
          >
            {isPlaying ? 'Listen...' : 'Let\'s Start! 🚀'}
          </Button>
        )}

        {/* Loading indicator during TTS */}
        {isPlaying && (
          <div className="mt-4 text-center animate-pulse">
            <p className="text-purple-600 font-medium">🎵 Playing introduction...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntroductionScreen;

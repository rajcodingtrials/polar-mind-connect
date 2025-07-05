
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useTherapistTTS } from '@/hooks/useTherapistTTS';
import type { Database } from '@/integrations/supabase/types';

type QuestionType = Database['public']['Enums']['question_type_enum'];

interface IntroductionScreenProps {
  selectedQuestionType: QuestionType;
  therapistName: string;
  childName: string;
  onStartQuestions: () => void;
}

const IntroductionScreen = ({ selectedQuestionType, therapistName, childName, onStartQuestions }: IntroductionScreenProps) => {
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const { playAudio, isPlaying } = useAudioPlayer();
  const { settings: ttsSettings, loading: ttsLoading } = useTherapistTTS(therapistName);

  const questionTypeLabels = {
    first_words: 'First Words',
    question_time: 'Question Time', 
    build_sentence: 'Build a Sentence',
    lets_chat: 'Let\'s Chat'
  };

  useEffect(() => {
    if (!ttsLoading) {
      playIntroduction();
    }
  }, [ttsLoading]);

  const playIntroduction = async () => {
    if (ttsLoading) return;
    
    try {
      console.log(`🎤 Playing introduction with ${therapistName}'s voice (${ttsSettings.voice})`);
      setIsPlayingIntro(true);
      
      const introText = `Hi ${childName}! I'm ${therapistName}, and I'm so excited to work with you today! We're going to practice ${questionTypeLabels[selectedQuestionType]}. Are you ready to have some fun learning together? Let's get started!`;

      const response = await supabase.functions.invoke('openai-tts', {
        body: {
          text: introText,
          voice: ttsSettings.voice,
          speed: ttsSettings.speed
        }
      });

      if (response.data?.audioContent) {
        await playAudio(response.data.audioContent);
      }
    } catch (error) {
      console.error('Error playing introduction:', error);
    } finally {
      setIsPlayingIntro(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 p-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Therapist Avatar */}
        <div className="mb-8">
          <div 
            className="w-64 h-64 mx-auto animate-bounce"
            style={{ animationDuration: '2s' }}
          >
            <img 
              src={`/lovable-uploads/${therapistName}.png`}
              alt={therapistName}
              className="w-full h-full object-contain rounded-lg filter brightness-110 saturate-150"
              onError={(e) => {
                console.error(`Error loading ${therapistName} image`);
              }}
            />
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-6 text-purple-800">
            Hi {childName}! 👋
          </h1>
          <h2 className="text-3xl font-semibold mb-4 text-purple-700">
            I'm {therapistName}! 🌟
          </h2>
          <p className="text-xl text-purple-600 mb-6 leading-relaxed max-w-2xl mx-auto">
            I'm so excited to work with you today! We're going to practice{' '}
            <span className="font-bold text-purple-800">{questionTypeLabels[selectedQuestionType]}</span>.
          </p>
          <p className="text-lg text-purple-600">
            Are you ready to have some fun learning together? 🎉
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={playIntroduction}
            disabled={isPlayingIntro || isPlaying || ttsLoading}
            className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 text-lg font-bold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            {isPlayingIntro || isPlaying ? `🎵 ${therapistName} is talking...` : `🎤 Hear ${therapistName}'s Welcome!`}
          </Button>
          
          <Button
            onClick={onStartQuestions}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-4 text-lg font-bold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Let's Start! 🚀
          </Button>
        </div>

        {/* Fun decorative elements */}
        <div className="mt-12 text-6xl opacity-50">
          🌈 ⭐ 🎈 🎨 🌟 🎪 ✨
        </div>
      </div>
    </div>
  );
};

export default IntroductionScreen;

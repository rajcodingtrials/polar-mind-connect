
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useTherapistTTS } from '../hooks/useTherapistTTS';
import type { Database } from '@/integrations/supabase/types';

type QuestionType = Database['public']['Enums']['question_type_enum'];

interface IntroductionScreenProps {
  selectedQuestionType: QuestionType;
  therapistName: string;
  childName: string;
  onStartQuestions: () => void;
}

const IntroductionScreen = ({ 
  selectedQuestionType, 
  therapistName, 
  childName, 
  onStartQuestions 
}: IntroductionScreenProps) => {
  const { toast } = useToast();
  const { settings: ttsSettings, isLoading: ttsLoading } = useTherapistTTS(therapistName);
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);

  const questionTypeLabels = {
    'first_words': 'First Words',
    'question_time': 'Question Time',
    'build_sentence': 'Build a Sentence',
    'lets_chat': "Let's Chat"
  };

  const introductionText = `Hello ${childName}! I'm so happy to see you today! ⭐ We're going to have so much fun learning new words together. Are you ready? Let's begin! 🎉`;

  useEffect(() => {
    // Auto-play introduction when component mounts
    if (!ttsLoading) {
      playIntroduction();
    }
  }, [ttsLoading]);

  const playIntroduction = async () => {
    if (isPlayingIntro) return;
    
    setIsPlayingIntro(true);
    try {
      const { data, error } = await supabase.functions.invoke('openai-tts', {
        body: { 
          text: introductionText,
          voice: ttsSettings.voice,
          speed: ttsSettings.speed
        }
      });

      if (error) throw error;

      if (data.audioContent) {
        const binaryString = atob(data.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setIsPlayingIntro(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      }
    } catch (error) {
      console.error('Error playing introduction:', error);
      toast({
        title: "Audio Error",
        description: "Could not play introduction audio. You can still continue with the questions.",
        variant: "destructive",
      });
      setIsPlayingIntro(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4">
      <div className="flex flex-col items-center mb-8">
        <Avatar className="h-32 w-32 border-4 border-white shadow-2xl mb-6">
          <AvatarImage 
            src={therapistName === 'Laura' ? '/lovable-uploads/Laura.png' : '/lovable-uploads/Lawrence.png'} 
            alt={therapistName} 
          />
          <AvatarFallback className="bg-purple-100 text-purple-600 text-2xl">
            {therapistName[0]}
          </AvatarFallback>
        </Avatar>
      </div>

      <Card className="max-w-2xl w-full bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
        <CardContent className="p-8 text-center">
          <h1 className="text-3xl font-bold text-purple-600 mb-6">
            Welcome to {questionTypeLabels[selectedQuestionType]}!
          </h1>
          
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Hello, {childName}! I'm so happy to see you today! ⭐ We're going to have so much fun learning new words together. Are you ready? Let's begin! 🎉
          </p>
          
          <div className="space-y-4">
            <Button
              onClick={playIntroduction}
              disabled={isPlayingIntro || ttsLoading}
              variant="outline"
              size="lg"
              className="text-lg px-8 py-3 bg-purple-100 border-purple-200 text-purple-700 hover:bg-purple-200"
            >
              {isPlayingIntro ? '🎵 Playing introduction...' : 'Listen...'}
            </Button>
            
            <div className="text-sm text-purple-400 mt-2">
              {isPlayingIntro ? '🎵 Playing introduction...' : ''}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8">
        <Button
          onClick={onStartQuestions}
          size="lg"
          className="text-lg px-12 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          Let's Start! 🚀
        </Button>
      </div>
    </div>
  );
};

export default IntroductionScreen;

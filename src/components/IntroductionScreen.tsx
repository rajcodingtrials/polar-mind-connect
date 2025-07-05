
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

  const introductionText = `Hello ${childName}! I'm ${therapistName}, and I'm so excited to work with you today! We're going to practice ${questionTypeLabels[selectedQuestionType]}. Are you ready to have some fun learning together?`;

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
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-8 text-center">
          <div className="flex justify-center mb-6">
            <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
              <AvatarImage 
                src={therapistName === 'Laura' ? '/lovable-uploads/Laura.png' : '/lovable-uploads/Lawrence.png'} 
                alt={therapistName} 
              />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                {therapistName[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Hi {childName}! I'm {therapistName}! 👋
          </h2>
          
          <p className="text-xl text-white/90 mb-6 leading-relaxed">
            I'm so excited to work with you today! We're going to practice{' '}
            <span className="font-semibold">{questionTypeLabels[selectedQuestionType]}</span>.
          </p>
          
          <p className="text-lg text-white/80">
            Are you ready to have some fun learning together? 🎉
          </p>
        </div>
        
        <CardContent className="p-8 text-center bg-white">
          <div className="space-y-6">
            <div className="text-gray-600 text-lg">
              Click the button below when you're ready to start!
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={playIntroduction}
                disabled={isPlayingIntro || ttsLoading}
                variant="outline"
                size="lg"
                className="text-lg px-8 py-3"
              >
                {isPlayingIntro ? '🔊 Playing...' : '🔊 Play Introduction Again'}
              </Button>
              
              <Button
                onClick={onStartQuestions}
                size="lg"
                className="text-lg px-8 py-3 bg-gradient-to-r from-blue-400 to-purple-500 hover:opacity-90 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Let's Start! 🚀
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntroductionScreen;

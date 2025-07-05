
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useTherapistTTS } from '../hooks/useTherapistTTS';
import VoiceRecorder from './chat/VoiceRecorder';
import { Volume2, Mic, MicOff, RotateCcw, CheckCircle } from 'lucide-react';
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
  const { toast } = useToast();
  const { settings: ttsSettings, isLoading: ttsLoading } = useTherapistTTS(therapistName);
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);

  // Auto-play question when component loads (but not when coming from celebration)
  useEffect(() => {
    if (!comingFromCelebration && !ttsLoading) {
      const timer = setTimeout(() => {
        playQuestion();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [question.id, ttsLoading, comingFromCelebration]);

  const playQuestion = async () => {
    if (isPlayingQuestion || ttsLoading) return;
    
    setIsPlayingQuestion(true);
    try {
      const questionText = `${childName}, ${question.question}`;
      
      const { data, error } = await supabase.functions.invoke('openai-tts', {
        body: { 
          text: questionText,
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
          setIsPlayingQuestion(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      }
    } catch (error) {
      console.error('Error playing question:', error);
      toast({
        title: "Audio Error",
        description: "Could not play question audio.",
        variant: "destructive",
      });
      setIsPlayingQuestion(false);
    }
  };

  const handleVoiceResult = async (audioBlob: Blob) => {
    setIsListening(false);
    setIsEvaluatingAnswer(true);
    
    try {
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      // Send to speech-to-text service
      const { data: sttData, error: sttError } = await supabase.functions.invoke('openai-stt', {
        body: { audioContent: base64Audio }
      });

      if (sttError) throw sttError;

      const userTranscript = sttData.text || '';
      setTranscript(userTranscript);
      
      if (!userTranscript.trim()) {
        toast({
          title: "No Speech Detected",
          description: "I didn't hear anything. Please try speaking again.",
          variant: "destructive",
        });
        setIsEvaluatingAnswer(false);
        return;
      }

      // Evaluate the answer using OpenAI
      const evaluationPrompt = `
        Question: "${question.question}"
        Expected Answer: "${question.answer}"
        Child's Answer: "${userTranscript}"
        Child's Name: "${childName}"
        Therapist: "${therapistName}"
        
        Is the child's answer correct or close enough to be considered correct for a speech therapy session?
        Consider partial matches, phonetic similarities, and age-appropriate responses.
        
        Respond with only "CORRECT" or "INCORRECT" followed by a brief encouraging response for the child.
      `;

      const { data: chatData, error: chatError } = await supabase.functions.invoke('openai-chat', {
        body: { 
          message: evaluationPrompt,
          childName,
          therapistName,
          systemRole: 'speech_therapist_evaluator'
        }
      });

      if (chatError) throw chatError;

      const evaluation = chatData.response || '';
      const isCorrect = evaluation.toUpperCase().includes('CORRECT') && !evaluation.toUpperCase().includes('INCORRECT');
      
      if (isCorrect) {
        onCorrectAnswer();
        onRetryCountChange(0);
      } else {
        // Handle incorrect answer
        const newRetryCount = retryCount + 1;
        onRetryCountChange(newRetryCount);
        
        if (newRetryCount >= 2) {
          // Enable speech delay mode after 2 incorrect attempts
          onSpeechDelayModeChange(true);
          setShowEncouragement(true);
          
          // Play encouragement
          const encouragementText = `That's okay, ${childName}! Let's try this together. The answer is "${question.answer}". Can you say "${question.answer}" with me?`;
          await playEncouragement(encouragementText);
        } else {
          // Give another try
          const tryAgainText = `Not quite, ${childName}. Let's try again! ${question.question}`;
          await playEncouragement(tryAgainText);
        }
      }
    } catch (error) {
      console.error('Error processing voice answer:', error);
      toast({
        title: "Error",
        description: "There was an error processing your answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEvaluatingAnswer(false);
    }
  };

  const playEncouragement = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('openai-tts', {
        body: { 
          text,
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
        audio.onended = () => URL.revokeObjectURL(audioUrl);
        
        await audio.play();
      }
    } catch (error) {
      console.error('Error playing encouragement:', error);
    }
  };

  const handleCorrectInSpeechDelayMode = () => {
    onCorrectAnswer();
    onRetryCountChange(0);
    onSpeechDelayModeChange(false);
    setShowEncouragement(false);
  };

  const getTherapistAvatar = () => {
    const avatarSrc = therapistName === 'Laura' ? '/lovable-uploads/Laura.png' : '/lovable-uploads/Lawrence.png';
    const bgColor = therapistName === 'Laura' ? 'bg-blue-100' : 'bg-green-100';
    const textColor = therapistName === 'Laura' ? 'text-blue-600' : 'text-green-600';
    
    return (
      <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
        <AvatarImage src={avatarSrc} alt={therapistName} />
        <AvatarFallback className={`${bgColor} ${textColor} text-lg`}>
          {therapistName[0]}
        </AvatarFallback>
      </Avatar>
    );
  };

  const getGradientColors = () => {
    return therapistName === 'Laura' 
      ? 'from-blue-400 to-purple-500' 
      : 'from-green-400 to-teal-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {getTherapistAvatar()}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Learning with {therapistName}
              </h1>
              <p className="text-gray-600">Question {questionNumber} of {totalQuestions}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {questionNumber}/{totalQuestions}
            </Badge>
          </div>
        </div>

        {/* Main Question Card */}
        <Card className="mb-6 shadow-2xl border-0 overflow-hidden">
          <CardHeader className={`bg-gradient-to-r ${getGradientColors()} text-white`}>
            <CardTitle className="text-2xl text-center">
              {question.question}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Image */}
            {imageUrl && (
              <div className="mb-8 text-center">
                <img 
                  src={imageUrl} 
                  alt="Question visual" 
                  className="max-w-md mx-auto rounded-xl shadow-lg border-4 border-white"
                />
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap gap-4 justify-center mb-6">
              <Button
                onClick={playQuestion}
                disabled={isPlayingQuestion || ttsLoading}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <Volume2 className="w-5 h-5" />
                {isPlayingQuestion ? 'Playing...' : 'Repeat Question'}
              </Button>
            </div>

            {/* Voice Recording Interface */}
            <div className="text-center space-y-4">
              {!speechDelayMode ? (
                <VoiceRecorder
                  onResult={handleVoiceResult}
                  isListening={isListening}
                  onListeningChange={setIsListening}
                  disabled={isEvaluatingAnswer}
                />
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-lg text-yellow-800 mb-2">
                      🌟 Let's practice together! The answer is:
                    </p>
                    <p className="text-2xl font-bold text-yellow-900 mb-4">
                      "{question.answer}"
                    </p>
                    <p className="text-yellow-700">
                      Can you say "{question.answer}" with me?
                    </p>
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <VoiceRecorder
                      onResult={handleVoiceResult}
                      isListening={isListening}
                      onListeningChange={setIsListening}
                      disabled={isEvaluatingAnswer}
                    />
                    
                    <Button
                      onClick={handleCorrectInSpeechDelayMode}
                      className="bg-green-500 hover:bg-green-600 text-white"
                      size="lg"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      I Said It!
                    </Button>
                  </div>
                </div>
              )}

              {isEvaluatingAnswer && (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-lg">Listening to your answer...</span>
                </div>
              )}

              {transcript && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">I heard you say:</p>
                  <p className="text-lg font-medium text-gray-800">"{transcript}"</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SingleQuestionView;

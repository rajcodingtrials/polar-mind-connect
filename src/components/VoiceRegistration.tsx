import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, CheckCircle, PlayCircle } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface VoiceRegistrationProps {
  onComplete: () => void;
}

const VoiceRegistration = ({ onComplete }: VoiceRegistrationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSamples, setCompletedSamples] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isRecording, startRecording, stopRecording, audioLevel } = useAudioRecorder();
  const { toast } = useToast();
  const { user } = useAuth();

  const voiceSamples = [
    {
      type: 'speech',
      prompt: 'Say "Hello, my name is [your name]"',
      description: 'Clear speech sample'
    },
    {
      type: 'speech', 
      prompt: 'Count from 1 to 5: "One, two, three, four, five"',
      description: 'Number pronunciation'
    },
    {
      type: 'babbling',
      prompt: 'Make babbling sounds like "ba-ba-ba" or "da-da-da"',
      description: 'Babbling patterns'
    },
    {
      type: 'babbling',
      prompt: 'Make playful sounds like "goo-goo" or "ga-ga"',
      description: 'Early vocalizations'
    },
    {
      type: 'speech',
      prompt: 'Say "I like to play" in your normal voice',
      description: 'Natural speech sample'
    }
  ];

  const handleRecording = async () => {
    if (isRecording) {
      try {
        const audioData = await stopRecording();
        if (audioData) {
          setIsProcessing(true);
          
          // Call edge function to store voice sample
          const { data, error } = await supabase.functions.invoke('resemblyzer-enrollment', {
            body: {
              audio: audioData,
              sampleType: voiceSamples[currentStep].type,
              sampleIndex: currentStep,
              userId: user?.id
            }
          });

          if (error) {
            toast({
              title: "Error",
              description: "Failed to process voice sample. Please try again.",
              variant: "destructive"
            });
          } else {
            setCompletedSamples([...completedSamples, audioData]);
            
            if (currentStep < voiceSamples.length - 1) {
              setCurrentStep(currentStep + 1);
              toast({
                title: "Great!",
                description: `Sample ${currentStep + 1} recorded successfully.`
              });
            } else {
              toast({
                title: "Voice Registration Complete!",
                description: "All voice samples have been recorded and processed."
              });
              onComplete();
            }
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to record voice sample.",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      try {
        await startRecording();
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not access microphone. Please check permissions.",
          variant: "destructive"
        });
      }
    }
  };

  const progress = ((currentStep + (completedSamples.length > currentStep ? 1 : 0)) / voiceSamples.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Voice Registration</CardTitle>
          <CardDescription>
            Help us learn your child's voice patterns by recording both speech and babbling samples.
            This ensures accurate voice identification during sessions.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <div className="grid grid-cols-5 gap-2">
            {voiceSamples.map((_, index) => (
              <div key={index} className="flex flex-col items-center space-y-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  index < completedSamples.length 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                    : index === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {index < completedSamples.length ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs text-center text-muted-foreground">
                  {voiceSamples[index].type === 'babbling' ? '👶' : '💬'}
                </span>
              </div>
            ))}
          </div>

          <Card className="border-2 border-dashed">
            <CardContent className="p-6 text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Sample {currentStep + 1}: {voiceSamples[currentStep].description}
                </h3>
                <p className="text-muted-foreground">
                  {voiceSamples[currentStep].prompt}
                </p>
                {voiceSamples[currentStep].type === 'babbling' && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    💡 Babbling sounds help us recognize your child even during early speech development
                  </p>
                )}
              </div>

              <div className="flex flex-col items-center space-y-4">
                {isRecording && (
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center animate-pulse">
                    <div 
                      className="w-4 bg-red-500 rounded-full transition-all duration-100"
                      style={{ height: `${Math.max(4, audioLevel * 40)}px` }}
                    />
                  </div>
                )}

                <Button
                  size="lg"
                  onClick={handleRecording}
                  disabled={isProcessing}
                  variant={isRecording ? "destructive" : "default"}
                  className="w-48"
                >
                  {isProcessing ? (
                    <>Processing...</>
                  ) : isRecording ? (
                    <>
                      <MicOff className="w-5 h-5 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>

                {!isRecording && currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  >
                    Previous Sample
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              {voiceSamples[currentStep].type === 'babbling' 
                ? 'Babbling samples help identify your child during early language development'
                : 'Speak clearly and naturally for best results'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceRegistration;
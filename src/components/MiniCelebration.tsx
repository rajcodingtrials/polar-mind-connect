
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useCartoonCharacters } from '@/hooks/useCartoonCharacters';
import { supabase } from '@/integrations/supabase/client';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface MiniCelebrationProps {
  correctAnswers: number;
  onComplete: () => void;
}

const MiniCelebration = ({ correctAnswers, onComplete }: MiniCelebrationProps) => {
  const { selectedCharacter } = useCartoonCharacters();
  const [showConfetti, setShowConfetti] = useState(true);
  const [isRolling, setIsRolling] = useState(true);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const { playAudio, isPlaying } = useAudioPlayer();
  
  // Use refs to access latest values in useEffect
  const isPlayingRef = useRef(isPlaying);
  const onCompleteRef = useRef(onComplete);
  
  // Update refs when values change
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const runCelebration = async () => {
      console.log('🎊 Starting celebration TTS - component mounted');
      
      // Hide confetti after animation
      const confettiTimer = setTimeout(() => setShowConfetti(false), 2000);
      
      // Stop rolling animation
      const rollingTimer = setTimeout(() => setIsRolling(false), 1500);
      
      // Play celebration TTS
      try {
        setIsPlayingTTS(true);
        const response = await supabase.functions.invoke('openai-tts', {
          body: {
            text: 'Amazing work! That was perfect!',
            voice: 'nova',
            speed: 1.0
          }
        });

        if (response.data?.audioContent) {
          await playAudio(response.data.audioContent);
          
          // Wait for TTS to completely finish before proceeding
          const waitForTTSComplete = () => {
            if (isPlayingRef.current) {
              setTimeout(waitForTTSComplete, 100);
            } else {
              console.log('🎊 TTS finished, celebration complete');
              setIsPlayingTTS(false);
              // Add a small delay after TTS finishes before moving to next question
              setTimeout(() => {
                onCompleteRef.current();
              }, 1000);
            }
          };
          
          // Start checking if TTS is done
          setTimeout(waitForTTSComplete, 1000);
        } else {
          // If no TTS, proceed after standard delay
          setTimeout(() => {
            setIsPlayingTTS(false);
            onComplete();
          }, 3000);
        }
      } catch (error) {
        console.error('TTS error in celebration:', error);
        // If TTS fails, proceed after standard delay
        setTimeout(() => {
          setIsPlayingTTS(false);
          onComplete();
        }, 3000);
      }

      // Cleanup timers
      return () => {
        clearTimeout(confettiTimer);
        clearTimeout(rollingTimer);
      };
    };

    runCelebration();
  }, []); // Empty dependency array - only run once

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 p-6">
      {/* Mini Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 opacity-90"
              style={{
                left: `${40 + Math.random() * 20}%`,
                top: `${30 + Math.random() * 20}%`,
                backgroundColor: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#F59E0B', '#FBBF24'][Math.floor(Math.random() * 6)],
                animation: `mini-confetti-fall ${1.5 + Math.random() * 1}s linear forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0%'
              }}
            />
          ))}
        </div>
      )}

      {/* CSS for mini confetti animation */}
      <style>{`
        @keyframes mini-confetti-fall {
          0% {
            transform: translateY(-20px) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100px) rotate(360deg) scale(0.5);
            opacity: 0;
          }
        }
        
        @keyframes character-roll {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
      `}</style>

      {/* Character with rolling animation */}
      <div className="relative mb-8">
        <div 
          className={`w-32 h-32 transition-all duration-1500 ${isRolling ? 'animate-bounce' : ''}`}
          style={{
            animation: isRolling ? 'character-roll 1.5s ease-in-out' : 'none'
          }}
        >
          {selectedCharacter?.image_url ? (
            <img 
              src={selectedCharacter.image_url}
              alt={selectedCharacter.name}
              className="w-full h-full object-contain rounded-lg filter brightness-110 saturate-150"
              onError={(e) => {
                e.currentTarget.src = "/lovable-uploads/5197a6a0-9d6b-4c95-b80e-db71d2e8e099.png";
              }}
            />
          ) : (
            <img 
              src="/lovable-uploads/5197a6a0-9d6b-4c95-b80e-db71d2e8e099.png"
              alt="Progress Buddy"
              className="w-full h-full object-contain rounded-lg filter brightness-110 saturate-150"
            />
          )}
        </div>
      </div>

      {/* Celebration Message */}
      <div className="text-center animate-fade-in">
        <h2 className="text-4xl font-bold text-emerald-600 mb-4 animate-pulse">
          🎉 Amazing! 🎉
        </h2>
        <p className="text-xl text-emerald-700 font-semibold mb-2">
          That was perfect!
        </p>
        <p className="text-lg text-emerald-600">
          {selectedCharacter?.name || 'Your buddy'} is so proud of you! ✨
        </p>
        
        {/* Progress indicator */}
        <div className="mt-6 bg-white rounded-full p-2 shadow-lg inline-block">
          <div className="flex items-center gap-2 px-4 py-2">
            <span className="text-emerald-600 font-bold">{correctAnswers}</span>
            <span className="text-gray-500">correct answers!</span>
            <span className="text-2xl">🌟</span>
          </div>
        </div>
        
        {/* TTS Status */}
        {isPlayingTTS && (
          <div className="mt-4">
            <p className="text-sm text-emerald-600 animate-pulse">
              🎵 Playing celebration message...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniCelebration;

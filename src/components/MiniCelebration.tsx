import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useCartoonCharacters } from '@/hooks/useCartoonCharacters';
import { useTTSSettings } from '@/hooks/useTTSSettings';
import { supabase } from '@/integrations/supabase/client';
import { getCelebrationMessage, calculateProgressLevel } from '@/utils/celebrationMessages';

import { stopAllAudio, playGlobalTTS, stopGlobalAudio } from '@/utils/audioUtils';

interface MiniCelebrationProps {
  correctAnswers: number;
  therapistName: string;
  onComplete: () => void;
}

const MiniCelebration = ({ correctAnswers, therapistName, onComplete }: MiniCelebrationProps) => {
  const { selectedCharacter } = useCartoonCharacters();
  const [showConfetti, setShowConfetti] = useState(true);
  const [isRolling, setIsRolling] = useState(true);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [hasStartedCelebration, setHasStartedCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('🎉 Amazing! 🎉');
  const celebrationInProgress = useRef(false); // Prevent concurrent celebrations
  
  const { ttsSettings, isLoaded: ttsSettingsLoaded, getVoiceForTherapist, callTTS } = useTTSSettings(therapistName);
  
  // Use ref to access latest onComplete value in useEffect
  const onCompleteRef = useRef(onComplete);
  
  // Update ref when value changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);



  // Effect 2: Run Celebration (Single Responsibility)
  useEffect(() => {
    if (!ttsSettingsLoaded || hasStartedCelebration) {
      return;
    }
    
    if (celebrationInProgress.current) {
      console.log('🎊 Celebration already in progress, skipping');
      return;
    }
    
    const runCelebration = async () => {
      console.log('🎊 Starting celebration TTS - TTS settings loaded');
      console.log('🎊 TTS Settings:', ttsSettings);
      setHasStartedCelebration(true);
      celebrationInProgress.current = true;
      
      // Get personalized celebration messages
      const progressLevel = calculateProgressLevel(correctAnswers);
      
      // Get visual celebration message
      const visualMessage = await getCelebrationMessage({
        messageType: 'celebration_visual',
        therapistName,
        messageCategory: 'correct_answer',
        progressLevel,
        childName: 'friend'
      });
      setCelebrationMessage(visualMessage);
      
      // Immediately stop any existing audio
      stopAllAudio();
      
      // Hide confetti after animation
      const confettiTimer = setTimeout(() => setShowConfetti(false), 2000);
      
      // Stop rolling animation
      const rollingTimer = setTimeout(() => setIsRolling(false), 1500);
      
      // Play celebration TTS
      try {
        setIsPlayingTTS(true);
        console.log(`🎊 Playing celebration with ${therapistName}'s voice: ${ttsSettings.voice}`);
        console.log(`🎊 TTS Provider: ${ttsSettings.provider || 'openai'}`);
        
        // Stop any previous audio
        stopGlobalAudio();
        
        // Use the new TTS hook to call the appropriate provider
        console.log(`🎯 Celebration TTS for ${therapistName}: voice=${ttsSettings.voice}, provider=${ttsSettings.provider || 'openai'}`);
        
        // Use the same celebration_visual message for both visual and audio
        const ttsMessage = visualMessage;
        
        console.log(`🎊 TTS Message to play: "${ttsMessage}"`);
        
        const response = await callTTS(ttsMessage, ttsSettings.voice, ttsSettings.speed);

        console.log(`🎊 TTS Response:`, {
          success: !response.error,
          hasAudioContent: !!response.data?.audioContent,
          audioLength: response.data?.audioContent?.length || 0,
          error: response.error
        });

        if (response.data?.audioContent) {
          console.log(`🎊 Playing TTS audio with length: ${response.data.audioContent.length}`);
          await playGlobalTTS(response.data.audioContent, 'MiniCelebration');
          
          // Wait for TTS to completely finish before proceeding
          setTimeout(() => {
              console.log('🎊 TTS finished, celebration complete');
              setIsPlayingTTS(false);
              celebrationInProgress.current = false;
              // Add a small delay after TTS finishes before moving to next question
              setTimeout(() => {
              onCompleteRef.current();
              }, 1000);
          }, 3000); // Standard delay for celebration TTS
        } else {
          console.warn('🎊 No TTS audio content received, proceeding without audio');
          celebrationInProgress.current = false;
          // If no TTS, proceed after standard delay
          setTimeout(() => {
            setIsPlayingTTS(false);
            onCompleteRef.current();
          }, 3000);
        }
      } catch (error) {
        console.error('🎊 TTS error in celebration:', error);
        celebrationInProgress.current = false;
        // If TTS fails, proceed after standard delay
        setTimeout(() => {
          setIsPlayingTTS(false);
          onCompleteRef.current();
        }, 3000);
      }
    };

    runCelebration();
  }, [ttsSettingsLoaded, hasStartedCelebration, correctAnswers, therapistName, ttsSettings, callTTS]);

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
          className={`w-64 h-64 transition-all duration-1500 ${isRolling ? 'animate-bounce' : ''}`}
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
                console.error('Error loading character image:', selectedCharacter.image_url);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-sm">No character</span>
            </div>
          )}
        </div>
      </div>

      {/* Celebration Message */}
      <div className="text-center animate-fade-in">
        <h2 className="text-4xl font-bold text-emerald-600 mb-4 animate-pulse">
          {celebrationMessage}
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

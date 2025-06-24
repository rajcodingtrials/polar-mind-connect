
import React, { useEffect, useState } from 'react';

interface ProgressCharacterProps {
  correctAnswers: number;
  totalQuestions: number;
  questionType?: string;
}

const ProgressCharacter = ({ correctAnswers, totalQuestions, questionType }: ProgressCharacterProps) => {
  // Calculate progress percentage based on 5 questions max
  const maxQuestions = 5;
  const displayCorrect = Math.min(correctAnswers, maxQuestions);
  const progressPercentage = (displayCorrect / maxQuestions) * 100;
  
  // Calculate opacity - starts at 0.2 and goes to 1.0 as progress increases
  const opacity = Math.max(0.2, Math.min(1, (displayCorrect / maxQuestions) * 0.8 + 0.2));
  
  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  const [justReachedFive, setJustReachedFive] = useState(false);

  // Trigger confetti when reaching 5 correct answers
  useEffect(() => {
    if (correctAnswers === maxQuestions && !justReachedFive) {
      setJustReachedFive(true);
      setShowConfetti(true);
      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [correctAnswers, maxQuestions, justReachedFive]);
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 shadow-xl border-4 border-purple-200 w-full mx-auto relative overflow-hidden">
      {/* Full Page Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 opacity-90"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#e74c3c', '#9b59b6', '#2ecc71', '#f1c40f'][Math.floor(Math.random() * 8)],
                animation: `confetti-fall ${2 + Math.random() * 2}s linear forwards`,
                animationDelay: `${Math.random() * 1}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0%'
              }}
            />
          ))}
        </div>
      )}

      {/* CSS for confetti animation */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg) scale(1);
            opacity: 1;
          }
          50% {
            opacity: 1;
            transform: translateY(50vh) rotate(360deg) scale(1.2);
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>

      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-purple-800 mb-2">🌟 Progress Buddy 🌟</h3>
        <p className="text-base text-purple-600 font-semibold">
          {displayCorrect} of {maxQuestions} correct!
        </p>
        <div className="w-full bg-purple-200 rounded-full h-3 mt-3 border-2 border-purple-300">
          <div 
            className="bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 h-full rounded-full transition-all duration-1000 shadow-inner"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        {progressPercentage > 0 && (
          <p className="text-xs text-purple-500 mt-2 animate-pulse">
            ✨ You're doing amazing! ✨
          </p>
        )}
      </div>
      
      <div className="flex justify-center">
        <div className="relative w-48 h-48 transition-all duration-1000">
          <img 
            src="/lovable-uploads/5197a6a0-9d6b-4c95-b80e-db71d2e8e099.png"
            alt="Tiger Progress Buddy"
            className="w-full h-full object-contain rounded-lg transition-all duration-1000"
            style={{ 
              opacity: opacity,
              filter: `brightness(${0.5 + (opacity * 0.5)}) saturate(${opacity})`
            }}
          />
          {/* Overlay for grayscale effect when minimal progress */}
          {correctAnswers < 2 && (
            <div className="absolute inset-0 bg-gray-400 bg-opacity-30 rounded-lg transition-all duration-1000"></div>
          )}
        </div>
      </div>
      
      {correctAnswers >= maxQuestions && (
        <div className="text-center mt-4 animate-bounce">
          <div className="text-3xl mb-2">🎉🎊🌟</div>
          <p className="text-lg font-bold text-emerald-600 mb-2">
            Fantastic Work!
          </p>
          <p className="text-xs text-emerald-500">
            Your tiger buddy is bright and colorful now!
          </p>
        </div>
      )}
      
      {correctAnswers > 0 && correctAnswers < maxQuestions && (
        <div className="text-center mt-3">
          <p className="text-xs text-purple-500 animate-pulse font-medium">
            🎨 Getting brighter! Keep going!
          </p>
        </div>
      )}
      
      {correctAnswers === 0 && (
        <div className="text-center mt-3">
          <p className="text-xs text-purple-600 font-medium">
            Help your tiger buddy get colorful by answering questions! 🐅
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressCharacter;

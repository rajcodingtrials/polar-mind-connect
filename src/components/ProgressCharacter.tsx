
import React from 'react';

interface ProgressCharacterProps {
  correctAnswers: number;
  totalQuestions: number;
  questionType?: string;
}

const ProgressCharacter = ({ correctAnswers, totalQuestions, questionType }: ProgressCharacterProps) => {
  // Calculate progress percentage and opacity
  const progressPercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const opacity = Math.max(0.2, Math.min(1, (correctAnswers / Math.max(totalQuestions, 1)) * 1));
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 shadow-xl border-4 border-purple-200 w-full mx-auto">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-purple-800 mb-2">🌟 Progress Buddy 🌟</h3>
        <p className="text-base text-purple-600 font-semibold">
          {correctAnswers} of {totalQuestions} correct!
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
          {/* Overlay for grayscale effect when no progress */}
          {correctAnswers === 0 && (
            <div className="absolute inset-0 bg-gray-400 bg-opacity-50 rounded-lg transition-all duration-1000"></div>
          )}
        </div>
      </div>
      
      {correctAnswers === totalQuestions && totalQuestions > 0 && (
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
      
      {correctAnswers > 0 && correctAnswers < totalQuestions && (
        <div className="text-center mt-3">
          <p className="text-xs text-purple-500 animate-pulse font-medium">
            🎨 Getting brighter! Keep going!
          </p>
        </div>
      )}
      
      {correctAnswers === 0 && totalQuestions > 0 && (
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

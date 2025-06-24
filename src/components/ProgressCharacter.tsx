
import React from 'react';

interface ProgressCharacterProps {
  correctAnswers: number;
  totalQuestions: number;
  questionType?: string;
}

const ProgressCharacter = ({ correctAnswers, totalQuestions, questionType }: ProgressCharacterProps) => {
  // Calculate which parts should be colored based on progress
  const progressPercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const partsToColor = Math.floor((correctAnswers / Math.max(totalQuestions, 1)) * 6); // 6 colorizable parts
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200 min-w-[200px]">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-blue-800 mb-1">Progress Buddy</h3>
        <p className="text-sm text-blue-600">
          {correctAnswers} of {totalQuestions} correct!
        </p>
        <div className="w-full bg-blue-100 rounded-full h-2 mt-2">
          <div 
            className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <svg
          width="120"
          height="140"
          viewBox="0 0 120 140"
          className="transition-all duration-500"
        >
          {/* Fox Body */}
          <ellipse
            cx="60"
            cy="100"
            rx="25"
            ry="30"
            fill={partsToColor >= 1 ? "#FF8C42" : "#E5E5E5"}
            className="transition-all duration-1000"
          />
          
          {/* Fox Head */}
          <circle
            cx="60"
            cy="60"
            r="20"
            fill={partsToColor >= 2 ? "#FF8C42" : "#E5E5E5"}
            className="transition-all duration-1000"
          />
          
          {/* Left Ear */}
          <path
            d="M45 45 L50 25 L55 45 Z"
            fill={partsToColor >= 3 ? "#FF8C42" : "#E5E5E5"}
            className="transition-all duration-1000"
          />
          
          {/* Right Ear */}
          <path
            d="M65 45 L70 25 L75 45 Z"
            fill={partsToColor >= 4 ? "#FF8C42" : "#E5E5E5"}
            className="transition-all duration-1000"
          />
          
          {/* Left Eye */}
          <circle
            cx="53"
            cy="55"
            r="3"
            fill={partsToColor >= 5 ? "#2D3748" : "#B0B0B0"}
            className="transition-all duration-1000"
          />
          
          {/* Right Eye */}
          <circle
            cx="67"
            cy="55"
            r="3"
            fill={partsToColor >= 5 ? "#2D3748" : "#B0B0B0"}
            className="transition-all duration-1000"
          />
          
          {/* Nose */}
          <path
            d="M58 62 L60 65 L62 62 Z"
            fill={partsToColor >= 6 ? "#2D3748" : "#B0B0B0"}
            className="transition-all duration-1000"
          />
          
          {/* Tail */}
          <ellipse
            cx="85"
            cy="95"
            rx="8"
            ry="20"
            fill={partsToColor >= 6 ? "#FF8C42" : "#E5E5E5"}
            transform="rotate(30 85 95)"
            className="transition-all duration-1000"
          />
          
          {/* White chest patch */}
          <ellipse
            cx="60"
            cy="110"
            rx="8"
            ry="12"
            fill={partsToColor >= 3 ? "#FFFFFF" : "#F5F5F5"}
            className="transition-all duration-1000"
          />
          
          {/* Ear tips (black) */}
          <path
            d="M48 35 L50 25 L52 35 Z"
            fill={partsToColor >= 4 ? "#2D3748" : "#B0B0B0"}
            className="transition-all duration-1000"
          />
          <path
            d="M68 35 L70 25 L72 35 Z"
            fill={partsToColor >= 4 ? "#2D3748" : "#B0B0B0"}
            className="transition-all duration-1000"
          />
          
          {/* Tail tip (white) */}
          <ellipse
            cx="90"
            cy="85"
            rx="4"
            ry="8"
            fill={partsToColor >= 6 ? "#FFFFFF" : "#F5F5F5"}
            transform="rotate(30 90 85)"
            className="transition-all duration-1000"
          />
        </svg>
      </div>
      
      {correctAnswers === totalQuestions && totalQuestions > 0 && (
        <div className="text-center mt-4">
          <div className="text-2xl animate-bounce">🎉</div>
          <p className="text-sm font-bold text-emerald-600">
            Great job! Your fox friend is complete!
          </p>
        </div>
      )}
      
      {correctAnswers > 0 && (
        <div className="text-center mt-2">
          <p className="text-xs text-blue-500 animate-pulse">
            ✨ New color unlocked!
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressCharacter;


import React from 'react';

interface ProgressCharacterProps {
  correctAnswers: number;
  totalQuestions: number;
  questionType?: string;
}

const ProgressCharacter = ({ correctAnswers, totalQuestions, questionType }: ProgressCharacterProps) => {
  // Calculate which parts should be colored based on progress
  const progressPercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const partsToColor = Math.floor((correctAnswers / Math.max(totalQuestions, 1)) * 8); // 8 colorizable parts
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 lg:p-8 shadow-xl border-4 border-purple-200 w-full mx-auto">
      <div className="text-center mb-4 lg:mb-6">
        <h3 className="text-xl lg:text-2xl font-bold text-purple-800 mb-2">🌟 Progress Buddy 🌟</h3>
        <p className="text-base lg:text-lg text-purple-600 font-semibold">
          {correctAnswers} of {totalQuestions} correct!
        </p>
        <div className="w-full bg-purple-200 rounded-full h-3 lg:h-4 mt-3 border-2 border-purple-300">
          <div 
            className="bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 h-full rounded-full transition-all duration-1000 shadow-inner"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        {progressPercentage > 0 && (
          <p className="text-xs lg:text-sm text-purple-500 mt-2 animate-pulse">
            ✨ You're doing amazing! ✨
          </p>
        )}
      </div>
      
      <div className="flex justify-center">
        <svg
          width="140"
          height="140"
          viewBox="0 0 160 160"
          className="w-32 h-32 lg:w-40 lg:h-40 transition-all duration-500 drop-shadow-lg"
        >
          {/* Tiger Body */}
          <ellipse
            cx="80"
            cy="120"
            rx="35"
            ry="25"
            fill={partsToColor >= 1 ? "#FF8C42" : "#D1D5DB"}
            className="transition-all duration-1000"
          />
          
          {/* Tiger Head */}
          <circle
            cx="80"
            cy="80"
            r="30"
            fill={partsToColor >= 2 ? "#FF8C42" : "#D1D5DB"}
            className="transition-all duration-1000"
          />
          
          {/* Left Ear */}
          <ellipse
            cx="65"
            cy="55"
            rx="8"
            ry="12"
            fill={partsToColor >= 3 ? "#FF8C42" : "#D1D5DB"}
            className="transition-all duration-1000"
          />
          
          {/* Right Ear */}
          <ellipse
            cx="95"
            cy="55"
            rx="8"
            ry="12"
            fill={partsToColor >= 3 ? "#FF8C42" : "#D1D5DB"}
            className="transition-all duration-1000"
          />
          
          {/* Inner Left Ear */}
          <ellipse
            cx="65"
            cy="57"
            rx="4"
            ry="6"
            fill={partsToColor >= 4 ? "#FFB570" : "#E5E7EB"}
            className="transition-all duration-1000"
          />
          
          {/* Inner Right Ear */}
          <ellipse
            cx="95"
            cy="57"
            rx="4"
            ry="6"
            fill={partsToColor >= 4 ? "#FFB570" : "#E5E7EB"}
            className="transition-all duration-1000"
          />
          
          {/* Tiger Stripes on Head */}
          <path
            d="M70 65 Q75 70 70 75"
            stroke={partsToColor >= 5 ? "#E65100" : "#9CA3AF"}
            strokeWidth="3"
            fill="none"
            className="transition-all duration-1000"
          />
          <path
            d="M90 65 Q85 70 90 75"
            stroke={partsToColor >= 5 ? "#E65100" : "#9CA3AF"}
            strokeWidth="3"
            fill="none"
            className="transition-all duration-1000"
          />
          
          {/* Left Eye */}
          <circle
            cx="70"
            cy="75"
            r="6"
            fill={partsToColor >= 6 ? "#FFFFFF" : "#F3F4F6"}
            className="transition-all duration-1000"
          />
          <circle
            cx="70"
            cy="75"
            r="4"
            fill={partsToColor >= 6 ? "#2D3748" : "#9CA3AF"}
            className="transition-all duration-1000"
          />
          <circle
            cx="71"
            cy="74"
            r="1.5"
            fill="#FFFFFF"
            className="transition-all duration-1000"
          />
          
          {/* Right Eye */}
          <circle
            cx="90"
            cy="75"
            r="6"
            fill={partsToColor >= 6 ? "#FFFFFF" : "#F3F4F6"}
            className="transition-all duration-1000"
          />
          <circle
            cx="90"
            cy="75"
            r="4"
            fill={partsToColor >= 6 ? "#2D3748" : "#9CA3AF"}
            className="transition-all duration-1000"
          />
          <circle
            cx="91"
            cy="74"
            r="1.5"
            fill="#FFFFFF"
            className="transition-all duration-1000"
          />
          
          {/* Nose */}
          <path
            d="M78 85 L80 88 L82 85 Z"
            fill={partsToColor >= 7 ? "#FF6B9D" : "#9CA3AF"}
            className="transition-all duration-1000"
          />
          
          {/* Mouth */}
          <path
            d="M80 88 Q75 93 70 90"
            stroke={partsToColor >= 7 ? "#2D3748" : "#9CA3AF"}
            strokeWidth="2"
            fill="none"
            className="transition-all duration-1000"
          />
          <path
            d="M80 88 Q85 93 90 90"
            stroke={partsToColor >= 7 ? "#2D3748" : "#9CA3AF"}
            strokeWidth="2"
            fill="none"
            className="transition-all duration-1000"
          />
          
          {/* White chest patch */}
          <ellipse
            cx="80"
            cy="125"
            rx="15"
            ry="18"
            fill={partsToColor >= 8 ? "#FFFFFF" : "#F9FAFB"}
            className="transition-all duration-1000"
          />
          
          {/* Tiger Stripes on Body */}
          <path
            d="M60 110 Q65 115 60 120"
            stroke={partsToColor >= 8 ? "#E65100" : "#9CA3AF"}
            strokeWidth="3"
            fill="none"
            className="transition-all duration-1000"
          />
          <path
            d="M100 110 Q95 115 100 120"
            stroke={partsToColor >= 8 ? "#E65100" : "#9CA3AF"}
            strokeWidth="3"
            fill="none"
            className="transition-all duration-1000"
          />
        </svg>
      </div>
      
      {correctAnswers === totalQuestions && totalQuestions > 0 && (
        <div className="text-center mt-4 lg:mt-6 animate-bounce">
          <div className="text-3xl lg:text-4xl mb-2">🎉🎊🌟</div>
          <p className="text-lg lg:text-xl font-bold text-emerald-600 mb-2">
            Fantastic Work!
          </p>
          <p className="text-xs lg:text-sm text-emerald-500">
            Your tiger buddy is complete and so proud of you!
          </p>
        </div>
      )}
      
      {correctAnswers > 0 && correctAnswers < totalQuestions && (
        <div className="text-center mt-3 lg:mt-4">
          <p className="text-xs lg:text-sm text-purple-500 animate-pulse font-medium">
            🎨 New colors unlocked! Keep going!
          </p>
        </div>
      )}
      
      {correctAnswers === 0 && totalQuestions > 0 && (
        <div className="text-center mt-3 lg:mt-4">
          <p className="text-xs lg:text-sm text-purple-600 font-medium">
            Help your tiger buddy get colorful by answering questions! 🐅
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressCharacter;

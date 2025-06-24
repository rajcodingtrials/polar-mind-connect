
import React from 'react';

interface ProgressCharacterProps {
  correctAnswers: number;
  totalQuestions: number;
  questionType?: string;
}

const ProgressCharacter = ({ correctAnswers, totalQuestions, questionType }: ProgressCharacterProps) => {
  // Calculate progress percentage
  const progressPercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  
  // Character is only revealed after 5 correct answers
  const isCharacterRevealed = correctAnswers >= 5;
  
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
          {isCharacterRevealed ? (
            <img 
              src="/lovable-uploads/5197a6a0-9d6b-4c95-b80e-db71d2e8e099.png"
              alt="Tiger Progress Buddy"
              className="w-full h-full object-contain rounded-lg transition-all duration-1000"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-400">
              <div className="text-center text-gray-600">
                <div className="text-4xl mb-2">🔒</div>
                <p className="text-sm font-medium">Mystery Character</p>
                <p className="text-xs">Get {5 - correctAnswers} more correct!</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {correctAnswers === totalQuestions && totalQuestions > 0 && isCharacterRevealed && (
        <div className="text-center mt-4 animate-bounce">
          <div className="text-3xl mb-2">🎉🎊🌟</div>
          <p className="text-lg font-bold text-emerald-600 mb-2">
            Fantastic Work!
          </p>
          <p className="text-xs text-emerald-500">
            You've completed all questions and revealed your tiger buddy!
          </p>
        </div>
      )}
      
      {isCharacterRevealed && correctAnswers < totalQuestions && (
        <div className="text-center mt-3">
          <p className="text-xs text-emerald-500 animate-pulse font-medium">
            🎉 Character revealed! Keep going for more achievements!
          </p>
        </div>
      )}
      
      {!isCharacterRevealed && (
        <div className="text-center mt-3">
          <p className="text-xs text-purple-600 font-medium">
            Answer {5 - correctAnswers} more questions correctly to reveal your mystery character! 🎯
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressCharacter;

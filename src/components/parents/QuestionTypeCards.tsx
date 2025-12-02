import React from 'react';
import { BookOpen, MessageCircle, Building, Heart, User } from 'lucide-react';

type QuestionType = string;

interface QuestionTypeConfig {
  value: QuestionType;
  label: string;
  description: string;
  color: string;
  textColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface QuestionTypeCardsProps {
  questionTypes: QuestionTypeConfig[];
  hoveredActivityType: QuestionType | null;
  showLessonsPanel: boolean;
  onActivityClick: (questionType: QuestionType) => void;
  cardRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
}

const QuestionTypeCards: React.FC<QuestionTypeCardsProps> = ({
  questionTypes,
  hoveredActivityType,
  showLessonsPanel,
  onActivityClick,
  cardRefs,
}) => {
  return (
    <div className={`grid gap-8 ${showLessonsPanel ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} justify-items-center`}>
      {questionTypes.map((type) => {
        const IconComponent = type.icon;
        const isSelected = showLessonsPanel && hoveredActivityType === type.value;
        const isOtherHovered = showLessonsPanel && hoveredActivityType && hoveredActivityType !== type.value;
        
        const borderRadiusClass = 'rounded-xl';
        
        return (
          <div
            key={type.value}
            ref={(el) => {
              cardRefs.current[type.value] = el;
            }}
            className={`${type.color} ${type.textColor} ${borderRadiusClass} p-4 sm:p-6 cursor-pointer ${showLessonsPanel ? 'border-2 border-gray-300' : 'border-3'} transition-all duration-300 ease-out h-[200px] sm:h-[240px] flex flex-col items-center justify-center ${
              isOtherHovered 
                ? 'opacity-40' 
                : showLessonsPanel 
                  ? 'hover:opacity-80' 
                  : 'hover:shadow-xl hover:border-white'
            } ${showLessonsPanel ? 'w-full max-w-[320px] sm:w-80' : 'w-full max-w-80'}`}
            onClick={() => onActivityClick(type.value)}
          >
            <div className="flex flex-col items-center justify-center text-center h-full">
              <div className="bg-white rounded-full p-3 mb-3 shadow-lg">
                <IconComponent className={`w-6 h-6 ${type.textColor}`} />
              </div>
              <h3 className="font-bold text-lg mb-2">{type.label}{isSelected ? ' ✨' : ''}</h3>
              <p className="text-xs opacity-90 leading-relaxed">{type.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuestionTypeCards;


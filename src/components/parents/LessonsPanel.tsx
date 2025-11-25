import React from 'react';
import { BookOpen } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type QuestionType = Database['public']['Enums']['question_type_enum'];

interface QuestionTypeConfig {
  value: QuestionType;
  label: string;
  color: string;
  textColor: string;
}

interface Lesson {
  id: string;
  name: string;
  description: string | null;
  question_type: QuestionType;
  level: string;
}

interface LessonsPanelProps {
  selectedType: QuestionTypeConfig | null;
  lessons: Lesson[];
  questionCounts: Record<string, number>;
  onClose: () => void;
  onLessonSelect: (lessonId: string, questionType: QuestionType) => void;
}

const LessonsPanel: React.FC<LessonsPanelProps> = ({
  selectedType,
  lessons,
  questionCounts,
  onClose,
  onLessonSelect,
}) => {
  if (!selectedType) return null;

  const filteredLessons = lessons.filter(lesson => {
    // Safety check: ensure lesson has question_type field
    if (!lesson || !lesson.question_type) {
      return false;
    }
    
    return String(lesson.question_type) === String(selectedType.value);
  });
  
  const difficultyIcons = { beginner: '⭐', intermediate: '⭐⭐', advanced: '⭐⭐⭐' };

  return (
    <div className={`${selectedType.color.replace('hover:bg-', 'bg-').replace('border-', '')} rounded-2xl shadow-xl border-3 border-white p-6 h-full relative overflow-y-auto`}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors bg-transparent rounded-full p-1 z-10"
      >
        ✕
      </button>
      <div className="mb-6">
        <h3 className={`text-2xl font-bold mb-2 ${selectedType.textColor}`}>
          {selectedType.label} Lessons
        </h3>
        <p className={`${selectedType.textColor} opacity-80`}>Choose a specific lesson</p>
      </div>
      
      <div className="space-y-4">
        {filteredLessons.map((lesson, idx) => {
          const lessonColors = [
            'bg-white bg-opacity-60 hover:bg-opacity-80 border-white border-opacity-50',
            'bg-white bg-opacity-60 hover:bg-opacity-80 border-white border-opacity-50',
            'bg-white bg-opacity-60 hover:bg-opacity-80 border-white border-opacity-50',
            'bg-white bg-opacity-60 hover:bg-opacity-80 border-white border-opacity-50',
            'bg-white bg-opacity-60 hover:bg-opacity-80 border-white border-opacity-50',
          ];
          const colorClass = lessonColors[idx % lessonColors.length];

          return (
            <div
              key={lesson.id}
              className={`${colorClass} border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md`}
              onClick={() => onLessonSelect(lesson.id, selectedType.value)}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-full p-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{lesson.name}</h4>
                  {lesson.description && (
                    <p className="text-sm text-gray-600">{lesson.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {difficultyIcons[lesson.level as keyof typeof difficultyIcons] || '⭐'} {lesson.level}
                    </span>
                  </div>
                </div>
                <span className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  {questionCounts[lesson.id] || 0} questions
                </span>
              </div>
            </div>
          );
        })}
        
        {filteredLessons.length === 0 && (
          <div className="text-center text-gray-600 py-8">
            <p>No specific lessons available yet.</p>
            <p className="text-sm">You can practice with all available questions!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonsPanel;


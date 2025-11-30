import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Star, ArrowLeft, Play, MessageCircle, Building, Heart, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Constants } from '@/integrations/supabase/types';
import { getQuestionTypeLabel, getQuestionTypeDescription } from '@/utils/questionTypes';

type QuestionType = Database['public']['Enums']['question_type_enum'];

interface Lesson {
  id: string;
  name: string;
  description: string | null;
  question_type: QuestionType;
  difficulty_level: string;
  is_active: boolean;
  created_at: string;
}

interface QuestionTypeConfig {
  value: QuestionType;
  label: string;
  description: string;
  color: string;
  textColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface LessonSelectionProps {
  selectedQuestionType: QuestionType;
  therapistName: string;
  onLessonSelect: (lessonId: string | null) => void;
  onBack: () => void;
  onQuestionTypeChange?: (questionType: QuestionType) => void;
  questionTypes?: QuestionTypeConfig[];
}

const LessonSelection: React.FC<LessonSelectionProps> = ({
  selectedQuestionType,
  therapistName,
  onLessonSelect,
  onBack,
  onQuestionTypeChange,
  questionTypes: propQuestionTypes
}) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [internalSelectedQuestionType, setInternalSelectedQuestionType] = useState<QuestionType>(selectedQuestionType);
  const [availableQuestionTypes, setAvailableQuestionTypes] = useState<QuestionType[]>([]);
  const [questionTypesConfig, setQuestionTypesConfig] = useState<QuestionTypeConfig[]>([]);

  // Styles array - contains color, textColor (fontColor), icon, and activity colors
  const questionTypeStyles = [
    {
      color: 'bg-blue-100 hover:bg-blue-200 border-blue-200',
      textColor: 'text-blue-800',
      icon: BookOpen,
    },
    {
      color: 'bg-amber-100 hover:bg-amber-200 border-amber-200',
      textColor: 'text-amber-800',
      icon: MessageCircle,
    },
    {
      color: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-200',
      textColor: 'text-emerald-800',
      icon: Building,
    },
    {
      color: 'bg-orange-100 hover:bg-orange-200 border-orange-200',
      textColor: 'text-orange-800',
      icon: Heart,
    },
    {
      color: 'bg-rose-100 hover:bg-rose-200 border-rose-200',
      textColor: 'text-rose-800',
      icon: User,
    },
    {
      color: 'bg-purple-100 hover:bg-purple-200 border-purple-200',
      textColor: 'text-purple-800',
      icon: MessageCircle,
    },
    {
      color: 'bg-pink-100 hover:bg-pink-200 border-pink-200',
      textColor: 'text-pink-800',
      icon: Building,
    },
    {
      color: 'bg-cyan-100 hover:bg-cyan-200 border-cyan-200',
      textColor: 'text-cyan-800',
      icon: Heart,
    },
  ];

  // Helper function to format question type enum value to readable label
  const formatQuestionTypeLabel = (questionType: QuestionType): string => {
    return questionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to generate description from question type
  const generateDescription = (questionType: QuestionType): string => {
    const { getQuestionTypeDescription } = require('@/utils/questionTypes');
    return getQuestionTypeDescription(questionType);
  };

  // Fetch distinct question types from Supabase
  useEffect(() => {
    const fetchQuestionTypes = async () => {
      try {
        // Get distinct question types from lessons_v2 table
        const { data: lessonsData, error } = await supabase
          .from('lessons_v2' as any)
          .select('question_type')
          .eq('is_verified', true);

        if (error) {
          console.error('Error fetching question types:', error);
          // Fallback to enum values from Constants
          const enumTypes = [...Constants.public.Enums.question_type_enum] as QuestionType[];
          setAvailableQuestionTypes(enumTypes);
        } else if (lessonsData && lessonsData.length > 0) {
          // Get unique question types
          const uniqueTypes = Array.from(new Set(lessonsData.map((l: any) => l.question_type))) as QuestionType[];
          setAvailableQuestionTypes(uniqueTypes);
        } else {
          // Fallback to enum values from Constants if no lessons found
          const enumTypes = [...Constants.public.Enums.question_type_enum] as QuestionType[];
          setAvailableQuestionTypes(enumTypes);
        }
      } catch (error) {
        console.error('Error in fetchQuestionTypes:', error);
        // Fallback to enum values from Constants
        const enumTypes = [...Constants.public.Enums.question_type_enum] as QuestionType[];
        setAvailableQuestionTypes(enumTypes);
      }
    };

    fetchQuestionTypes();
  }, []);

  // Build question types config from available types and styles
  useEffect(() => {
    if (availableQuestionTypes.length > 0) {
      const configs: QuestionTypeConfig[] = availableQuestionTypes.map((questionType, index) => {
        // Use modulo to cycle through styles
        const styleIndex = index % questionTypeStyles.length;
        const style = questionTypeStyles[styleIndex];
        
        return {
          value: questionType,
          label: formatQuestionTypeLabel(questionType),
          description: generateDescription(questionType),
          color: style.color,
          textColor: style.textColor,
          icon: style.icon,
        };
      });
      setQuestionTypesConfig(configs);
    }
  }, [availableQuestionTypes]);

  const questionTypes = propQuestionTypes || questionTypesConfig;

  // Color scheme matching the activity type cards - now uses styles array with modulo
  const getActivityColors = (questionType: QuestionType) => {
    const typeIndex = availableQuestionTypes.indexOf(questionType);
    if (typeIndex >= 0) {
      const styleIndex = typeIndex % questionTypeStyles.length;
      const style = questionTypeStyles[styleIndex];
      return {
        color: style.color,
        textColor: style.textColor,
        icon: style.icon
      };
    }
    // Default fallback
    return {
      color: 'bg-gray-100 hover:bg-gray-200 border-gray-200',
      textColor: 'text-gray-800',
      icon: BookOpen
    };
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 border-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    advanced: 'bg-red-100 text-red-800 border-red-200'
  };

  const difficultyIcons = {
    beginner: '⭐',
    intermediate: '⭐⭐',
    advanced: '⭐⭐⭐'
  };

  // Color palette for unique lesson cards
  const lessonColors = [
    {
      color: 'bg-blue-100 hover:bg-blue-200 border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-800',
    },
    {
      color: 'bg-amber-100 hover:bg-amber-200 border-amber-200',
      textColor: 'text-amber-800',
      iconColor: 'text-amber-800',
    },
    {
      color: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-200',
      textColor: 'text-emerald-800',
      iconColor: 'text-emerald-800',
    },
    {
      color: 'bg-orange-100 hover:bg-orange-200 border-orange-200',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-800',
    },
    {
      color: 'bg-pink-100 hover:bg-pink-200 border-pink-200',
      textColor: 'text-pink-800',
      iconColor: 'text-pink-800',
    },
    {
      color: 'bg-purple-100 hover:bg-purple-200 border-purple-200',
      textColor: 'text-purple-800',
      iconColor: 'text-purple-800',
    },
    {
      color: 'bg-cyan-100 hover:bg-cyan-200 border-cyan-200',
      textColor: 'text-cyan-800',
      iconColor: 'text-cyan-800',
    },
  ];

  // Update internal state when prop changes
  useEffect(() => {
    setInternalSelectedQuestionType(selectedQuestionType);
  }, [selectedQuestionType]);

  useEffect(() => {
    fetchLessons();
  }, [internalSelectedQuestionType]);

  const fetchLessons = async () => {
    setIsLoading(true);
    try {
      // Fetch lessons for the selected question type
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('question_type', internalSelectedQuestionType)
        .eq('is_active', true)
        .order('name');

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
        setLessons([]);
        return;
      }

      setLessons(lessonsData || []);

      // Fetch question counts for each lesson
      if (lessonsData && lessonsData.length > 0) {
        const counts: Record<string, number> = {};
        
        for (const lesson of lessonsData) {
          const { count, error: countError } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('lesson_id', lesson.id);

          if (!countError) {
            counts[lesson.id] = count || 0;
          } else {
            counts[lesson.id] = 0;
          }
        }
        
        setQuestionCounts(counts);
      }
    } catch (error) {
      console.error('Error in fetchLessons:', error);
      setLessons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLessonSelect = (lessonId: string) => {
    setSelectedLesson(lessonId);
  };

  const handleStartLesson = () => {
    onLessonSelect(selectedLesson);
  };

  const handleStartWithoutLesson = () => {
    onLessonSelect(null);
  };

  const handleQuestionTypeClick = (questionType: QuestionType) => {
    setInternalSelectedQuestionType(questionType);
    setSelectedLesson(''); // Reset selected lesson when changing question type
    if (onQuestionTypeChange) {
      onQuestionTypeChange(questionType);
    }
  };

  const getActivityName = (type: QuestionType) => {
    return getQuestionTypeLabel(type);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col p-6">
        <div className="flex-grow flex flex-col items-center justify-center max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-purple-200 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex justify-center items-center py-8">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
              <p className="text-lg text-gray-700">Loading lessons...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    //<div className="min-h-screen flex flex-col p-6">
    <div className="min-w-screen min-h-screen flex flex-col p-6">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-6 w-full -mx-6 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-800 mb-2 sm:mb-4">
          Choose Your Lesson with {therapistName}!
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Select a question type and then choose a lesson
        </p>
      </div>

      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 text-lg font-medium bg-white px-6 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Activity Types
        </button>
      </div>

      {/* Two Panel Layout: 30% left (question types) and 60% right (lessons) */}
      <div className="flex-grow flex flex-col lg:flex-row gap-4 lg:gap-6 w-full">
        {/* Left Panel - Question Types (30%) */}
        <div className="w-full lg:w-[30%] flex flex-col flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Activity Types</h2>
          <div className="flex flex-col gap-4">
            {questionTypes.map((type) => {
              const IconComponent = type.icon;
              const isSelected = internalSelectedQuestionType === type.value;
              
              return (
                <div
                  key={type.value}
                  className={`${type.color} ${type.textColor} rounded-xl border-3 p-6 cursor-pointer transition-all duration-300 ${
                    isSelected ? 'ring-4 ring-purple-300 shadow-xl' : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleQuestionTypeClick(type.value)}
                >
                  <div className="flex flex-col items-center text-center">
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
        </div>

        {/* Right Panel - Lessons (70%) */}
        <div className="w-full lg:w-[70%] flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {getActivityName(internalSelectedQuestionType)} Lessons
          </h2>

          {/* Lesson Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
          {/* Practice All Questions Option */}
          {(() => {
            // Dedicated neutral color for Practice All Questions
            const color = {
              color: 'bg-gray-100 hover:bg-gray-200 border-gray-200',
              textColor: 'text-gray-800',
              iconColor: 'text-gray-800',
            };
            const IconComponent = BookOpen;
            return (
              <div
                className={`${color.color} ${color.textColor} rounded-3xl border-3 border-white shadow-xl w-full max-w-[320px] sm:w-80 h-[380px] sm:h-[420px] flex flex-col justify-between items-center p-6 sm:p-8 cursor-pointer hover:scale-105 transition-all duration-[1.2s] select-none ${
                  selectedLesson === 'all' ? 'ring-4 ring-purple-300' : ''
                }`}
                onClick={() => handleLessonSelect('all')}
              >
                <div className="flex flex-col items-center text-center flex-1 w-full">
                  <div className="bg-white rounded-full p-4 mb-4 shadow-lg">
                    <IconComponent className={`w-8 h-8 ${color.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Practice All Questions</h3>
                  <p className="text-sm opacity-90 leading-relaxed mb-2 mt-4">
                    Practice with all available questions for this activity type
                  </p>
                </div>
                <div className="w-full flex flex-col items-center gap-2 mt-2">
                  {/* Removed question count and difficulty info */}
                </div>
              </div>
            );
          })()}

          {/* Individual Lessons */}
          {lessons.map((lesson, idx) => {
            // Start lesson colors from index 0, so no overlap with Practice All Questions
            const color = lessonColors[idx % lessonColors.length];
            const IconComponent = Star;
            return (
              <div
                key={lesson.id}
                className={`${color.color} ${color.textColor} rounded-3xl border-3 border-white shadow-xl w-full max-w-[320px] sm:w-80 h-[380px] sm:h-[420px] flex flex-col justify-between items-center p-6 sm:p-8 cursor-pointer hover:scale-105 transition-all duration-[1.2s] select-none ${
                  selectedLesson === lesson.id ? 'ring-4 ring-purple-300' : ''
                }`}
                onClick={() => handleLessonSelect(lesson.id)}
              >
                <div className="flex flex-col items-center text-center flex-1 w-full">
                  <div className="bg-white rounded-full p-4 mb-4 shadow-lg">
                    <IconComponent className={`w-8 h-8 ${color.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-xl mb-2">{lesson.name}</h3>
                  {lesson.description && (
                    <p className="text-sm opacity-90 leading-relaxed mb-2 mt-4">
                      {lesson.description}
                    </p>
                  )}
                </div>
                <div className="w-full flex flex-col items-center gap-2 mt-2">
                  {/* Removed question count and difficulty info */}
                </div>
              </div>
            );
          })}
          </div>

          {/* Start Button */}
          <div className="mt-8">
            <Button
              onClick={selectedLesson === 'all' ? handleStartWithoutLesson : handleStartLesson}
              disabled={!selectedLesson}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 text-lg font-bold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              {selectedLesson === 'all' ? 'Start Practice Session' : 'Start Lesson'}
            </Button>
          </div>

          {/* Info Message */}
          {lessons.length === 0 && (
            <div className="mt-6 text-center">
              <p className="text-gray-600 bg-white p-4 rounded-lg border">
                No specific lessons available yet. You can practice with all available questions!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonSelection; 
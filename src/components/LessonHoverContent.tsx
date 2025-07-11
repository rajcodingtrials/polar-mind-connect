import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Clock } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Lesson = Database['public']['Tables']['lessons']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];

interface LessonHoverContentProps {
  lessons: Lesson[];
  questionCounts: Record<string, number>;
  onLessonSelect: (lesson: Lesson) => void;
  activityType: string;
}

const LessonHoverContent: React.FC<LessonHoverContentProps> = ({
  lessons,
  questionCounts,
  onLessonSelect,
  activityType
}) => {
  if (!lessons || lessons.length === 0) {
    return (
      <Card className="w-80">
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No lessons available for this activity type.</p>
            <p className="text-xs mt-1">Check back later for new content!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'first_words':
        return 'from-emerald-50 to-emerald-100 border-emerald-200';
      case 'question_time':
        return 'from-blue-50 to-blue-100 border-blue-200';
      case 'build_sentence':
        return 'from-purple-50 to-purple-100 border-purple-200';
      case 'lets_chat':
        return 'from-orange-50 to-orange-100 border-orange-200';
      default:
        return 'from-slate-50 to-slate-100 border-slate-200';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getActivityTitle = (type: string) => {
    switch (type) {
      case 'first_words':
        return 'First Words Lessons';
      case 'question_time':
        return 'Question Time Lessons';
      case 'build_sentence':
        return 'Build Sentence Lessons';
      case 'lets_chat':
        return 'Let\'s Chat Lessons';
      default:
        return 'Available Lessons';
    }
  };

  return (
    <Card className={`w-80 bg-gradient-to-br ${getActivityColor(activityType)} shadow-lg border-2`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-center flex items-center justify-center gap-2">
          <BookOpen className="h-5 w-5" />
          {getActivityTitle(activityType)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-64 overflow-y-auto">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50 hover:bg-white/90 transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-sm text-slate-800 line-clamp-1">
                {lesson.name}
              </h4>
              <Badge className={`text-xs ${getDifficultyColor(lesson.difficulty_level)}`}>
                {lesson.difficulty_level}
              </Badge>
            </div>
            
            {lesson.description && (
              <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                {lesson.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {questionCounts[lesson.id] || 0} questions
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{Math.max(5, (questionCounts[lesson.id] || 0) * 2)} min
                </span>
              </div>
              
              <Button
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onLessonSelect(lesson);
                }}
                className="h-7 px-3 text-xs bg-primary hover:bg-primary/90"
              >
                Start
              </Button>
            </div>
          </div>
        ))}
        
        {lessons.length > 3 && (
          <div className="text-center pt-2 border-t border-white/30">
            <p className="text-xs text-slate-500">
              {lessons.length} lessons available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LessonHoverContent;
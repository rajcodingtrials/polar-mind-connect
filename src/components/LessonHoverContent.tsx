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
        return 'from-blue-50 to-blue-100 border-blue-200 text-blue-800';
      case 'question_time':
        return 'from-amber-50 to-amber-100 border-amber-200 text-amber-800';
      case 'build_sentence':
        return 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-800';
      case 'lets_chat':
        return 'from-orange-50 to-orange-100 border-orange-200 text-orange-800';
      default:
        return 'from-slate-50 to-slate-100 border-slate-200 text-slate-800';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'easy':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'hard':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
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
    <Card className={`w-72 max-w-[85vw] bg-gradient-to-br ${getActivityColor(activityType)} shadow-2xl border-2 rounded-3xl overflow-hidden`}>
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-lg font-bold flex items-center justify-center gap-2">
          <BookOpen className="h-5 w-5" />
          {getActivityTitle(activityType)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-60 overflow-y-auto px-6 pb-6">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-white/50 hover:bg-white hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-bold text-sm line-clamp-1 flex-1 pr-2">
                {lesson.name}
              </h4>
              <Badge className={`text-xs font-medium border ${getDifficultyColor(lesson.difficulty_level)}`}>
                {lesson.difficulty_level}
              </Badge>
            </div>
            
            {lesson.description && (
              <p className="text-xs opacity-75 mb-3 line-clamp-2">
                {lesson.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs opacity-70">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {questionCounts[lesson.id] || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{Math.max(5, (questionCounts[lesson.id] || 0) * 2)}min
                </span>
              </div>
              
              <Button
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onLessonSelect(lesson);
                }}
                className="h-8 px-4 text-xs font-semibold bg-white/20 hover:bg-white/40 border border-white/30 hover:border-white/50 backdrop-blur-sm transition-all duration-200 group-hover:bg-opacity-100"
              >
                Start →
              </Button>
            </div>
          </div>
        ))}
        
        {lessons.length > 3 && (
          <div className="text-center pt-3 border-t border-white/20">
            <p className="text-xs opacity-70 font-medium">
              {lessons.length} lessons available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LessonHoverContent;
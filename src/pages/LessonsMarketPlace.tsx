import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, MessageCircle, Building, Heart, User, Search, ArrowLeft } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

type QuestionType = Database['public']['Enums']['question_type_enum'];

interface Lesson {
  id: string;
  name: string;
  description: string | null;
  question_type: QuestionType;
  level: string;
  publish_to_marketplace: boolean;
}

interface LessonStyle {
  color: string;
  textColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const LessonsMarketPlace: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingLesson, setAddingLesson] = useState<string | null>(null);

  // Define style array similar to QuestionTypeCards
  const lessonStyles: LessonStyle[] = [
    { 
      color: 'bg-blue-100 hover:bg-blue-200 border-blue-200', 
      textColor: 'text-blue-800',
      icon: BookOpen
    },
    { 
      color: 'bg-amber-100 hover:bg-amber-200 border-amber-200', 
      textColor: 'text-amber-800',
      icon: MessageCircle
    },
    { 
      color: 'bg-purple-100 hover:bg-purple-200 border-purple-200', 
      textColor: 'text-purple-800',
      icon: User
    },
    { 
      color: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-200', 
      textColor: 'text-emerald-800',
      icon: Building
    },
    { 
      color: 'bg-orange-100 hover:bg-orange-200 border-orange-200', 
      textColor: 'text-orange-800',
      icon: Heart
    },
    { 
      color: 'bg-rose-100 hover:bg-rose-200 border-rose-200', 
      textColor: 'text-rose-800',
      icon: BookOpen
    },
  ];

  useEffect(() => {
    const fetchMarketplaceLessons = async () => {
      try {
        const { data, error } = await supabase
          .from('lessons_v2')
          .select('id, name, description, question_type, level, publish_to_marketplace')
          .eq('publish_to_marketplace', true)
          .eq('is_verified', true)
          .order('name');

        if (error) {
          console.error('Error fetching marketplace lessons:', error);
          return;
        }

        if (data && Array.isArray(data)) {
          const typedLessons = data as Lesson[];
          setLessons(typedLessons);
          setFilteredLessons(typedLessons);
        }
      } catch (error) {
        console.error('Error loading marketplace lessons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketplaceLessons();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLessons(lessons);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = lessons.filter(lesson => 
      lesson.name.toLowerCase().includes(query) ||
      (lesson.description && lesson.description.toLowerCase().includes(query)) ||
      lesson.question_type.toLowerCase().includes(query) ||
      lesson.level.toLowerCase().includes(query)
    );
    setFilteredLessons(filtered);
  }, [searchQuery, lessons]);

  const getLessonStyle = (index: number): LessonStyle => {
    return lessonStyles[index % lessonStyles.length];
  };

  const formatQuestionType = (type: QuestionType): string => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const difficultyIcons: Record<string, string> = { 
    beginner: '⭐', 
    intermediate: '⭐⭐', 
    advanced: '⭐⭐⭐' 
  };

  const handleLessonClick = async (lessonId: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add lessons to your profile.",
        variant: "destructive",
      });
      return;
    }

    setAddingLesson(lessonId);
    
    try {
      // Get current parent record
      const { data: parentData, error: fetchError } = await supabase
        .from('parents' as any)
        .select('lessons')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching parent record:', fetchError);
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Parse existing lessons (TypeScript can't infer type due to 'as any' cast)
      let existingLessons: string[] = [];
      try {
        const record = parentData as { lessons?: string | null } | null;
        if (record && record.lessons && typeof record.lessons === 'string') {
          existingLessons = record.lessons.split(',').map(id => id.trim()).filter(id => id);
        }
      } catch (e) {
        console.error('Error parsing parent lessons:', e);
      }

      // Check if lesson is already added
      if (existingLessons.includes(lessonId)) {
        toast({
          title: "Already Added",
          description: "This lesson is already in your profile.",
        });
        setAddingLesson(null);
        return;
      }

      // Add new lesson to the list
      const updatedLessons = [...existingLessons, lessonId].join(',');

      // Update parent record
      const { error: updateError } = await supabase
        .from('parents' as any)
        .update({ lessons: updatedLessons })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating parent lessons:', updateError);
        toast({
          title: "Error",
          description: "Failed to add lesson to your profile. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Lesson has been added to your profile.",
        });
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingLesson(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Lessons Marketplace</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">Discover and explore lessons from our community</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="relative max-w-2xl w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading lessons...</p>
            </div>
          )}

          {/* Lessons Grid */}
          {!loading && (
            <>
              {filteredLessons.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">
                    {searchQuery ? 'No lessons found matching your search.' : 'No lessons available in the marketplace yet.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredLessons.map((lesson, index) => {
                    const style = getLessonStyle(index);
                    const IconComponent = style.icon;
                    
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson.id)}
                        className={`${style.color} ${style.textColor} rounded-xl p-4 sm:p-6 cursor-pointer border-3 transition-all duration-300 ease-out min-h-[240px] sm:h-[280px] flex flex-col items-center justify-center hover:shadow-xl hover:border-white ${addingLesson === lesson.id ? 'opacity-50 cursor-wait' : ''}`}
                      >
                        <div className="flex flex-col items-center justify-center text-center h-full w-full">
                          <div className="bg-white rounded-full p-2 sm:p-3 mb-2 sm:mb-3 shadow-lg">
                            <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${style.textColor}`} />
                          </div>
                          <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 px-2">{lesson.name}</h3>
                          {lesson.description && (
                            <p className="text-xs opacity-90 leading-relaxed mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-3 px-2">
                              {lesson.description}
                            </p>
                          )}
                          <div className="flex flex-col items-center gap-1 sm:gap-2 mt-auto">
                            <span className="text-xs font-medium opacity-80">
                              {formatQuestionType(lesson.question_type)}
                            </span>
                            <span className="text-xs opacity-70">
                              {difficultyIcons[lesson.level] || '⭐'} {lesson.level}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LessonsMarketPlace;


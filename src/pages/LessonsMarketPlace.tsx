import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, MessageCircle, Building, Heart, User, Search, ArrowLeft } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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
          .from('lessons_v2' as any)
          .select('id, name, description, question_type, level, publish_to_marketplace')
          .eq('publish_to_marketplace', true)
          .eq('is_verified', true)
          .order('name');

        if (error) {
          console.error('Error fetching marketplace lessons:', error);
          return;
        }

        setLessons(data || []);
        setFilteredLessons(data || []);
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Lessons Marketplace</h1>
            <p className="text-gray-600 text-lg">Discover and explore lessons from our community</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search lessons by name, description, type, or level..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredLessons.map((lesson, index) => {
                    const style = getLessonStyle(index);
                    const IconComponent = style.icon;
                    
                    return (
                      <div
                        key={lesson.id}
                        className={`${style.color} ${style.textColor} rounded-xl p-6 cursor-pointer border-3 transition-all duration-300 ease-out h-[280px] flex flex-col items-center justify-center hover:shadow-xl hover:border-white`}
                      >
                        <div className="flex flex-col items-center justify-center text-center h-full w-full">
                          <div className="bg-white rounded-full p-3 mb-3 shadow-lg">
                            <IconComponent className={`w-6 h-6 ${style.textColor}`} />
                          </div>
                          <h3 className="font-bold text-lg mb-2">{lesson.name}</h3>
                          {lesson.description && (
                            <p className="text-xs opacity-90 leading-relaxed mb-3 line-clamp-3">
                              {lesson.description}
                            </p>
                          )}
                          <div className="flex flex-col items-center gap-2 mt-auto">
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


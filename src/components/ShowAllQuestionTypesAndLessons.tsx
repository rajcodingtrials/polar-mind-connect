import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, MessageCircle, Building, Heart, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { initializeQuestionTypesCache } from '@/utils/questionTypes';
import { useQuestionTypes } from '@/hooks/useQuestionTypes';
import { useAuth } from '@/context/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import QuestionTypeCards from './parents/QuestionTypeCards';
import LessonsPanel from './parents/LessonsPanel';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { QuestionType } from '@/utils/questionTypes';

interface ShowAllQuestionTypesAndLessonsProps {
  userId: string;
  parentLessons: string[];
  onLessonSelect: (lessonId: string | null, questionType: QuestionType) => void;
  therapistName: string;
  userFirstName: string;
}

const ShowAllQuestionTypesAndLessons: React.FC<ShowAllQuestionTypesAndLessonsProps> = ({
  userId,
  parentLessons,
  onLessonSelect,
  therapistName,
  userFirstName,
}) => {
  const { user } = useAuth();
  const { isTherapist } = useUserRole();
  const [selectedTab, setSelectedTab] = useState<'all-lessons' | 'lesson-plan'>('all-lessons');
  const [hoveredActivityType, setHoveredActivityType] = useState<QuestionType | null>(null);
  const [showLessonsPanel, setShowLessonsPanel] = useState(false);
  const [availableLessonIds, setAvailableLessonIds] = useState<string[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [questionTypesWithVerifiedLessons, setQuestionTypesWithVerifiedLessons] = useState<Set<string>>(new Set());
  
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Check if current user is a therapist viewing a linked parent's dashboard
  const isTherapistViewingLinkedParent = isTherapist() && user?.id && userId && user.id !== userId;

  // Load question types from database
  const { questionTypes: questionTypesData } = useQuestionTypes();

  // Initialize cache on mount
  useEffect(() => {
    initializeQuestionTypesCache();
  }, []);

  // Define 6 reusable color styles that cycle for all question types
  const colorStyles = [
    { color: 'bg-blue-100 hover:bg-blue-200 border-blue-200', textColor: 'text-blue-800', icon: BookOpen },
    { color: 'bg-amber-100 hover:bg-amber-200 border-amber-200', textColor: 'text-amber-800', icon: MessageCircle },
    { color: 'bg-purple-100 hover:bg-purple-200 border-purple-200', textColor: 'text-purple-800', icon: User },
    { color: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-200', textColor: 'text-emerald-800', icon: Building },
    { color: 'bg-orange-100 hover:bg-orange-200 border-orange-200', textColor: 'text-orange-800', icon: Heart },
    { color: 'bg-rose-100 hover:bg-rose-200 border-rose-200', textColor: 'text-rose-800', icon: BookOpen },
  ];

  // Sort question types by priority (descending) to ensure highest priority is shown first
  // The hook already orders by priority, but we'll sort again here to be safe
  const sortedQuestionTypes = [...questionTypesData].sort((a, b) => {
    const priorityA = a.priority ?? 0;
    const priorityB = b.priority ?? 0;
    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Descending order (higher priority first)
    }
    // If priorities are equal, sort by name
    return (a.name || '').localeCompare(b.name || '');
  });

  // Filter question types to only show those with at least one verified lesson
  const filteredQuestionTypes = sortedQuestionTypes.filter(qt => 
    questionTypesWithVerifiedLessons.has(qt.name)
  );

  const questionTypes = filteredQuestionTypes.map((qt, index) => {
    // Cycle through the 6 color styles using modulo
    const styleIndex = index % colorStyles.length;
    const config = colorStyles[styleIndex];
    return {
      value: qt.name as QuestionType,
      label: qt.display_string,
      description: qt.description,
      color: config.color,
      textColor: config.textColor,
      icon: config.icon
    };
  });

  // Close lessons panel when tab changes
  useEffect(() => {
    setHoveredActivityType(null);
    setShowLessonsPanel(false);
  }, [selectedTab]);

  // Load available lesson IDs based on selected tab
  useEffect(() => {
    const loadAvailableLessonIds = async () => {
      if (!userId) return;

      try {
        let lessonIds: string[] = [];

        if (selectedTab === 'all-lessons') {
          // Get default lessons from lessons_v2 table where is_default = true
          const { data: defaultLessonsData, error: defaultError } = await supabase
            .from('lessons_v2' as any)
            .select('id')
            .eq('is_default', true)
            .eq('is_verified', true);

          if (defaultError) {
            console.error('Error fetching default lessons:', defaultError);
          }

          // Get user's custom lessons from parents table
          const { data: parentData, error: parentError } = await supabase
            .from('parents' as any)
            .select('lessons')
            .eq('user_id', userId)
            .maybeSingle();

          if (parentError && parentError.code !== 'PGRST116') {
            console.log('No parent record found or error:', parentError);
          }

          // Extract default lesson IDs
          const defaultLessonIds: string[] = [];
          if (!defaultError && defaultLessonsData && Array.isArray(defaultLessonsData)) {
            const lessons = defaultLessonsData as Array<{ id?: string } | null>;
            for (const lesson of lessons) {
              if (lesson?.id) {
                defaultLessonIds.push(lesson.id);
              }
            }
          }

          // Extract user's custom lesson IDs
          const userLessonIds: string[] = [];
          if (parentData) {
            try {
              const record = parentData as { lessons?: string | null };
              if (record && record.lessons && typeof record.lessons === 'string' && record.lessons.trim() !== '') {
                userLessonIds.push(...record.lessons.split(',').map(id => id.trim()).filter(id => id));
              }
            } catch (e) {
              console.error('Error parsing parent lessons:', e);
            }
          }

          // Combine and deduplicate lesson IDs
          lessonIds = [...new Set([...defaultLessonIds, ...userLessonIds])];
        } else if (selectedTab === 'lesson-plan') {
          // Get lesson plan from parents table
          // Use database function if therapist is viewing linked parent, otherwise direct table access
          if (isTherapistViewingLinkedParent) {
            // Use database function for therapists viewing linked parents
            const { data: lessonPlanData, error: lessonPlanError } = await (supabase.rpc as any)('get_parent_lesson_plan', {
              _parent_user_id: userId
            });

            if (lessonPlanError) {
              console.error('Error fetching lesson plan via function:', lessonPlanError);
            } else if (lessonPlanData && typeof lessonPlanData === 'string' && lessonPlanData.trim() !== '') {
              lessonIds = lessonPlanData.split(',').map(id => id.trim()).filter(id => id);
            }
          } else {
            // Direct table access for parents viewing their own lesson plan
            const { data: parentData, error: parentError } = await supabase
              .from('parents' as any)
              .select('lesson_plan')
              .eq('user_id', userId)
              .maybeSingle();

            if (parentError && parentError.code !== 'PGRST116') {
              console.error('Error fetching lesson plan:', parentError);
            }

            if (parentData) {
              try {
                const record = parentData as { lesson_plan?: string | null };
                if (record && record.lesson_plan && typeof record.lesson_plan === 'string' && record.lesson_plan.trim() !== '') {
                  lessonIds = record.lesson_plan.split(',').map(id => id.trim()).filter(id => id);
                }
              } catch (e) {
                console.error('Error parsing lesson plan:', e);
              }
            }
          }
        }

        setAvailableLessonIds(lessonIds);
      } catch (error) {
        console.error('Error loading available lesson IDs:', error);
        setAvailableLessonIds([]);
      }
    };

    loadAvailableLessonIds();
  }, [userId, selectedTab, isTherapistViewingLinkedParent]);

  // Load lessons based on available lesson IDs
  useEffect(() => {
    const loadLessons = async () => {
      if (availableLessonIds.length === 0) {
        setLessons([]);
        setQuestionTypesWithVerifiedLessons(new Set());
        setQuestionCounts({});
        return;
      }

      try {
        // Fetch all lessons from lessons_v2 that match the available lesson IDs
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons_v2' as any)
          .select('id, name, description, question_type, level, is_verified, youtube_video_id, created_at, updated_at, num_reviews, average_review, priority')
          .in('id', availableLessonIds)
          .eq('is_verified', true);

        if (lessonsError) {
          console.error('Error loading lessons:', lessonsError);
          setLessons([]);
          setQuestionTypesWithVerifiedLessons(new Set());
          setQuestionCounts({});
          return;
        }

        if (!lessonsData || lessonsData.length === 0) {
          setLessons([]);
          setQuestionTypesWithVerifiedLessons(new Set());
          setQuestionCounts({});
          return;
        }

        // Ensure all lessons have question_type field
        let validLessons = (lessonsData as any[]).filter(lesson => lesson && lesson.question_type);
        
        // Track which question types have at least one verified lesson
        const questionTypesWithLessons = new Set<string>();
        for (const lesson of validLessons) {
          if (lesson.question_type) {
            questionTypesWithLessons.add(lesson.question_type);
          }
        }
        setQuestionTypesWithVerifiedLessons(questionTypesWithLessons);
        
        // Sort by priority (descending), then by name (ascending)
        validLessons.sort((a, b) => {
          const priorityA = a.priority ?? 0;
          const priorityB = b.priority ?? 0;
          if (priorityA !== priorityB) {
            return priorityB - priorityA; // Descending order
          }
          // If priorities are equal, sort by name
          return (a.name || '').localeCompare(b.name || '');
        });
        
        setLessons(validLessons);
        
        // Load question counts for each lesson
        const counts: Record<string, number> = {};
        for (const lesson of validLessons) {
          const { count, error: countError } = await supabase
            .from('questions_v2' as any)
            .select('*', { count: 'exact', head: true })
            .eq('lesson_id', lesson.id);
          
          if (!countError) {
            counts[lesson.id] = count || 0;
          }
        }
        setQuestionCounts(counts);
      } catch (error) {
        console.error('Error loading lessons:', error);
        setLessons([]);
        setQuestionTypesWithVerifiedLessons(new Set());
        setQuestionCounts({});
      }
    };

    loadLessons();
  }, [availableLessonIds]);

  // Scroll selected card into view when panel opens
  useEffect(() => {
    if (showLessonsPanel && hoveredActivityType && cardsContainerRef.current) {
      const selectedCard = cardRefs.current[hoveredActivityType];
      if (selectedCard) {
        // Use setTimeout to ensure DOM is updated
        setTimeout(() => {
          selectedCard.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }, 100);
      }
    }
  }, [showLessonsPanel, hoveredActivityType]);

  const handleActivityClick = (questionType: QuestionType) => {
    if (hoveredActivityType === questionType && showLessonsPanel) {
      setHoveredActivityType(null);
      setShowLessonsPanel(false);
    } else {
      setHoveredActivityType(questionType);
      setShowLessonsPanel(true);
    }
  };

  const handleCloseLessons = () => {
    setHoveredActivityType(null);
    setShowLessonsPanel(false);
  };

  return (
    <div className="mb-8 flex flex-col items-center">
      <div className="text-center mb-6 sm:mb-8 lg:mb-12 px-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2 sm:mb-4">
          Choose Your Learning Adventure with {userFirstName || therapistName}!
        </h2>
        
        {/* Tabs for All Lessons / Lesson Plan */}
        <div className="flex justify-center mb-4">
          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'all-lessons' | 'lesson-plan')} className="w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all-lessons">All Lessons</TabsTrigger>
              <TabsTrigger value="lesson-plan">Lesson Plan</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <p className="text-sm sm:text-base lg:text-lg text-gray-600">
          {showLessonsPanel ? 'Choose a lesson or practice all questions' : 'Click on an activity to see available lessons'}
        </p>
        {!showLessonsPanel && (
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-2">
            You have {lessons.length} lessons available to learn.
          </p>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto gap-4 lg:gap-8 min-h-[500px]">
        {/* Activity Cards Section */}
        <div 
          ref={cardsContainerRef}
          className={`transition-all duration-300 ease-out ${showLessonsPanel ? 'w-full lg:w-2/5' : 'w-full'} overflow-y-auto max-h-[calc(100vh-300px)]`}
        >
          <QuestionTypeCards
            questionTypes={questionTypes}
            hoveredActivityType={hoveredActivityType}
            showLessonsPanel={showLessonsPanel}
            onActivityClick={handleActivityClick}
            cardRefs={cardRefs}
          />
        </div>

        {/* Lessons Panel */}
        <div 
          className={`transition-all duration-800 ease-out overflow-hidden ${showLessonsPanel ? 'w-full lg:w-3/5 opacity-100' : 'w-0 opacity-0'}`}
        >
          {showLessonsPanel && hoveredActivityType && (
            <LessonsPanel
              selectedType={questionTypes.find(t => t.value === hoveredActivityType) || null}
              lessons={lessons}
              questionCounts={questionCounts}
              onClose={handleCloseLessons}
              onLessonSelect={onLessonSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowAllQuestionTypesAndLessons;


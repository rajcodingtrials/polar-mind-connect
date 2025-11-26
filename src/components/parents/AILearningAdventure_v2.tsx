import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, MessageCircle, Building, Heart, User } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import ProgressCharacter from './ProgressCharacter';
import IntroductionScreen from './IntroductionScreen';
import QuestionView from './QuestionView';
import MiniCelebration from './MiniCelebration';
import LessonSelection from './LessonSelection';
import QuestionTypeCards from './QuestionTypeCards';
import LessonsPanel from './LessonsPanel';

type QuestionType = Database['public']['Enums']['question_type_enum'];

interface Question_v2 {
  id: string;
  question_text: string;
  question_speech: string | null;
  description_text: string | null;
  answer: string | null;
  answer_index: number | null;
  question_image: string | null;
  choices_text: string | null;
  choices_image: string | null;
  question_type: QuestionType;
  question_index: number | null;
  lesson_id: string | null;
  lesson: string | null;
  lessonObj?: {
    id: string;
    name: string;
    description: string | null;
    level: string;
    add_mini_celebration?: boolean;
  } | null;
  add_mini_celebration?: boolean;
}

interface AILearningAdventure_v2Props {
  therapistName: string;
}

const AILearningAdventure_v2: React.FC<AILearningAdventure_v2Props> = ({ therapistName }) => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { user } = useAuth();
  const [parentLessons, setParentLessons] = useState<string[]>([]);
  const [showQuestionTypes, setShowQuestionTypes] = useState(true);
  const [questions, setQuestions] = useState<Question_v2[]>([]);
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  const [currentScreen, setCurrentScreen] = useState<'home' | 'lesson-selection' | 'introduction' | 'question' | 'celebration' | 'complete'>('home');
  const [availableQuestions, setAvailableQuestions] = useState<Question_v2[]>([]);
  const [askedQuestionIds, setAskedQuestionIds] = useState<Set<string>>(new Set());
  const [currentQuestion, setCurrentQuestion] = useState<Question_v2 | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sessionQuestionCount, setSessionQuestionCount] = useState(0);
  const [comingFromCelebration, setComingFromCelebration] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const maxQuestionsPerSession = 6;

  const [hoveredActivityType, setHoveredActivityType] = useState<QuestionType | null>(null);
  const [showLessonsPanel, setShowLessonsPanel] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  
  const [adminSettings, setAdminSettings] = useState<{ skip_introduction: boolean; show_mic_input: boolean; amplify_mic: boolean; mic_gain: number } | null>(null);
  const [adminSettingsLoading, setAdminSettingsLoading] = useState(true);

  const [showRewardVideo, setShowRewardVideo] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasPlayedChime, setHasPlayedChime] = useState(false);

  const [localAmplifyMic, setLocalAmplifyMic] = useState(false);
  const [localMicGain, setLocalMicGain] = useState(1.0);

  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const fetchSettings = async () => {
      setAdminSettingsLoading(true);
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('skip_introduction, show_mic_input, amplify_mic, mic_gain')
          .limit(1)
          .single();
        if (error) throw error;
        setAdminSettings(data);
      } catch (err) {
        setAdminSettings({ skip_introduction: false, show_mic_input: false, amplify_mic: false, mic_gain: 1.0 });
      } finally {
        setAdminSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const childName = profile?.name || profile?.username || 'friend';

  const questionTypes = [
    { 
      value: 'first_words' as QuestionType, 
      label: 'First Words', 
      description: 'Practice basic first words and sounds', 
      color: 'bg-blue-100 hover:bg-blue-200 border-blue-200',
      textColor: 'text-blue-800',
      icon: BookOpen
    },
    { 
      value: 'question_time' as QuestionType, 
      label: 'Question Time', 
      description: 'Answer questions about pictures', 
      color: 'bg-amber-100 hover:bg-amber-200 border-amber-200',
      textColor: 'text-amber-800',
      icon: MessageCircle
    },
    { 
      value: 'tap_and_play' as QuestionType, 
      label: 'Tap and Play', 
      description: 'Choose the correct picture by tapping', 
      color: 'bg-purple-100 hover:bg-purple-200 border-purple-200',
      textColor: 'text-purple-800',
      icon: User
    },
    { 
      value: 'build_sentence' as QuestionType, 
      label: 'Build a Sentence', 
      description: 'Learn to construct sentences', 
      color: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-200',
      textColor: 'text-emerald-800',
      icon: Building
    },
    { 
      value: 'lets_chat' as QuestionType, 
      label: 'Lets Chat', 
      description: 'Free conversation practice', 
      color: 'bg-orange-100 hover:bg-orange-200 border-orange-200',
      textColor: 'text-orange-800',
      icon: Heart
    },
    { 
      value: 'story_activity' as QuestionType, 
      label: 'Story Activity', 
      description: 'Follow along with interactive story scenes', 
      color: 'bg-rose-100 hover:bg-rose-200 border-rose-200',
      textColor: 'text-rose-800',
      icon: BookOpen
    }
  ];

  // Load parent's available lessons (combining default lessons with user's custom lessons)
  useEffect(() => {
    const loadParentLessons = async () => {
      if (!user?.id) return;
      
      try {
        // Get default lessons from database function
        const { data: defaultLessonsData, error: defaultError } = await supabase
          .rpc('get_default_lessons' as any);
        
        // Fallback default lessons if RPC call fails
        const fallbackDefaultLessons = '1ad57f79-ea9f-4894-8765-34083fb57f4f,284fef51-e2d0-407d-8930-de6184391899,300a36ac-beaa-46b3-b4e0-e076a0f2ac04,31eb7a4d-8ffc-40b0-8677-b10a0dceee5e,386985d6-3112-49bc-bca6-00939178d13e,40f0b51c-f17b-44ad-b65d-378ae8c71e33,52157e52-cb71-4ef5-8d9f-4873712c8058,6efb2910-6cc7-43fe-9198-410b28f6b2be,80f72e1b-f7b8-4b60-8719-cbf9dfa8da09,a581ab8a-a167-40f0-a778-7d94c28d4407,a9ce2a9c-f34b-4d65-a32b-e8172925e406,b7ff0731-c0a3-43a4-9d15-efc911a9ce60,c251fd3d-bc3f-4954-8c2b-8293d3aad96d,d6d77133-e396-4797-a728-cbff7ccaf0c8,d91592cc-c1ac-4cb2-8a9d-c0cd91b7d6da,d9a7e61e-e606-416b-a743-f9121de461c4';
        
        if (defaultError) {
          console.error('Error fetching default lessons:', defaultError);
          console.log('Using fallback default lessons');
        }
        
        // Get user's custom lessons from parents table
        const { data: parentData, error: parentError } = await supabase
          .from('parents' as any)
          .select('lessons')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (parentError && parentError.code !== 'PGRST116') {
          // PGRST116 means no rows found, which is okay for new users
          console.log('No parent record found or error:', parentError);
        }
        
        // Combine default lessons with user's custom lessons
        const defaultLessonIds: string[] = [];
        const defaultLessonsString = (defaultLessonsData && typeof defaultLessonsData === 'string') 
          ? defaultLessonsData 
          : fallbackDefaultLessons;
        
        if (defaultLessonsString) {
          defaultLessonIds.push(...defaultLessonsString.split(',').map(id => id.trim()).filter(id => id));
        }
        
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
        const allLessonIds = [...new Set([...defaultLessonIds, ...userLessonIds])];
        setParentLessons(allLessonIds);
      } catch (error) {
        console.error('Error loading parent lessons:', error);
      }
    };
    
    loadParentLessons();
  }, [user?.id]);

  useEffect(() => {
    const loadQuestionsAndImages = async () => {
      try {
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions_v2' as any)
          .select(`
            *,
            lessons_v2:lesson_id (
              id,
              name,
              description,
              level,
              add_mini_celebration
            )
          `)
          .order('question_index', { ascending: true });

        if (questionsError) {
          console.error('Error loading questions:', questionsError);
          return;
        }

        if (questionsData && questionsData.length > 0) {
          const formattedQuestions = (questionsData as any[]).map((q: any) => {
            const lessonObj = q.lessons_v2 ? (Array.isArray(q.lessons_v2) ? q.lessons_v2[0] : q.lessons_v2) : null;
            return {
              id: q.id,
              question_text: q.question_text,
              question_speech: q.question_speech || null,
              description_text: q.description_text || null,
              answer: q.answer,
              answer_index: q.answer_index,
              question_image: q.question_image,
              choices_text: q.choices_text,
              choices_image: q.choices_image,
              question_type: q.question_type,
              question_index: q.question_index,
              lesson_id: q.lesson_id,
              lesson: q.lesson || null,
              lessonObj: lessonObj,
              add_mini_celebration: lessonObj?.add_mini_celebration !== undefined ? lessonObj.add_mini_celebration : true
            };
          }).filter(q => {
            // If parent has lessons list, only show questions from those lessons
            // If no lesson_id, allow it (questions not tied to a specific lesson)
            if (parentLessons.length === 0) return true;
            if (!q.lesson_id) return true;
            return parentLessons.includes(q.lesson_id);
          });
          
          setQuestions(formattedQuestions);
        }

        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons_v2' as any)
          .select('id, name, description, question_type, level, is_verified, youtube_video_id, created_at, updated_at, num_reviews, average_review')
          .eq('is_verified', true)
          .order('name');

        if (!lessonsError && lessonsData) {
          // Ensure all lessons have question_type field
          let validLessons = (lessonsData as any[]).filter(lesson => lesson && lesson.question_type);
          
          // If user is a parent, filter lessons to only show those in their lessons list
          if (parentLessons.length > 0) {
            validLessons = validLessons.filter(lesson => parentLessons.includes(lesson.id));
          }
          
          setLessons(validLessons);
          
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
        }
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
      }
    };

    loadQuestionsAndImages();
  }, [parentLessons]);


  useEffect(() => {
    if (currentScreen === 'complete' && !showRewardVideo) {
      const timer = setTimeout(() => {
        setShowRewardVideo(true);
        setShowConfetti(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, showRewardVideo]);

  useEffect(() => {
    if (showRewardVideo && !hasPlayedChime) {
      const confettiSound = "https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa1c82.mp3";
      const audio = new Audio(confettiSound);
      audio.play();
      setHasPlayedChime(true);
    }
  }, [showRewardVideo, hasPlayedChime]);

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

  const handleQuestionTypeSelect = (questionType: QuestionType) => {
    setSelectedQuestionType(questionType);
    setShowQuestionTypes(false);
    setCorrectAnswers(0);
    setRetryCount(0);
    setSessionQuestionCount(0);
    setAskedQuestionIds(new Set());
    setSelectedLessonId(null);
    setCurrentScreen('lesson-selection');
  };

  const handleDirectLessonSelect = (lessonId: string | null, questionType: QuestionType) => {
    setSelectedQuestionType(questionType);
    setSelectedLessonId(lessonId);
    setShowQuestionTypes(false);
    setCorrectAnswers(0);
    setRetryCount(0);
    setSessionQuestionCount(0);
    setAskedQuestionIds(new Set());
    
    let filteredQuestions: Question_v2[];
    
    if (lessonId) {
      filteredQuestions = questions.filter(q => 
        q.question_type === questionType && 
        q.lesson_id === lessonId &&
        (parentLessons.length === 0 || parentLessons.includes(lessonId))
      );
    } else {
      filteredQuestions = questions.filter(q => 
        q.question_type === questionType &&
        (parentLessons.length === 0 || !q.lesson_id || parentLessons.includes(q.lesson_id))
      );
    }
    
    // Sort by question_index
    filteredQuestions = [...filteredQuestions].sort((a, b) => 
      (a.question_index || 0) - (b.question_index || 0)
    );
    
    setAvailableQuestions(filteredQuestions);
    setCurrentScreen('introduction');
  };

  const handleLessonSelect = (lessonId: string | null) => {
    setSelectedLessonId(lessonId);
    
    let filteredQuestions: Question_v2[];
    
    if (lessonId) {
      filteredQuestions = questions.filter(q => 
        q.question_type === selectedQuestionType && 
        q.lesson_id === lessonId &&
        (parentLessons.length === 0 || parentLessons.includes(lessonId))
      );
    } else {
      filteredQuestions = questions.filter(q => 
        q.question_type === selectedQuestionType &&
        (parentLessons.length === 0 || !q.lesson_id || parentLessons.includes(q.lesson_id))
      );
    }
    
    // Sort by question_index
    filteredQuestions = [...filteredQuestions].sort((a, b) => 
      (a.question_index || 0) - (b.question_index || 0)
    );
    
    setAvailableQuestions(filteredQuestions);
    if (adminSettings && adminSettings.skip_introduction) {
      handleStartQuestions();
    } else {
      setCurrentScreen('introduction');
    }
  };

  const handleBackToQuestionTypes = () => {
    setCurrentScreen('home');
    setShowQuestionTypes(true);
  };

  const handleBackToTherapists = () => {
    navigate('/home', { state: { resetTherapist: true } });
  };

  const handleStartQuestions = () => {
    // Start at first question (sorted by question_index)
    const firstQuestion = availableQuestions[0];
    if (firstQuestion) {
      setCurrentQuestion(firstQuestion);
      setAskedQuestionIds(new Set([firstQuestion.id]));
      setSessionQuestionCount(1);
      setComingFromCelebration(false);
      setCurrentScreen('question');
    }
  };

  const handleCorrectAnswer = () => {
    setCorrectAnswers(prev => prev + 1);
    setRetryCount(0);
    
    // Check if mini celebration should be shown for the current question's lesson
    // Default to true if not set (for backward compatibility)
    const shouldShowCelebration = currentQuestion?.add_mini_celebration !== false;
    
    if (shouldShowCelebration) {
      setComingFromCelebration(true);
      setCurrentScreen('celebration');
    } else {
      // Skip celebration and go directly to next question
      handleNextQuestion();
    }
  };

  const handleNextQuestion = (shouldIncrement: boolean = true) => {
    if (sessionQuestionCount >= maxQuestionsPerSession) {
      setCurrentScreen('complete');
      return;
    }

    const remainingQuestions = availableQuestions.filter(q => !askedQuestionIds.has(q.id));
    
    if (remainingQuestions.length === 0) {
      setCurrentScreen('complete');
      return;
    }

    // Sort remaining questions by question_index (or id as fallback) to maintain order
    const sortedRemaining = [...remainingQuestions].sort((a, b) => {
      // First sort by question_index if available
      if (a.question_index !== null && b.question_index !== null) {
        return a.question_index - b.question_index;
      }
      if (a.question_index !== null) return -1;
      if (b.question_index !== null) return 1;
      // Fallback to id if question_index is not available
      return a.id.localeCompare(b.id);
    });

    // Select the first question in order (not random)
    const nextQuestion = sortedRemaining[0];
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
      setAskedQuestionIds(prev => new Set([...prev, nextQuestion.id]));
      // Only increment the count if shouldIncrement is true (default behavior)
      if (shouldIncrement) {
        setSessionQuestionCount(prev => prev + 1);
      }
      setRetryCount(0);
      setComingFromCelebration(false);
      setCurrentScreen('question');
    } else {
      setCurrentScreen('complete');
    }
  };

  const handleCelebrationComplete = () => {
    handleNextQuestion();
  };

  const handleCompleteSession = () => {
    setCurrentScreen('home');
    setShowQuestionTypes(true);
    setSelectedQuestionType(null);
    setCorrectAnswers(0);
    setRetryCount(0);
    setCurrentQuestion(null);
    setAvailableQuestions([]);
    setAskedQuestionIds(new Set());
    setSessionQuestionCount(0);
  };

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

  const handleAmplifyMicChange = (enabled: boolean) => {
    setLocalAmplifyMic(enabled);
  };

  const handleMicGainChange = (gain: number) => {
    setLocalMicGain(gain);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <main className="flex-grow p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Activity Selection Screen */}
          {showQuestionTypes && currentScreen === 'home' && (
            <div className="mb-8 flex flex-col items-center">
              <div className="text-center mb-6 sm:mb-8 lg:mb-12 px-4">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2 sm:mb-4">
                  Choose Your Learning Adventure with {therapistName}!
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                  {showLessonsPanel ? 'Choose a lesson or practice all questions' : 'Click on an activity to see available lessons'}
                </p>
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
                      onLessonSelect={handleDirectLessonSelect}
                    />
                  )}
                </div>
              </div>
              
              <div className="mt-6 sm:mt-8 text-center flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
                <button
                  onClick={handleBackToTherapists}
                  className="text-gray-600 hover:text-gray-800 text-base sm:text-lg font-medium bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  ← Back to Therapists
                </button>
                <button
                  onClick={() => navigate('/lessons-marketplace')}
                  className="text-white hover:text-white text-base sm:text-lg font-medium bg-gradient-to-r from-blue-500 to-purple-500 px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-transparent hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <span className="hidden sm:inline">Get More Lessons From MarketPlace</span>
                  <span className="sm:hidden">Marketplace</span>
                </button>
              </div>
            </div>
          )}

          {/* Lesson Selection Screen */}
          {currentScreen === 'lesson-selection' && selectedQuestionType && (
            <LessonSelection
              selectedQuestionType={selectedQuestionType}
              therapistName={therapistName}
              onLessonSelect={handleLessonSelect}
              onBack={handleBackToQuestionTypes}
            />
          )}

          {/* Introduction Screen */}
          {currentScreen === 'introduction' && selectedQuestionType && (
            <IntroductionScreen
              selectedQuestionType={selectedQuestionType}
              therapistName={therapistName}
              childName={childName}
              onStartQuestions={handleStartQuestions}
            />
          )}

          {/* Question View */}
          {currentScreen === 'question' && selectedQuestionType && currentQuestion && (
            <QuestionView
              question={currentQuestion}
              questionNumber={sessionQuestionCount}
              totalQuestions={Math.min(maxQuestionsPerSession, availableQuestions.length)}
              therapistName={therapistName}
              childName={childName}
              onCorrectAnswer={handleCorrectAnswer}
              onNextQuestion={handleNextQuestion}
              onComplete={() => setCurrentScreen('complete')}
              onPickNewLesson={handleBackToQuestionTypes}
              retryCount={retryCount}
              onRetryCountChange={setRetryCount}
              onAmplifyMicChange={handleAmplifyMicChange}
              onMicGainChange={handleMicGainChange}
              comingFromCelebration={comingFromCelebration}
              showMicInput={!!(adminSettings && adminSettings.show_mic_input)}
              amplifyMic={localAmplifyMic}
              micGain={localMicGain}
            />
          )}

          {/* Mini Celebration */}
          {currentScreen === 'celebration' && (
            <MiniCelebration
              correctAnswers={correctAnswers}
              therapistName={therapistName}
              onComplete={handleCelebrationComplete}
            />
          )}

          {/* Complete Session */}
          {currentScreen === 'complete' && (
            <div className="flex flex-col items-center justify-center min-h-[80vh] relative">
              {!showRewardVideo && (
                <div className="fade-in-out">
                  <ProgressCharacter 
                    correctAnswers={correctAnswers}
                    totalQuestions={Math.min(maxQuestionsPerSession, availableQuestions.length)}
                    questionType={selectedQuestionType}
                  />
                  <div className="text-2xl font-bold mt-6 mb-2 text-emerald-600 animate-pulse">You did it!</div>
                  {showConfetti && (
                    <div className="fixed inset-0 pointer-events-none z-50">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 opacity-90"
                          style={{
                            left: `${40 + Math.random() * 20}%`,
                            top: `${30 + Math.random() * 20}%`,
                            backgroundColor: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#F59E0B', '#FBBF24'][Math.floor(Math.random() * 6)],
                            animation: `mini-confetti-fall ${1.5 + Math.random() * 1}s linear forwards`,
                            animationDelay: `${Math.random() * 0.5}s`,
                            transform: `rotate(${Math.random() * 360}deg)`,
                            borderRadius: Math.random() > 0.5 ? '50%' : '0%'
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <style>{`
                    @keyframes mini-confetti-fall {
                      0% {
                        transform: translateY(-20px) rotate(0deg) scale(1);
                        opacity: 1;
                      }
                      100% {
                        transform: translateY(100px) rotate(360deg) scale(0.5);
                        opacity: 0;
                      }
                    }
                  `}</style>
                </div>
              )}
              {showRewardVideo && (() => {
                const selectedLesson = lessons.find((lesson: any) => lesson.id === selectedLessonId);
                if (selectedLesson?.youtube_video_id) {
                  return (
                    <div className="fade-in flex flex-col items-center">
                      <h3 className="text-2xl font-bold mb-4">🎵 Surprise! Here's a special song as your reward!</h3>
                      <iframe
                        width="800"
                        height="450"
                        src={`https://www.youtube.com/embed/${selectedLesson.youtube_video_id}?autoplay=1&rel=0`}
                        title="Lesson Song"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg shadow-lg"
                      />
                      <div className="flex gap-6 mt-6">
                        <Button
                          onClick={handleCompleteSession}
                          size="lg"
                          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 text-lg font-bold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          Continue Learning! 🚀
                        </Button>
                        <Button
                          onClick={handleCompleteSession}
                          size="lg"
                          variant="outline"
                          className="px-8 py-4 text-lg font-bold rounded-full shadow-xl border-2 border-blue-400 hover:bg-blue-50"
                        >
                          Skip Video
                        </Button>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AILearningAdventure_v2;


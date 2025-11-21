import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '../hooks/useUserProfile';
import { useImagePreloader } from '../hooks/useImagePreloader';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, MessageCircle, Building, Heart, User } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import ProgressCharacter from './ProgressCharacter';
import IntroductionScreen from './IntroductionScreen';
import SingleQuestionView from './SingleQuestionView';
import TapAndPlayView from './TapAndPlayView';
import StoryActivityView from './StoryActivityView';
import MiniCelebration from './MiniCelebration';
import LessonSelection from './LessonSelection';

type QuestionType = Database['public']['Enums']['question_type_enum'];

interface Question {
  id: string;
  question: string;
  answer: string;
  imageName?: string;
  images?: string[];
  correctImageIndex?: number;
  questionType?: QuestionType;
  lessonId?: string | null;
  lesson?: {
    id: string;
    name: string;
    description: string | null;
    difficulty_level: string;
  } | null;
  // Story activity fields
  scene_image?: string;
  scene_narration?: string;
  sequence_number?: number;
  is_scene?: boolean;
}

interface AILearningAdventureProps {
  therapistName: string;
}

const AILearningAdventure: React.FC<AILearningAdventureProps> = ({ therapistName }) => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const [showQuestionTypes, setShowQuestionTypes] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [imageUrls, setImageUrls] = useState<{[key: string]: string}>({});
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  const [currentScreen, setCurrentScreen] = useState<'home' | 'lesson-selection' | 'introduction' | 'question' | 'celebration' | 'complete'>('home');
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [askedQuestionIds, setAskedQuestionIds] = useState<Set<string>>(new Set());
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sessionQuestionCount, setSessionQuestionCount] = useState(0);
  const [comingFromCelebration, setComingFromCelebration] = useState(false);
  const [storyActivityComplete, setStoryActivityComplete] = useState(false);
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

  // Preload all images in the background
  const allImageUrls = Object.values(imageUrls);
  useImagePreloader(allImageUrls);

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

  useEffect(() => {
    const loadQuestionsAndImages = async () => {
      try {
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select(`
            *,
            lessons (
              id,
              name,
              description,
              difficulty_level
            )
          `)
          .order('created_at', { ascending: false });

        if (questionsError) {
          console.error('Error loading questions:', questionsError);
          return;
        }

        if (questionsData && questionsData.length > 0) {
          const formattedQuestions = questionsData.map(q => ({
            id: q.id,
            question: q.question,
            answer: q.answer,
            imageName: q.image_name,
            images: q.images ? (Array.isArray(q.images) ? q.images.map(img => String(img)) : []) : undefined,
            correctImageIndex: q.correct_image_index ?? undefined,
            questionType: q.question_type,
            lessonId: q.lesson_id,
            lesson: q.lessons,
            // Story activity fields
            scene_image: q.scene_image,
            scene_narration: q.scene_narration,
            sequence_number: q.sequence_number,
            is_scene: q.is_scene
          }));
          
          setQuestions(formattedQuestions);

          const imageUrlMap: {[key: string]: string} = {};
          
          for (const question of formattedQuestions) {
            if (question.imageName) {
              const { data } = supabase.storage
                .from('question-images')
                .getPublicUrl(question.imageName);
              
              if (data?.publicUrl) {
                imageUrlMap[question.imageName] = data.publicUrl;
              }
            }
            
            if (question.images && Array.isArray(question.images)) {
              for (const imageName of question.images) {
                if (!imageUrlMap[imageName]) {
                  const { data } = supabase.storage
                    .from('question-images')
                    .getPublicUrl(imageName);
                  
                  if (data?.publicUrl) {
                    imageUrlMap[imageName] = data.publicUrl;
                  }
                }
              }
            }
            
            // Handle scene images for story_activity
            if (question.scene_image && !imageUrlMap[question.scene_image]) {
              const { data } = supabase.storage
                .from('question-images')
                .getPublicUrl(question.scene_image);
              
              if (data?.publicUrl) {
                imageUrlMap[question.scene_image] = data.publicUrl;
              }
            }
          }
          
          setImageUrls(imageUrlMap);
        }

        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (!lessonsError && lessonsData) {
          setLessons(lessonsData);
          
          const counts: Record<string, number> = {};
          for (const lesson of lessonsData) {
            const { count, error: countError } = await supabase
              .from('questions')
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
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminQuestions' && e.newValue) {
        setQuestions(JSON.parse(e.newValue));
      }
      if (e.key === 'adminImages' && e.newValue) {
        try {
          const imageData = JSON.parse(e.newValue);
          const urlMap: {[key: string]: string} = {};
          
          imageData.forEach((item: any) => {
            const byteCharacters = atob(item.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: item.type });
            urlMap[item.name] = URL.createObjectURL(blob);
          });
          
          setImageUrls(urlMap);
        } catch (error) {
          console.error('Error processing updated images:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

  const selectRandomQuestion = (questionsPool: Question[]): Question | null => {
    if (questionsPool.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * questionsPool.length);
    return questionsPool[randomIndex];
  };

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
    
    let filteredQuestions: Question[];
    
    if (lessonId) {
      filteredQuestions = questions.filter(q => 
        q.questionType === questionType && 
        q.lessonId === lessonId
      );
    } else {
      filteredQuestions = questions.filter(q => q.questionType === questionType);
    }
    
    // Sort story_activity by sequence_number
    if (questionType === 'story_activity') {
      filteredQuestions = [...filteredQuestions].sort((a, b) => 
        (a.sequence_number || 0) - (b.sequence_number || 0)
      );
    }
    
    setAvailableQuestions(filteredQuestions);
    setCurrentScreen('introduction');
  };

  const handleLessonSelect = (lessonId: string | null) => {
    setSelectedLessonId(lessonId);
    
    let filteredQuestions: Question[];
    
    if (lessonId) {
      filteredQuestions = questions.filter(q => 
        q.questionType === selectedQuestionType && 
        q.lessonId === lessonId
      );
    } else {
      filteredQuestions = questions.filter(q => q.questionType === selectedQuestionType);
    }
    
    // Sort story_activity by sequence_number
    if (selectedQuestionType === 'story_activity') {
      filteredQuestions = [...filteredQuestions].sort((a, b) => 
        (a.sequence_number || 0) - (b.sequence_number || 0)
      );
    }
    
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
    // For story_activity, start at first entry (no randomization)
    if (selectedQuestionType === 'story_activity') {
      const firstEntry = availableQuestions[0];
      if (firstEntry) {
        setCurrentQuestion(firstEntry);
        setAskedQuestionIds(new Set([firstEntry.id]));
        setSessionQuestionCount(1);
        setComingFromCelebration(false);
        setCurrentScreen('question');
      }
      return;
    }
    
    // For other activities, use random selection
    const firstQuestion = selectRandomQuestion(availableQuestions);
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
    
    // For story_activity during the story, don't show celebration - it handles its own flow internally
    if (selectedQuestionType === 'story_activity') {
      return;
    }
    
    setComingFromCelebration(true);
    setCurrentScreen('celebration');
    setRetryCount(0);
  };

  const handleNextQuestion = () => {
    if (sessionQuestionCount >= maxQuestionsPerSession) {
      setCurrentScreen('complete');
      return;
    }

    const remainingQuestions = availableQuestions.filter(q => !askedQuestionIds.has(q.id));
    
    if (remainingQuestions.length === 0) {
      setCurrentScreen('complete');
      return;
    }

    const nextQuestion = selectRandomQuestion(remainingQuestions);
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
      setAskedQuestionIds(prev => new Set([...prev, nextQuestion.id]));
      setSessionQuestionCount(prev => prev + 1);
      setRetryCount(0);
      setComingFromCelebration(false);
      setCurrentScreen('question');
    } else {
      setCurrentScreen('complete');
    }
  };

  const handleCelebrationComplete = () => {
    // If story activity just completed, finish the session instead of next question
    if (storyActivityComplete) {
      setStoryActivityComplete(false); // Reset for next time
      handleCompleteSession();
      return;
    }
    
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
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-black mb-4">
                  Choose Your Learning Adventure with {therapistName}!
                </h2>
                <p className="text-gray-600 text-lg">
                  {showLessonsPanel ? 'Choose a lesson or practice all questions' : 'Click on an activity to see available lessons'}
                </p>
              </div>
              
              <div className="flex max-w-7xl mx-auto gap-8 min-h-[500px]">
                {/* Activity Cards Section */}
                <div 
                  ref={cardsContainerRef}
                  className={`transition-all duration-300 ease-out ${showLessonsPanel ? 'w-2/5' : 'w-full'} overflow-y-auto max-h-[calc(100vh-300px)]`}
                >
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
                          className={`${type.color} ${type.textColor} ${borderRadiusClass} p-6 cursor-pointer ${showLessonsPanel ? 'border-2 border-gray-300' : 'border-3'} transition-all duration-300 ease-out h-[240px] flex flex-col items-center justify-center ${
                            isOtherHovered 
                              ? 'opacity-40' 
                              : showLessonsPanel 
                                ? 'hover:opacity-80' 
                                : 'hover:shadow-xl hover:border-white'
                          } ${showLessonsPanel ? 'w-80' : 'w-full max-w-80'}`}
                          onClick={() => handleActivityClick(type.value)}
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
                </div>

                {/* Lessons Panel */}
                <div 
                  className={`transition-all duration-800 ease-out overflow-hidden ${showLessonsPanel ? 'w-3/5 opacity-100' : 'w-0 opacity-0'}`}
                >
                  {showLessonsPanel && hoveredActivityType && (() => {
                    const selectedType = questionTypes.find(t => t.value === hoveredActivityType);
                    if (!selectedType) return null;
                    
                    return (
                      <div className={`${selectedType.color.replace('hover:bg-', 'bg-').replace('border-', '')} rounded-2xl shadow-xl border-3 border-white p-6 h-full relative overflow-y-auto`}>
                        <button
                          onClick={handleCloseLessons}
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
                          {lessons
                            .filter(lesson => lesson.question_type === hoveredActivityType)
                            .map((lesson, idx) => {
                              const lessonColors = [
                                'bg-white bg-opacity-60 hover:bg-opacity-80 border-white border-opacity-50',
                                'bg-white bg-opacity-60 hover:bg-opacity-80 border-white border-opacity-50',
                                'bg-white bg-opacity-60 hover:bg-opacity-80 border-white border-opacity-50',
                                'bg-white bg-opacity-60 hover:bg-opacity-80 border-white border-opacity-50',
                                'bg-white bg-opacity-60 hover:bg-opacity-80 border-white border-opacity-50',
                              ];
                              const colorClass = lessonColors[idx % lessonColors.length];
                              const difficultyIcons = { beginner: '⭐', intermediate: '⭐⭐', advanced: '⭐⭐⭐' };

                              return (
                                <div
                                  key={lesson.id}
                                  className={`${colorClass} border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md`}
                                  onClick={() => handleDirectLessonSelect(lesson.id, hoveredActivityType)}
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
                                          {difficultyIcons[lesson.difficulty_level as keyof typeof difficultyIcons] || '⭐'} {lesson.difficulty_level}
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
                          
                          {lessons.filter(lesson => lesson.question_type === hoveredActivityType).length === 0 && (
                            <div className="text-center text-gray-600 py-8">
                              <p>No specific lessons available yet.</p>
                              <p className="text-sm">You can practice with all available questions!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <button
                  onClick={handleBackToTherapists}
                  className="text-gray-600 hover:text-gray-800 text-lg font-medium bg-white px-6 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  ← Back to Therapists
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
            <>
              {/* Story Activity View */}
              {currentQuestion.questionType === 'story_activity' && (
                <StoryActivityView
                  storyEntries={availableQuestions}
                  imageUrls={imageUrls}
                  questionNumber={sessionQuestionCount}
                  totalQuestions={maxQuestionsPerSession}
                  therapistName={therapistName}
                  childName={childName}
                  onCorrectAnswer={handleCorrectAnswer}
                  onComplete={handleCompleteSession}
                  onStoryComplete={() => {
                    setStoryActivityComplete(true);
                    setComingFromCelebration(true);
                    setCurrentScreen('celebration');
                  }}
                  comingFromCelebration={comingFromCelebration}
                />
              )}
              
              {/* Tap and Play View */}
              {currentQuestion.questionType === 'tap_and_play' && (
                <TapAndPlayView
                  question={currentQuestion}
                  imageUrls={imageUrls}
                  questionNumber={sessionQuestionCount}
                  totalQuestions={Math.min(maxQuestionsPerSession, availableQuestions.length)}
                  therapistName={therapistName}
                  childName={childName}
                  onCorrectAnswer={handleCorrectAnswer}
                  onNextQuestion={handleNextQuestion}
                  onComplete={() => setCurrentScreen('complete')}
                  retryCount={retryCount}
                  onRetryCountChange={setRetryCount}
                  comingFromCelebration={comingFromCelebration}
                />
              )}
              
              {/* All other question types */}
              {!['tap_and_play', 'story_activity'].includes(currentQuestion.questionType || '') && (
                <SingleQuestionView
                  question={currentQuestion}
                  imageUrl={currentQuestion.imageName ? imageUrls[currentQuestion.imageName] : undefined}
                  questionNumber={sessionQuestionCount}
                  totalQuestions={Math.min(maxQuestionsPerSession, availableQuestions.length)}
                  therapistName={therapistName}
                  childName={childName}
                  onCorrectAnswer={handleCorrectAnswer}
                  onNextQuestion={handleNextQuestion}
                  onComplete={() => setCurrentScreen('complete')}
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
            </>
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
                const selectedLesson = lessons.find(lesson => lesson.id === selectedLessonId);
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

export default AILearningAdventure;


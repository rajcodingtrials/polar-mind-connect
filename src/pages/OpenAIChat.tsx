import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '../hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, MessageCircle, Building, Heart } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import ProgressCharacter from '../components/ProgressCharacter';
import IntroductionScreen from '../components/IntroductionScreen';
import SingleQuestionView from '../components/SingleQuestionView';
import MiniCelebration from '../components/MiniCelebration';
import LessonSelection from '../components/LessonSelection';

type QuestionType = Database['public']['Enums']['question_type_enum'];

interface Question {
  id: string;
  question: string;
  answer: string;
  imageName?: string;
  questionType?: QuestionType;
  lessonId?: string | null;
  lesson?: {
    id: string;
    name: string;
    description: string | null;
    difficulty_level: string;
  } | null;
}

const OpenAIChatPage = () => {
  const { profile } = useUserProfile();
  const [showChat, setShowChat] = useState(false);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [imageUrls, setImageUrls] = useState<{[key: string]: string}>({});
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [therapistName, setTherapistName] = useState('Laura');
  
  // Updated state for better question management
  const [currentScreen, setCurrentScreen] = useState<'home' | 'lesson-selection' | 'introduction' | 'question' | 'celebration' | 'complete'>('home');
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [askedQuestionIds, setAskedQuestionIds] = useState<Set<string>>(new Set());
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [speechDelayMode, setSpeechDelayMode] = useState(false);
  const [sessionQuestionCount, setSessionQuestionCount] = useState(0);
  const [comingFromCelebration, setComingFromCelebration] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const maxQuestionsPerSession = 5;

  // New state for enhanced activity selection
  const [hoveredActivityType, setHoveredActivityType] = useState<QuestionType | null>(null);
  const [showLessonsPanel, setShowLessonsPanel] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  

  // Set childName from profile (fallback to 'friend' if not available)
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
    }
  ];

  useEffect(() => {
    const loadQuestionsAndImages = async () => {
      try {
        // Load questions from Supabase with lesson information
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
            questionType: q.question_type,
            lessonId: q.lesson_id,
            lesson: q.lessons
          }));
          
          setQuestions(formattedQuestions);
          console.log('Loaded questions from Supabase:', formattedQuestions.length);
          console.log('Questions by type:', formattedQuestions.reduce((acc, q) => {
            acc[q.questionType || 'unknown'] = (acc[q.questionType || 'unknown'] || 0) + 1;
            return acc;
          }, {} as Record<string, number>));

          // Load image URLs for questions that have images
          const imageUrlMap: {[key: string]: string} = {};
          
          for (const question of formattedQuestions) {
            if (question.imageName) {
              const { data } = supabase.storage
                .from('question-images')
                .getPublicUrl(question.imageName);
              
              if (data?.publicUrl) {
                imageUrlMap[question.imageName] = data.publicUrl;
                console.log(`Loaded image URL for ${question.imageName}:`, data.publicUrl);
              }
            }
          }
          
          setImageUrls(imageUrlMap);
          console.log('Loaded image URLs:', Object.keys(imageUrlMap).length);
        }

        // Load all lessons
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (!lessonsError && lessonsData) {
          setLessons(lessonsData);
          
          // Fetch question counts for each lesson
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
            // Create object URL from base64 data
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
          console.log('Updated image URLs from storage event:', Object.keys(urlMap).length);
        } catch (error) {
          console.error('Error processing updated images:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLauraClick = () => {
    setTherapistName('Laura');
    setShowQuestionTypes(true);
  };

  const selectRandomQuestion = (questionsPool: Question[]): Question | null => {
    if (questionsPool.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * questionsPool.length);
    return questionsPool[randomIndex];
  };

  const handleQuestionTypeSelect = (questionType: QuestionType) => {
    console.log('🎯 Selected question type:', questionType);
    setSelectedQuestionType(questionType);
    setShowQuestionTypes(false);
    setCorrectAnswers(0);
    setRetryCount(0);
    setSpeechDelayMode(false);
    setSessionQuestionCount(0);
    setAskedQuestionIds(new Set());
    setSelectedLessonId(null);
    
    // Move to lesson selection screen
    setCurrentScreen('lesson-selection');
  };

  const handleDirectLessonSelect = (lessonId: string | null, questionType: QuestionType) => {
    console.log('📚 Direct lesson select:', lessonId, questionType);
    setSelectedQuestionType(questionType);
    setSelectedLessonId(lessonId);
    setShowQuestionTypes(false);
    setCorrectAnswers(0);
    setRetryCount(0);
    setSpeechDelayMode(false);
    setSessionQuestionCount(0);
    setAskedQuestionIds(new Set());
    
    // Filter questions based on lesson selection
    let filteredQuestions: Question[];
    
    if (lessonId) {
      // Filter by specific lesson
      filteredQuestions = questions.filter(q => 
        q.questionType === questionType && 
        q.lessonId === lessonId
      );
    } else {
      // Filter by question type only (all questions for this type)
      filteredQuestions = questions.filter(q => q.questionType === questionType);
    }
    
    setAvailableQuestions(filteredQuestions);
    setCurrentScreen('introduction');
  };

  const handleLessonSelect = (lessonId: string | null) => {
    console.log('📚 Selected lesson:', lessonId);
    setSelectedLessonId(lessonId);
    
    // Filter questions based on lesson selection
    let filteredQuestions: Question[];
    
    if (lessonId) {
      // Filter by specific lesson
      filteredQuestions = questions.filter(q => 
        q.questionType === selectedQuestionType && 
        q.lessonId === lessonId
      );
      console.log('🎯 Questions for specific lesson:', filteredQuestions.length);
    } else {
      // Filter by question type only (all questions for this type)
      filteredQuestions = questions.filter(q => q.questionType === selectedQuestionType);
      console.log('🎯 All questions for type:', filteredQuestions.length);
    }
    
    setAvailableQuestions(filteredQuestions);
    setCurrentScreen('introduction');
  };

  const handleBackToQuestionTypes = () => {
    setCurrentScreen('home');
    setShowQuestionTypes(true);
  };

  const handleStartQuestions = () => {
    // Select first random question
    const firstQuestion = selectRandomQuestion(availableQuestions);
    if (firstQuestion) {
      console.log('🎯 Starting with question:', firstQuestion.question);
      setCurrentQuestion(firstQuestion);
      setAskedQuestionIds(new Set([firstQuestion.id]));
      setSessionQuestionCount(1);
      setComingFromCelebration(false); // Ensure first question is not from celebration
      console.log('🔄 comingFromCelebration set to false for first question');
      setCurrentScreen('question');
    }
  };

  const handleCorrectAnswer = () => {
    console.log('🎉 Correct answer! Moving to celebration...');
    console.log('📊 Correct answer state:', {
      currentQuestionId: currentQuestion?.id,
      sessionQuestionCount,
      correctAnswers: correctAnswers + 1
    });
    setCorrectAnswers(prev => prev + 1);
    setComingFromCelebration(true);
    console.log('🔄 comingFromCelebration set to true for celebration');
    setCurrentScreen('celebration');
    setRetryCount(0);
  };

  const handleNextQuestion = () => {
    console.log('🔄 Moving to next question...');
    console.log('📊 Current session state:', {
      sessionQuestionCount,
      maxQuestionsPerSession,
      askedQuestionIds: Array.from(askedQuestionIds),
      availableQuestionsCount: availableQuestions.length
    });
    
    if (sessionQuestionCount >= maxQuestionsPerSession) {
      console.log('🏁 Session complete - reached max questions');
      setCurrentScreen('complete');
      return;
    }

    // Get remaining questions (not asked yet)
    const remainingQuestions = availableQuestions.filter(q => !askedQuestionIds.has(q.id));
    console.log('🎯 Remaining questions:', remainingQuestions.length);
    console.log('🎯 Remaining question IDs:', remainingQuestions.map(q => q.id));
    
    if (remainingQuestions.length === 0) {
      console.log('🏁 No more questions available - session complete');
      setCurrentScreen('complete');
      return;
    }

    // Select next random question
    const nextQuestion = selectRandomQuestion(remainingQuestions);
    if (nextQuestion) {
      console.log('🎯 Next question selected:', {
        id: nextQuestion.id,
        question: nextQuestion.question,
        newSessionCount: sessionQuestionCount + 1
      });
      setCurrentQuestion(nextQuestion);
      setAskedQuestionIds(prev => new Set([...prev, nextQuestion.id]));
      setSessionQuestionCount(prev => prev + 1);
      setRetryCount(0);
      setComingFromCelebration(false); // Reset immediately
      console.log('🔄 comingFromCelebration reset to false for next question');
      setCurrentScreen('question');
    } else {
      console.log('🏁 No valid next question - session complete');
      setCurrentScreen('complete');
    }
  };

  const handleCelebrationComplete = () => {
    console.log('🎊 Celebration complete - moving to next question');
    console.log('📊 Celebration state:', {
      sessionQuestionCount,
      correctAnswers,
      currentQuestionId: currentQuestion?.id
    });
    handleNextQuestion();
  };

  const handleCompleteSession = () => {
    console.log('🔄 Resetting session...');
    setCurrentScreen('home');
    setShowQuestionTypes(false);
    setSelectedQuestionType(null);
    setCorrectAnswers(0);
    setRetryCount(0);
    setSpeechDelayMode(false);
    setTherapistName('Laura');
    setCurrentQuestion(null);
    setAvailableQuestions([]);
    setAskedQuestionIds(new Set());
    setSessionQuestionCount(0);
  };

  const handleCloseChat = () => {
    handleCompleteSession();
  };

  const handleLawrenceClick = () => {
    console.log('Lawrence clicked - setting Lawrence as therapist');
    setTherapistName('Lawrence');
    setShowQuestionTypes(true);
    setCurrentScreen('home');
  };

  // Click handlers for activity selection
  const handleActivityClick = (questionType: QuestionType) => {
    if (hoveredActivityType === questionType && showLessonsPanel) {
      // If clicking the same activity that's already open, close the panel
      setHoveredActivityType(null);
      setShowLessonsPanel(false);
    } else {
      // Show lessons for the clicked activity
      setHoveredActivityType(questionType);
      setShowLessonsPanel(true);
    }
  };

  const handleCloseLessons = () => {
    setHoveredActivityType(null);
    setShowLessonsPanel(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <Header />
      <main className="flex-grow p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Home Screen */}
          {currentScreen === 'home' && !showQuestionTypes && (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-5xl font-bold mb-4 text-slate-700">
                  Welcome, {profile?.name || 'User'}!
                </h1>
              </div>

              {/* Affirmation for the day Section */}
              <Card className="mb-8 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 hover:border-amber-300 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-black flex items-center gap-2 pl-2">
                    Affirmation for the day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-black text-lg pl-2">
                    You are amazing just the way you are! 🌟 Every word you say is important and every sound you make is beautiful. Today is going to be filled with fun learning and lots of smiles! 😊
                  </p>
                </CardContent>
              </Card>

              {/* Your Therapists Section */}
              <Card className="mb-8 bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-slate-700 flex items-center gap-2">
                    Your Therapists
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div 
                      className="flex items-center space-x-6 cursor-pointer bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 p-6 rounded-2xl transition-all duration-300 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-xl hover:scale-105 min-h-[120px]"
                      onClick={handleLauraClick}
                    >
                      <Avatar className="h-20 w-20 border-2 border-blue-200">
                        <AvatarImage 
                          src="/lovable-uploads/Laura.png" 
                          alt="Laura" 
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">L</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-700 text-xl mb-2">Laura 💫</h3>
                        <p className="text-slate-600 text-base">Lead Speech Language Pathologist</p>
                      </div>
                    </div>
                    <div 
                      className="flex items-center space-x-6 cursor-pointer bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 p-6 rounded-2xl transition-all duration-300 border border-green-200 hover:border-green-300 shadow-sm hover:shadow-xl hover:scale-105 min-h-[120px]"
                      onClick={handleLawrenceClick}
                    >
                      <Avatar className="h-20 w-20 border-2 border-green-200">
                        <AvatarImage 
                          src="/lovable-uploads/Lawrence.png" 
                          alt="Lawrence" 
                        />
                        <AvatarFallback className="bg-green-100 text-green-600 text-lg">L</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-700 text-xl mb-2">Lawrence 🌟</h3>
                        <p className="text-slate-600 text-base">Associate Speech Language Pathologist</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

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
                <div className={`transition-all duration-300 ease-out ${showLessonsPanel ? 'w-2/5' : 'w-full'}`}>
                  <div className={`grid gap-8 ${showLessonsPanel ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'} justify-items-center`}>
                    {/* Show selected activity first when panel is open */}
                    {showLessonsPanel && hoveredActivityType && (() => {
                      const selectedType = questionTypes.find(type => type.value === hoveredActivityType);
                      if (!selectedType) return null;
                      
                      const questionsOfType = questions.filter(q => q.questionType === selectedType.value).length;
                      const lessonsOfType = questions.filter(q => q.questionType === selectedType.value && q.lessonId).length;
                      const IconComponent = selectedType.icon;
                      
                      return (
                        <div
                          key={`selected-${selectedType.value}`}
                          className={`${selectedType.color} ${selectedType.textColor} rounded-3xl p-8 cursor-pointer border-3 transition-all duration-300 ease-out min-h-[250px] flex flex-col justify-between shadow-2xl border-white scale-105 w-80 ring-4 ring-blue-300`}
                          onClick={() => handleActivityClick(selectedType.value)}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className="bg-white rounded-full p-4 mb-4 shadow-lg">
                              <IconComponent className={`w-8 h-8 ${selectedType.textColor}`} />
                            </div>
                            <h3 className="font-bold text-xl mb-3">{selectedType.label} ✨</h3>
                            <p className="text-sm opacity-90 leading-relaxed">{selectedType.description}</p>
                          </div>
                          
                          {questionsOfType > 0 ? (
                            <div className="mt-4 text-center space-y-1">
                              <span className="bg-white bg-opacity-90 px-4 py-2 rounded-full text-sm font-semibold shadow-sm block">
                                🎯 {questionsOfType} questions ready!
                              </span>
                              {lessonsOfType > 0 && (
                                <span className="bg-white bg-opacity-80 px-3 py-1 rounded-full text-xs font-medium shadow-sm block">
                                  📚 Organized in lessons
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="mt-4 text-center">
                              <span className="bg-white bg-opacity-60 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                                ✨ AI-generated content
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    
                    {/* Show other activities */}
                    {questionTypes
                      .filter(type => !showLessonsPanel || type.value !== hoveredActivityType)
                      .map((type) => {
                        const questionsOfType = questions.filter(q => q.questionType === type.value).length;
                        const lessonsOfType = questions.filter(q => q.questionType === type.value && q.lessonId).length;
                        const IconComponent = type.icon;
                        const isOtherHovered = showLessonsPanel && hoveredActivityType && hoveredActivityType !== type.value;
                        
                        return (
                          <div
                            key={type.value}
                            className={`${type.color} ${type.textColor} rounded-3xl p-8 cursor-pointer border-3 transition-all duration-300 ease-out min-h-[250px] flex flex-col justify-between ${
                              isOtherHovered 
                                ? 'opacity-40 scale-95' 
                                : 'hover:shadow-xl hover:scale-105 hover:border-white'
                            } ${showLessonsPanel ? 'w-80' : 'w-full max-w-80'}`}
                            onClick={() => handleActivityClick(type.value)}
                          >
                            <div className="flex flex-col items-center text-center">
                              <div className="bg-white rounded-full p-4 mb-4 shadow-lg">
                                <IconComponent className={`w-8 h-8 ${type.textColor}`} />
                              </div>
                              <h3 className="font-bold text-xl mb-3">{type.label}</h3>
                              <p className="text-sm opacity-90 leading-relaxed">{type.description}</p>
                            </div>
                            
                            {questionsOfType > 0 ? (
                              <div className="mt-4 text-center space-y-1">
                                <span className="bg-white bg-opacity-90 px-4 py-2 rounded-full text-sm font-semibold shadow-sm block">
                                  🎯 {questionsOfType} questions ready!
                                </span>
                                {lessonsOfType > 0 && (
                                  <span className="bg-white bg-opacity-80 px-3 py-1 rounded-full text-xs font-medium shadow-sm block">
                                    📚 Organized in lessons
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="mt-4 text-center">
                                <span className="bg-white bg-opacity-60 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                                  ✨ AI-generated content
                                </span>
                              </div>
                            )}
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
                      <div className={`${selectedType.color.replace('hover:bg-', 'bg-').replace('border-', '')} rounded-2xl shadow-xl border-3 border-white p-6 h-full relative`}>
                        {/* Close button */}
                        <button
                          onClick={handleCloseLessons}
                          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors bg-white rounded-full p-1 shadow-md"
                        >
                          ✕
                        </button>
                        <div className="mb-6">
                          <h3 className={`text-2xl font-bold mb-2 ${selectedType.textColor}`}>
                            {selectedType.label} Lessons
                          </h3>
                          <p className={`${selectedType.textColor} opacity-80`}>Choose a specific lesson or practice with all questions</p>
                        </div>
                        
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {/* Practice All Questions Option */}
                          <div
                            className="bg-white bg-opacity-70 hover:bg-opacity-90 border border-white border-opacity-50 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
                            onClick={() => handleDirectLessonSelect(null, hoveredActivityType)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-white rounded-full p-2">
                                <BookOpen className="w-5 h-5 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">Practice All Questions</h4>
                                <p className="text-sm text-gray-600">Mix of all difficulty levels</p>
                              </div>
                              <span className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                {questions.filter(q => q.questionType === hoveredActivityType).length} questions
                              </span>
                            </div>
                          </div>

                          {/* Individual Lessons */}
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
                  onClick={() => {
                    setShowQuestionTypes(false);
                    setHoveredActivityType(null);
                  }}
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

          {/* Single Question View */}
          {currentScreen === 'question' && selectedQuestionType && currentQuestion && (
            <SingleQuestionView
              question={currentQuestion}
              imageUrl={currentQuestion.imageName ? imageUrls[currentQuestion.imageName] : undefined}
              questionNumber={sessionQuestionCount}
              totalQuestions={Math.min(maxQuestionsPerSession, availableQuestions.length)}
              therapistName={therapistName}
              childName={childName}
              speechDelayMode={speechDelayMode}
              onCorrectAnswer={handleCorrectAnswer}
              onNextQuestion={handleNextQuestion}
              onComplete={() => setCurrentScreen('complete')}
              retryCount={retryCount}
              onRetryCountChange={setRetryCount}
              onSpeechDelayModeChange={setSpeechDelayMode}
              comingFromCelebration={comingFromCelebration}
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

          {/* Complete Session with Progress Character */}
          {currentScreen === 'complete' && (
            <div className="flex flex-col items-center justify-center min-h-[80vh]">
              <ProgressCharacter 
                correctAnswers={correctAnswers}
                totalQuestions={Math.min(maxQuestionsPerSession, availableQuestions.length)}
                questionType={selectedQuestionType}
              />
              <div className="mt-8">
                <Button
                  onClick={handleCompleteSession}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 text-lg font-bold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Continue Learning! 🚀
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OpenAIChatPage;

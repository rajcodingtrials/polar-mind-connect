import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../context/AuthContext';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, MessageCircle, Building, Heart, User } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { getQuestionTypes, getQuestionTypeLabel, getQuestionTypeDescription } from '@/utils/questionTypes';
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
  question_video: string | null;
  video_after_answer: string | null;
  image_after_answer: string | null;
  speech_after_answer: string | null;
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
  overrideUseAiTherapist?: boolean;
}

const AILearningAdventure_v2: React.FC<AILearningAdventure_v2Props> = ({ therapistName, overrideUseAiTherapist }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useUserProfile();
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  
  // Use override value if provided (for therapist preview mode), otherwise use preferences
  const effectiveUseAiTherapist = overrideUseAiTherapist !== undefined 
    ? overrideUseAiTherapist 
    : (preferences?.useAiTherapist !== false);
  
  // Debug logging for therapist preview mode
  useEffect(() => {
    console.log('[AILearningAdventure_v2] overrideUseAiTherapist:', overrideUseAiTherapist);
    console.log('[AILearningAdventure_v2] preferences?.useAiTherapist:', preferences?.useAiTherapist);
    console.log('[AILearningAdventure_v2] effectiveUseAiTherapist:', effectiveUseAiTherapist);
  }, [overrideUseAiTherapist, preferences?.useAiTherapist, effectiveUseAiTherapist]);
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

  // Define 6 reusable color styles that cycle for all question types
  const colorStyles = [
    { color: 'bg-blue-100 hover:bg-blue-200 border-blue-200', textColor: 'text-blue-800', icon: BookOpen },
    { color: 'bg-amber-100 hover:bg-amber-200 border-amber-200', textColor: 'text-amber-800', icon: MessageCircle },
    { color: 'bg-purple-100 hover:bg-purple-200 border-purple-200', textColor: 'text-purple-800', icon: User },
    { color: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-200', textColor: 'text-emerald-800', icon: Building },
    { color: 'bg-orange-100 hover:bg-orange-200 border-orange-200', textColor: 'text-orange-800', icon: Heart },
    { color: 'bg-rose-100 hover:bg-rose-200 border-rose-200', textColor: 'text-rose-800', icon: BookOpen },
  ];

  const questionTypes = getQuestionTypes().map((type, index) => {
    // Cycle through the 6 color styles using modulo
    const styleIndex = index % colorStyles.length;
    const config = colorStyles[styleIndex];
    return {
      value: type as QuestionType,
      label: getQuestionTypeLabel(type),
      description: getQuestionTypeDescription(type),
      color: config.color,
      textColor: config.textColor,
      icon: config.icon
    };
  });

  // Handle lesson retry from sessionStorage
  useEffect(() => {
    // Check sessionStorage for retry lesson (set from ParentHome)
    const retryLessonStr = sessionStorage.getItem('retryLesson');
    if (retryLessonStr) {
      try {
        const retryLesson = JSON.parse(retryLessonStr);
        // Only use if it's recent (within 5 seconds)
        if (Date.now() - retryLesson.timestamp < 5000) {
          const lessonId = retryLesson.lessonId;
          const questionType = retryLesson.questionType;
          
          // Clear sessionStorage
          sessionStorage.removeItem('retryLesson');
          
          // Set the selected lesson and question type
          setSelectedLessonId(lessonId);
          setSelectedQuestionType(questionType as QuestionType);
          setShowQuestionTypes(false);
          setCorrectAnswers(0);
          setRetryCount(0);
          setSessionQuestionCount(0);
          setAskedQuestionIds(new Set());
        }
      } catch (e) {
        console.error('Error parsing retry lesson:', e);
        sessionStorage.removeItem('retryLesson');
      }
    }
  }, []);

  // Auto-start lesson if selected (after questions are loaded)
  useEffect(() => {
    if (selectedLessonId && selectedQuestionType && questions.length > 0 && !showQuestionTypes) {
      // Start the lesson
      handleDirectLessonSelect(selectedLessonId, selectedQuestionType);
    }
  }, [selectedLessonId, selectedQuestionType, questions.length, showQuestionTypes]);

  // Record lesson activity when introduction screen is shown (fallback)
  useEffect(() => {
    if (currentScreen === 'introduction' && selectedLessonId && user?.id) {
      recordLessonActivity('started', selectedLessonId);
    }
  }, [currentScreen, selectedLessonId, user?.id]);

  // Load parent's available lessons (combining default lessons with user's custom lessons)
  useEffect(() => {
    const loadParentLessons = async () => {
      if (!user?.id) return;
      
      try {
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
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (parentError && parentError.code !== 'PGRST116') {
          // PGRST116 means no rows found, which is okay for new users
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
              question_video: q.question_video || null,
              video_after_answer: q.video_after_answer || null,
              image_after_answer: q.image_after_answer || null,
              speech_after_answer: q.speech_after_answer || null,
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
          .select('id, name, description, question_type, level, is_verified, youtube_video_id, created_at, updated_at, num_reviews, average_review, priority')
          .eq('is_verified', true);

        if (!lessonsError && lessonsData) {
          // Ensure all lessons have question_type field
          let validLessons = (lessonsData as any[]).filter(lesson => lesson && lesson.question_type);
          
          // If user is a parent, filter lessons to only show those in their lessons list
          if (parentLessons.length > 0) {
            validLessons = validLessons.filter(lesson => parentLessons.includes(lesson.id));
          }
          
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
      // When progress buddy is shown, check if all questions were answered and update status to 'complete'
      const allQuestionsAnswered = askedQuestionIds.size >= availableQuestions.length;
      if (allQuestionsAnswered && selectedLessonId && user?.id) {
        recordLessonActivity('complete', selectedLessonId);
      }
      
      const timer = setTimeout(() => {
        setShowRewardVideo(true);
        setShowConfetti(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, showRewardVideo, askedQuestionIds.size, availableQuestions.length, selectedLessonId, user?.id]);

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

  const handleDirectLessonSelect = async (lessonId: string | null, questionType: QuestionType) => {
    setSelectedQuestionType(questionType);
    setSelectedLessonId(lessonId);
    setShowQuestionTypes(false);
    setCorrectAnswers(0);
    setRetryCount(0);
    setSessionQuestionCount(0);
    setAskedQuestionIds(new Set());
    
    // Record lesson activity as 'started' when lesson is selected
    if (lessonId && user?.id) {
      console.log('handleDirectLessonSelect: Recording lesson activity for lesson:', lessonId);
      await recordLessonActivity('started', lessonId);
    } else {
      console.log('handleDirectLessonSelect: Skipping - lessonId:', lessonId, 'user?.id:', user?.id);
    }
    
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
    // Skip introduction if admin setting is enabled OR if user has disabled AI therapist
    console.log('[handleDirectLessonSelect] effectiveUseAiTherapist:', effectiveUseAiTherapist, 'adminSettings.skip_introduction:', adminSettings?.skip_introduction);
    if ((adminSettings && adminSettings.skip_introduction) || effectiveUseAiTherapist === false) {
      console.log('[handleDirectLessonSelect] Skipping introduction, going directly to questions');
      // Pass filteredQuestions directly to avoid race condition with state update
      handleStartQuestions(filteredQuestions);
    } else {
      console.log('[handleDirectLessonSelect] Showing introduction screen');
      setCurrentScreen('introduction');
    }
  };

  const handleLessonSelect = async (lessonId: string | null) => {
    setSelectedLessonId(lessonId);
    
    // Record lesson activity as 'started' when lesson is selected
    if (lessonId && user?.id) {
      console.log('handleDirectLessonSelect: Recording lesson activity for lesson:', lessonId);
      await recordLessonActivity('started', lessonId);
    } else {
      console.log('handleDirectLessonSelect: Skipping - lessonId:', lessonId, 'user?.id:', user?.id);
    }
    
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
    // Skip introduction if admin setting is enabled OR if user has disabled AI therapist
    console.log('[handleLessonSelect] effectiveUseAiTherapist:', effectiveUseAiTherapist, 'adminSettings.skip_introduction:', adminSettings?.skip_introduction);
    if ((adminSettings && adminSettings.skip_introduction) || effectiveUseAiTherapist === false) {
      console.log('[handleLessonSelect] Skipping introduction, going directly to questions');
      // Pass filteredQuestions directly to avoid race condition with state update
      handleStartQuestions(filteredQuestions);
    } else {
      // Ensure questions are available before showing introduction screen
      if (filteredQuestions.length > 0) {
        console.log('[handleLessonSelect] Showing introduction screen');
        setCurrentScreen('introduction');
      } else {
        console.error('No questions available for lesson:', lessonId);
      }
    }
  };

  // Helper function to record lesson activity with status
  const recordLessonActivity = async (status: 'started' | 'complete', lessonIdOverride?: string | null) => {
    const lessonIdToUse = lessonIdOverride !== undefined ? lessonIdOverride : selectedLessonId;
    if (!lessonIdToUse || !user?.id) {
      console.log('Skipping lesson activity record - lessonId:', lessonIdToUse, 'userId:', user?.id);
      return;
    }
    
    try {
      // Verify the current authenticated user matches the user.id from context
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        console.error('Error getting authenticated user:', authError);
        return;
      }
      
      if (authUser.id !== user.id) {
        console.error('User ID mismatch - authUser.id:', authUser.id, 'user.id:', user.id);
        return;
      }
      
      const upsertData: any = {
        user_id: authUser.id, // Use authUser.id to ensure it matches auth.uid()
        lesson_id: lessonIdToUse,
        status: status,
      };
      
      // Only set completed_at if status is 'complete'
      if (status === 'complete') {
        upsertData.completed_at = new Date().toISOString();
      }
      
      console.log('Attempting to record lesson activity:', upsertData);
      console.log('Auth user ID:', authUser.id);
      
      // First, try to find existing record
      const { data: existingData, error: checkError } = await supabase
        .from('lesson_activity' as any)
        .select('id')
        .eq('user_id', authUser.id)
        .eq('lesson_id', lessonIdToUse)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking for existing lesson activity:', checkError);
      }
      
      let data, activityError;
      
      if (existingData) {
        // Update existing record
        console.log('Updating existing lesson activity record:', existingData.id);
        const updateResult = await supabase
          .from('lesson_activity' as any)
          .update(upsertData)
          .eq('id', existingData.id)
          .select();
        data = updateResult.data;
        activityError = updateResult.error;
      } else {
        // Insert new record
        console.log('Inserting new lesson activity record');
        const insertResult = await supabase
          .from('lesson_activity' as any)
          .insert(upsertData)
          .select();
        data = insertResult.data;
        activityError = insertResult.error;
      }

      if (activityError) {
        console.error('Error recording lesson activity:', activityError);
        console.error('Error details:', JSON.stringify(activityError, null, 2));
        console.error('Upsert data:', upsertData);
        console.error('Auth user ID:', authUser.id);
      } else {
        console.log('Successfully recorded lesson activity:', { lessonId: lessonIdToUse, status, data });
      }
    } catch (error) {
      console.error('Exception recording lesson activity:', error);
      console.error('Exception details:', error instanceof Error ? error.message : String(error));
    }
  };

  const handleBackToQuestionTypes = async () => {
    // Record lesson activity as 'started' when user navigates away
    await recordLessonActivity('started');
    setCurrentScreen('home');
    setShowQuestionTypes(true);
  };

  const handleBackToTherapists = async () => {
    // Record lesson activity as 'started' when user navigates away
    await recordLessonActivity('started');
    navigate('/home', { state: { resetTherapist: true } });
  };

  const handleStartQuestions = async (questionsToUse?: Question_v2[]) => {
    // Record lesson activity as 'started' when lesson begins (if not already recorded)
    if (selectedLessonId && user?.id) {
      console.log('handleStartQuestions: Recording lesson activity for lesson:', selectedLessonId);
      await recordLessonActivity('started', selectedLessonId);
    } else {
      console.log('handleStartQuestions: Skipping - selectedLessonId:', selectedLessonId, 'user?.id:', user?.id);
    }
    
    // Use provided questions or fall back to availableQuestions from state
    // Ensure questionsToStart is always an array (never undefined)
    let questionsToStart: Question_v2[] = [];
    
    if (questionsToUse && Array.isArray(questionsToUse) && questionsToUse.length > 0) {
      questionsToStart = questionsToUse;
    } else if (availableQuestions && Array.isArray(availableQuestions) && availableQuestions.length > 0) {
      questionsToStart = availableQuestions;
    }
    
    // If no questions provided and availableQuestions is empty, try to filter questions again
    if (questionsToStart.length === 0) {
      console.warn('handleStartQuestions: No questions provided, attempting to filter questions again', {
        questionsToUse: questionsToUse?.length || 0,
        availableQuestions: availableQuestions.length || 0,
        selectedLessonId,
        selectedQuestionType,
        totalQuestions: questions?.length || 0,
        parentLessons: parentLessons?.length || 0
      });
      
      // Try to filter questions again based on current state
      if (selectedQuestionType && questions && Array.isArray(questions) && questions.length > 0) {
        let filteredQuestions: Question_v2[] = [];
        
        if (selectedLessonId) {
          filteredQuestions = questions.filter(q => 
            q && 
            q.question_type === selectedQuestionType && 
            q.lesson_id === selectedLessonId &&
            (parentLessons.length === 0 || parentLessons.includes(selectedLessonId))
          );
        } else {
          filteredQuestions = questions.filter(q => 
            q &&
            q.question_type === selectedQuestionType &&
            (parentLessons.length === 0 || !q.lesson_id || parentLessons.includes(q.lesson_id))
          );
        }
        
        // Sort by question_index
        filteredQuestions = [...filteredQuestions].sort((a, b) => 
          (a.question_index || 0) - (b.question_index || 0)
        );
        
        console.log('handleStartQuestions: Filtered questions result', {
          filteredCount: filteredQuestions.length,
          selectedLessonId,
          selectedQuestionType,
          totalQuestionsBeforeFilter: questions.length
        });
        
        if (filteredQuestions.length > 0) {
          questionsToStart = filteredQuestions;
          setAvailableQuestions(filteredQuestions);
        }
      } else {
        console.warn('handleStartQuestions: Cannot filter questions - missing required data', {
          selectedQuestionType,
          questionsLength: questions?.length || 0,
          hasQuestions: !!questions,
          isArray: Array.isArray(questions)
        });
      }
    }
    
    // Final safety check - ensure questionsToStart is still an array
    if (!Array.isArray(questionsToStart)) {
      console.error('handleStartQuestions: questionsToStart is not an array!', {
        type: typeof questionsToStart,
        questionsToStart
      });
      questionsToStart = [];
    }
    
    // If still no questions available, log error and return
    if (questionsToStart.length === 0) {
      console.error('handleStartQuestions: No questions available to start after retry', {
        questionsToUse: questionsToUse?.length || 0,
        availableQuestions: availableQuestions?.length || 0,
        selectedLessonId,
        selectedQuestionType,
        totalQuestions: questions?.length || 0,
        parentLessons: parentLessons?.length || 0,
        questionsToStartLength: questionsToStart.length,
        isArray: Array.isArray(questionsToStart)
      });
      return;
    }
    
    // Start at first question (sorted by question_index)
    const firstQuestion = questionsToStart[0];
    if (firstQuestion) {
      setCurrentQuestion(firstQuestion);
      setAskedQuestionIds(new Set([firstQuestion.id]));
      setSessionQuestionCount(1);
      setComingFromCelebration(false);
      setCurrentScreen('question');
    } else {
      console.error('handleStartQuestions: First question is null or undefined', {
        questionsToStartLength: questionsToStart.length,
        questionsToStart: questionsToStart,
        firstQuestion,
        isArray: Array.isArray(questionsToStart)
      });
    }
  };

  const handleCorrectAnswer = () => {
    setCorrectAnswers(prev => prev + 1);
    setRetryCount(0);
    
    // Check if mini celebration should be shown for the current question's lesson
    // Default to true if not set (for backward compatibility)
    // If user preference is 'yes', always show. If 'no', never show. If 'default', use lesson setting
    const lessonSetting = currentQuestion?.add_mini_celebration !== false;
    const userPreference = preferences?.addMiniCelebration || 'default';
    const shouldShowCelebration = userPreference === 'yes' ? true : userPreference === 'no' ? false : lessonSetting;
    
    if (shouldShowCelebration) {
      setComingFromCelebration(true);
      setCurrentScreen('celebration');
    } else {
      // Skip celebration and go directly to next question
      handleNextQuestion();
    }
  };

  const handleNextQuestion = async (shouldIncrement: boolean = true) => {
    if (sessionQuestionCount >= maxQuestionsPerSession) {
      // Check if all questions in the lesson were answered
      const allQuestionsAnswered = askedQuestionIds.size >= availableQuestions.length;
      if (allQuestionsAnswered && selectedLessonId) {
        await recordLessonActivity('complete', selectedLessonId);
      }
      setCurrentScreen('complete');
      return;
    }

    const remainingQuestions = availableQuestions.filter(q => !askedQuestionIds.has(q.id));
    
    if (remainingQuestions.length === 0) {
      // All questions in the lesson have been answered - mark as complete
      if (selectedLessonId) {
        await recordLessonActivity('complete', selectedLessonId);
      }
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

  const handleCompleteSession = async () => {
    // Check if all questions were answered - if so, status should already be 'complete'
    // Otherwise, ensure status is set (it should be 'started' if not all questions were answered)
    const allQuestionsAnswered = askedQuestionIds.size >= availableQuestions.length;
    if (selectedLessonId && !allQuestionsAnswered) {
      // If not all questions were answered, ensure status is 'started'
      await recordLessonActivity('started');
    }
    // If all questions were answered, status should already be 'complete' from handleNextQuestion

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

          {/* Introduction Screen - Only show if useAiTherapist is true */}
          {currentScreen === 'introduction' && selectedQuestionType && effectiveUseAiTherapist && (
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
              onPickNewLesson={async () => {
                await recordLessonActivity('started');
                setCurrentScreen('home');
                setShowQuestionTypes(true);
              }}
              retryCount={retryCount}
              onRetryCountChange={setRetryCount}
              onAmplifyMicChange={handleAmplifyMicChange}
              onMicGainChange={handleMicGainChange}
              comingFromCelebration={comingFromCelebration}
              showMicInput={!!(adminSettings && adminSettings.show_mic_input)}
              amplifyMic={localAmplifyMic}
              micGain={localMicGain}
              useAiTherapist={effectiveUseAiTherapist}
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
                // Check user preference first, then fall back to lesson's video
                const videoId = preferences?.celebrationVideoId || selectedLesson?.youtube_video_id;
                if (videoId) {
                  return (
                    <div className="fade-in flex flex-col items-center">
                      <h3 className="text-2xl font-bold mb-4">🎵 Surprise! Here's a special song as your reward!</h3>
                      <iframe
                        width="800"
                        height="450"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
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


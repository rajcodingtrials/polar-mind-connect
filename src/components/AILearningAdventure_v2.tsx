import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAuth } from '../context/AuthContext';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { useQuestionImagePreloader } from '../hooks/useQuestionImagePreloader';
import { supabase } from '@/integrations/supabase/client';
import ProgressCharacter from './parents/ProgressCharacter';
import IntroductionScreen from './parents/IntroductionScreen';
import QuestionView from './parents/QuestionView';
import MiniCelebration from './parents/MiniCelebration';
import LessonSelection from './parents/LessonSelection';
import ShowAllQuestionTypesAndLessons from './ShowAllQuestionTypesAndLessons';
import { initializeQuestionTypesCache } from '@/utils/questionTypes';
import type { QuestionType } from '@/utils/questionTypes';

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
  userId: string; // User ID to use for lesson activities and data loading
}

const AILearningAdventure_v2: React.FC<AILearningAdventure_v2Props> = ({ therapistName, overrideUseAiTherapist, userId }) => {
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

  
  const [adminSettings, setAdminSettings] = useState<{ skip_introduction: boolean; show_mic_input: boolean; amplify_mic: boolean; mic_gain: number } | null>(null);
  const [adminSettingsLoading, setAdminSettingsLoading] = useState(true);

  const [showRewardVideo, setShowRewardVideo] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasPlayedChime, setHasPlayedChime] = useState(false);

  const [localAmplifyMic, setLocalAmplifyMic] = useState(false);
  const [localMicGain, setLocalMicGain] = useState(1.0);
  const [userFirstName, setUserFirstName] = useState<string>('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [correctQuestionIndices, setCorrectQuestionIndices] = useState<Set<number>>(new Set());

  // Store filtered questions in a ref so they're available immediately when Skip is clicked
  const filteredQuestionsRef = useRef<Question_v2[]>([]);
  
  // Get current question index for preloading
  const currentQuestionIndex = currentQuestion 
    ? availableQuestions.findIndex(q => q.id === currentQuestion.id)
    : -1;
  
  // Preload images for upcoming questions
  const { preloadAllLessonImages } = useQuestionImagePreloader(
    availableQuestions,
    currentQuestionIndex,
    3 // Preload next 3 questions
  );

  // Fetch user's first name based on userId
  useEffect(() => {
    const fetchUserName = async () => {
      if (!userId) {
        setUserFirstName('');
        return;
      }

      try {
        const { data: userData, error: userError } = await (supabase.rpc as any)('get_user_details', { _user_id: userId }) as { data: Array<{ user_id: string; email: string; name: string }> | null; error: any };

        if (userError || !userData || !Array.isArray(userData) || userData.length === 0) {
          console.error('Error fetching user details:', userError);
          setUserFirstName('');
          return;
        }

        const userInfo = userData[0];
        const fullName = userInfo.name || '';
        // Extract first name (split by space and take first part)
        const firstName = fullName.split(' ')[0] || fullName || userInfo.email?.split('@')[0] || '';
        setUserFirstName(firstName);
      } catch (error) {
        console.error('Error in fetchUserName:', error);
        setUserFirstName('');
      }
    };

    fetchUserName();
  }, [userId]);

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

  // Initialize question types cache when component mounts
  useEffect(() => {
    initializeQuestionTypesCache();
  }, []);

  const childName = profile?.name || profile?.username || 'friend';


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
    if (currentScreen === 'introduction' && selectedLessonId && userId) {
      recordLessonActivity('started', selectedLessonId);
    }
  }, [currentScreen, selectedLessonId, userId]);

  // Load parent's available lessons (combining default lessons with user's custom lessons)
  useEffect(() => {
    const loadParentLessons = async () => {
      if (!userId) return;
      
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
          .eq('user_id', userId)
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
  }, [userId]);

  // Load questions (needed for filtering when lessons are selected)
  useEffect(() => {
    const loadQuestions = async () => {
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
      } catch (error) {
        console.error('Error loading questions from Supabase:', error);
      }
    };

    loadQuestions();
  }, [parentLessons]);


  useEffect(() => {
    if (currentScreen === 'complete' && !showRewardVideo) {
      // When progress buddy is shown, check if all questions were answered and update status to 'complete'
      const allQuestionsAnswered = askedQuestionIds.size >= availableQuestions.length;
      if (allQuestionsAnswered && selectedLessonId && userId) {
        recordLessonActivity('complete', selectedLessonId);
      }
      
      const timer = setTimeout(() => {
        setShowRewardVideo(true);
        setShowConfetti(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, showRewardVideo, askedQuestionIds.size, availableQuestions.length, selectedLessonId, userId]);

  useEffect(() => {
    if (showRewardVideo && !hasPlayedChime) {
      const confettiSound = "https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa1c82.mp3";
      const audio = new Audio(confettiSound);
      audio.play();
      setHasPlayedChime(true);
    }
  }, [showRewardVideo, hasPlayedChime]);


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
    
    // Create new activity session when lesson is selected
    if (lessonId && userId) {
      console.log('handleDirectLessonSelect: Creating activity session for lesson:', lessonId);
      await createActivitySession(lessonId);
      // Also record lesson activity as 'started' when lesson is selected
      await recordLessonActivity('started', lessonId);
    } else {
      console.log('handleDirectLessonSelect: Skipping - lessonId:', lessonId, 'userId:', userId);
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
    
    // Store in ref for immediate access when Skip is clicked
    filteredQuestionsRef.current = filteredQuestions;
    setAvailableQuestions(filteredQuestions);
    
    // Preload all images for the lesson
    if (filteredQuestions.length > 0) {
      preloadAllLessonImages(filteredQuestions);
    }
    
    console.log('[handleDirectLessonSelect] Stored questions in ref and state', {
      refLength: filteredQuestionsRef.current.length,
      filteredLength: filteredQuestions.length,
      lessonId,
      questionType
    });
    // Skip introduction if admin setting is enabled OR if user has disabled AI therapist
    console.log('[handleDirectLessonSelect] effectiveUseAiTherapist:', effectiveUseAiTherapist, 'adminSettings.skip_introduction:', adminSettings?.skip_introduction);
    if ((adminSettings && adminSettings.skip_introduction) || effectiveUseAiTherapist === false) {
      console.log('[handleDirectLessonSelect] Skipping introduction, going directly to questions');
      // Pass filteredQuestions directly to avoid race condition with state update
      handleStartQuestions(filteredQuestions);
    } else {
      console.log('[handleDirectLessonSelect] Showing introduction screen with', filteredQuestions.length, 'questions');
      setCurrentScreen('introduction');
    }
  };

  const handleLessonSelect = async (lessonId: string | null) => {
    setSelectedLessonId(lessonId);
    
    // Create new activity session when lesson is selected
    if (lessonId && userId) {
      console.log('handleLessonSelect: Creating activity session for lesson:', lessonId);
      await createActivitySession(lessonId);
      // Also record lesson activity as 'started' when lesson is selected
      await recordLessonActivity('started', lessonId);
    } else {
      console.log('handleLessonSelect: Skipping - lessonId:', lessonId, 'userId:', userId);
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
    
    // Store in ref for immediate access when Skip is clicked
    filteredQuestionsRef.current = filteredQuestions;
    setAvailableQuestions(filteredQuestions);
    
    // Preload all images for the lesson
    if (filteredQuestions.length > 0) {
      preloadAllLessonImages(filteredQuestions);
    }
    
    console.log('[handleLessonSelect] Stored questions in ref and state', {
      refLength: filteredQuestionsRef.current.length,
      filteredLength: filteredQuestions.length,
      lessonId,
      questionType: selectedQuestionType
    });
    // Skip introduction if admin setting is enabled OR if user has disabled AI therapist
    console.log('[handleLessonSelect] effectiveUseAiTherapist:', effectiveUseAiTherapist, 'adminSettings.skip_introduction:', adminSettings?.skip_introduction);
    if ((adminSettings && adminSettings.skip_introduction) || effectiveUseAiTherapist === false) {
      console.log('[handleLessonSelect] Skipping introduction, going directly to questions');
      // Pass filteredQuestions directly to avoid race condition with state update
      handleStartQuestions(filteredQuestions);
    } else {
      // Ensure questions are available before showing introduction screen
      if (filteredQuestions.length > 0) {
        console.log('[handleLessonSelect] Showing introduction screen with', filteredQuestions.length, 'questions');
        setCurrentScreen('introduction');
      } else {
        console.error('No questions available for lesson:', lessonId, {
          selectedQuestionType,
          totalQuestions: questions.length,
          parentLessons: parentLessons.length
        });
      }
    }
  };

  // Helper function to create a new activity session
  const createActivitySession = async (lessonId: string) => {
    if (!userId || !lessonId) {
      console.log('Skipping activity session creation - userId:', userId, 'lessonId:', lessonId);
      return null;
    }

    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        console.error('Error getting authenticated user:', authError);
        return null;
      }

      const { data, error } = await supabase
        .from('activity_sessions' as any)
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          start_time: new Date().toISOString(),
          status: 'started',
          num_questions_attempted: 0,
          num_questions_correct: 0,
          correct_question_index: '',
        })
        .select('session_id')
        .single();

      if (error) {
        console.error('Error creating activity session:', error);
        return null;
      }

      const sessionId = (data as any)?.session_id;
      if (sessionId) {
        setCurrentSessionId(sessionId);
        setCorrectQuestionIndices(new Set());
        console.log('Created activity session:', sessionId);
        return sessionId;
      }
      return null;
    } catch (error) {
      console.error('Exception creating activity session:', error);
      return null;
    }
  };

  // Helper function to update activity session when a question is answered
  const updateActivitySession = async (questionIndex: number, isCorrect: boolean) => {
    if (!currentSessionId) {
      console.log('No active session to update');
      return;
    }

    try {
      // Update correct question indices
      let updatedIndices = new Set(correctQuestionIndices);
      if (isCorrect) {
        updatedIndices.add(questionIndex);
      }
      setCorrectQuestionIndices(updatedIndices);

      // Get current session data
      const { data: sessionData, error: fetchError } = await supabase
        .from('activity_sessions' as any)
        .select('num_questions_attempted, num_questions_correct')
        .eq('session_id', currentSessionId)
        .single();

      if (fetchError) {
        console.error('Error fetching session data:', fetchError);
        return;
      }

      const currentAttempted = (sessionData as any)?.num_questions_attempted || 0;
      const currentCorrect = (sessionData as any)?.num_questions_correct || 0;

      const newAttempted = currentAttempted + 1;
      const newCorrect = isCorrect ? currentCorrect + 1 : currentCorrect;

      // Convert Set to comma-separated string
      const correctIndicesString = Array.from(updatedIndices).sort((a, b) => a - b).join(',');

      const { error: updateError } = await supabase
        .from('activity_sessions' as any)
        .update({
          num_questions_attempted: newAttempted,
          num_questions_correct: newCorrect,
          correct_question_index: correctIndicesString,
        })
        .eq('session_id', currentSessionId);

      if (updateError) {
        console.error('Error updating activity session:', updateError);
      } else {
        console.log('Updated activity session:', {
          sessionId: currentSessionId,
          attempted: newAttempted,
          correct: newCorrect,
          correctIndices: correctIndicesString,
        });
      }
    } catch (error) {
      console.error('Exception updating activity session:', error);
    }
  };

  // Helper function to complete activity session
  const completeActivitySession = async () => {
    if (!currentSessionId) {
      console.log('No active session to complete');
      return;
    }

    try {
      const correctIndicesString = Array.from(correctQuestionIndices).sort((a, b) => a - b).join(',');

      const { error } = await supabase
        .from('activity_sessions' as any)
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
          correct_question_index: correctIndicesString,
        })
        .eq('session_id', currentSessionId);

      if (error) {
        console.error('Error completing activity session:', error);
      } else {
        console.log('Completed activity session:', currentSessionId);
        setCurrentSessionId(null);
        setCorrectQuestionIndices(new Set());
      }
    } catch (error) {
      console.error('Exception completing activity session:', error);
    }
  };

  // Helper function to record lesson activity with status
  const recordLessonActivity = async (status: 'started' | 'complete', lessonIdOverride?: string | null) => {
    const lessonIdToUse = lessonIdOverride !== undefined ? lessonIdOverride : selectedLessonId;
    if (!lessonIdToUse || !userId) {
      console.log('Skipping lesson activity record - lessonId:', lessonIdToUse, 'userId:', userId);
      return;
    }
    
    try {
      // Verify the current authenticated user has permission to record for this userId
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        console.error('Error getting authenticated user:', authError);
        return;
      }
      
      // Allow if authUser.id matches userId (parent recording for themselves)
      // or if authUser is a therapist (they can record for linked parents)
      const isRecordingForSelf = authUser.id === userId;
      if (!isRecordingForSelf) {
        // For therapists recording for parents, we rely on RLS policies to enforce permissions
        // The userId prop should already be validated by the caller
      }
      
      const upsertData: any = {
        user_id: userId, // Use the provided userId
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
        .eq('user_id', userId)
        .eq('lesson_id', lessonIdToUse)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking for existing lesson activity:', checkError);
      }
      
      let data, activityError;
      const existingRecord = existingData as any;
      
      if (existingRecord) {
        // Update existing record
        console.log('Updating existing lesson activity record:', existingRecord.id);
        const updateResult = await supabase
          .from('lesson_activity' as any)
          .update(upsertData)
          .eq('id', existingRecord.id)
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
        console.error('User ID:', userId);
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
    if (selectedLessonId && userId) {
      console.log('handleStartQuestions: Recording lesson activity for lesson:', selectedLessonId);
      await recordLessonActivity('started', selectedLessonId);
    } else {
      console.log('handleStartQuestions: Skipping - selectedLessonId:', selectedLessonId, 'userId:', userId);
    }
    
    // Use provided questions, then fall back to ref (for Skip button), then state
    // Ensure questionsToStart is always an array (never undefined)
    let questionsToStart: Question_v2[] = [];
    
    console.log('handleStartQuestions: Checking question sources', {
      questionsToUseLength: questionsToUse?.length || 0,
      refLength: filteredQuestionsRef.current?.length || 0,
      availableQuestionsLength: availableQuestions?.length || 0,
      selectedLessonId,
      selectedQuestionType,
      totalQuestions: questions?.length || 0
    });
    
    if (questionsToUse && Array.isArray(questionsToUse) && questionsToUse.length > 0) {
      questionsToStart = questionsToUse;
      console.log('handleStartQuestions: Using provided questions:', questionsToStart.length);
    } else if (filteredQuestionsRef.current && Array.isArray(filteredQuestionsRef.current) && filteredQuestionsRef.current.length > 0) {
      // Use ref when Skip is clicked (before state is updated)
      questionsToStart = filteredQuestionsRef.current;
      console.log('handleStartQuestions: Using questions from ref:', questionsToStart.length);
    } else if (availableQuestions && Array.isArray(availableQuestions) && availableQuestions.length > 0) {
      questionsToStart = availableQuestions;
      console.log('handleStartQuestions: Using questions from state:', questionsToStart.length);
    }
    
    // If no questions provided and availableQuestions is empty, try to filter questions again
    if (questionsToStart.length === 0) {
      console.warn('handleStartQuestions: No questions from any source, attempting to filter questions again', {
        questionsToUse: questionsToUse?.length || 0,
        refLength: filteredQuestionsRef.current?.length || 0,
        availableQuestions: availableQuestions?.length || 0,
        selectedLessonId,
        selectedQuestionType,
        totalQuestions: questions?.length || 0,
        parentLessons: parentLessons?.length || 0,
        hasQuestions: !!questions,
        isQuestionsArray: Array.isArray(questions)
      });
      
      // Try to filter questions again based on current state
      if (selectedQuestionType && questions && Array.isArray(questions) && questions.length > 0) {
        let filteredQuestions: Question_v2[] = [];
        
        console.log('handleStartQuestions: Filtering questions with criteria', {
          selectedLessonId,
          selectedQuestionType,
          totalQuestions: questions.length,
          parentLessonsLength: parentLessons.length,
          parentLessons: parentLessons
        });
        
        if (selectedLessonId) {
          filteredQuestions = questions.filter(q => {
            const matches = q && 
              q.question_type === selectedQuestionType && 
              q.lesson_id === selectedLessonId &&
              (parentLessons.length === 0 || parentLessons.includes(selectedLessonId));
            if (!matches && q) {
              console.log('handleStartQuestions: Question filtered out', {
                questionId: q.id,
                questionType: q.question_type,
                lessonId: q.lesson_id,
                matchesType: q.question_type === selectedQuestionType,
                matchesLesson: q.lesson_id === selectedLessonId,
                parentLessonsCheck: parentLessons.length === 0 || parentLessons.includes(selectedLessonId)
              });
            }
            return matches;
          });
        } else {
          filteredQuestions = questions.filter(q => {
            const matches = q &&
              q.question_type === selectedQuestionType &&
              (parentLessons.length === 0 || !q.lesson_id || parentLessons.includes(q.lesson_id));
            return matches;
          });
        }
        
        // Sort by question_index
        filteredQuestions = [...filteredQuestions].sort((a, b) => 
          (a.question_index || 0) - (b.question_index || 0)
        );
        
        console.log('handleStartQuestions: Filtered questions result', {
          filteredCount: filteredQuestions.length,
          selectedLessonId,
          selectedQuestionType,
          totalQuestionsBeforeFilter: questions.length,
          sampleQuestion: filteredQuestions[0] ? {
            id: filteredQuestions[0].id,
            question_type: filteredQuestions[0].question_type,
            lesson_id: filteredQuestions[0].lesson_id
          } : null
        });
        
        if (filteredQuestions.length > 0) {
          questionsToStart = filteredQuestions;
          // Update both ref and state
          filteredQuestionsRef.current = filteredQuestions;
          setAvailableQuestions(filteredQuestions);
          console.log('handleStartQuestions: Successfully filtered and stored questions:', filteredQuestions.length);
        } else {
          console.error('handleStartQuestions: Filtering returned 0 questions', {
            selectedLessonId,
            selectedQuestionType,
            totalQuestions: questions.length,
            sampleQuestions: questions.slice(0, 3).map(q => ({
              id: q.id,
              question_type: q.question_type,
              lesson_id: q.lesson_id
            }))
          });
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
    
    // If still no questions available, log error and try one more time with detailed debugging
    if (questionsToStart.length === 0) {
      console.error('handleStartQuestions: No questions available to start after retry', {
        questionsToUse: questionsToUse?.length || 0,
        refLength: filteredQuestionsRef.current?.length || 0,
        availableQuestions: availableQuestions?.length || 0,
        selectedLessonId,
        selectedQuestionType,
        totalQuestions: questions?.length || 0,
        parentLessonsLength: parentLessons?.length || 0,
        parentLessons: parentLessons,
        questionsToStartLength: questionsToStart.length,
        isArray: Array.isArray(questionsToStart),
        sampleQuestions: questions?.slice(0, 5).map(q => ({
          id: q.id,
          question_type: q.question_type,
          lesson_id: q.lesson_id
        }))
      });
      
      // Last resort: try to filter one more time with relaxed criteria (ignore parentLessons check if it's blocking)
      if (selectedQuestionType && questions && Array.isArray(questions) && questions.length > 0 && selectedLessonId) {
        console.log('handleStartQuestions: Last resort - filtering with relaxed criteria');
        const relaxedFiltered = questions.filter(q => 
          q && 
          q.question_type === selectedQuestionType && 
          q.lesson_id === selectedLessonId
        );
        
        if (relaxedFiltered.length > 0) {
          console.log('handleStartQuestions: Found questions with relaxed filter:', relaxedFiltered.length);
          questionsToStart = [...relaxedFiltered].sort((a, b) => 
            (a.question_index || 0) - (b.question_index || 0)
          );
          filteredQuestionsRef.current = questionsToStart;
          setAvailableQuestions(questionsToStart);
        } else {
          console.error('handleStartQuestions: Even relaxed filter returned 0 questions');
          return;
        }
      } else {
        return;
      }
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

  const handleCorrectAnswer = async () => {
    setCorrectAnswers(prev => prev + 1);
    setRetryCount(0);
    
    // Update activity session with correct answer
    if (currentQuestion && currentQuestion.question_index !== null) {
      await updateActivitySession(currentQuestion.question_index, true);
    }
    
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
    // Update activity session with attempted question (if not already correct)
    if (currentQuestion && currentQuestion.question_index !== null && shouldIncrement) {
      const isCorrect = correctQuestionIndices.has(currentQuestion.question_index);
      if (!isCorrect) {
        await updateActivitySession(currentQuestion.question_index, false);
      }
    }

    if (sessionQuestionCount >= maxQuestionsPerSession) {
      // Check if all questions in the lesson were answered
      const allQuestionsAnswered = askedQuestionIds.size >= availableQuestions.length;
      if (allQuestionsAnswered && selectedLessonId) {
        await completeActivitySession();
        await recordLessonActivity('complete', selectedLessonId);
      }
      setCurrentScreen('complete');
      return;
    }

    const remainingQuestions = availableQuestions.filter(q => !askedQuestionIds.has(q.id));
    
    if (remainingQuestions.length === 0) {
      // All questions in the lesson have been answered - mark as complete
      if (selectedLessonId) {
        await completeActivitySession();
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
    // Complete activity session if it exists
    if (currentSessionId) {
      await completeActivitySession();
    }

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
    setCurrentSessionId(null);
    setCorrectQuestionIndices(new Set());
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
            <>
              <ShowAllQuestionTypesAndLessons
                userId={userId}
                parentLessons={parentLessons}
                onLessonSelect={handleDirectLessonSelect}
                therapistName={therapistName}
                userFirstName={userFirstName}
              />
              
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
            </>
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
                // Complete current session if it exists
                if (currentSessionId) {
                  await completeActivitySession();
                }
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
                // Find the lesson from current question's lessonObj or from questions array
                const selectedLesson = currentQuestion?.lessonObj || questions.find(q => q.lesson_id === selectedLessonId)?.lessonObj;
                // Check user preference first, then fall back to lesson's video
                const videoId = preferences?.celebrationVideoId || (selectedLesson as any)?.youtube_video_id;
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


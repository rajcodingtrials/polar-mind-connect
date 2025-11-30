import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useTTSSettings } from '@/hooks/useTTSSettings';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateSimilarity } from '@/components/chat/fuzzyMatching';
import { stopAllAudio, playGlobalTTS, stopGlobalAudio } from '@/utils/audioUtils';
import { getCelebrationMessage, calculateProgressLevel } from '@/utils/celebrationMessages';
import SoundFeedbackDisplay from './SoundFeedbackDisplay';
import { soundFeedbackManager } from '@/utils/soundFeedback';
import AnimatedMicButton from './AnimatedMicButton';
import { Clock, CheckCircle2, XCircle, BookOpen } from 'lucide-react';

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
  question_type: string;
  question_index: number | null;
  lesson: string | null;
}

interface QuestionViewProps {
  question: Question_v2;
  questionNumber: number;
  totalQuestions: number;
  therapistName: string;
  childName: string;
  onCorrectAnswer: () => void;
  onNextQuestion: (shouldIncrement?: boolean) => void;
  onComplete: () => void;
  onPickNewLesson?: () => void;
  retryCount: number;
  onRetryCountChange: (count: number) => void;
  onAmplifyMicChange?: (enabled: boolean) => void;
  onMicGainChange?: (gain: number) => void;
  comingFromCelebration?: boolean;
  showMicInput?: boolean;
  amplifyMic?: boolean;
  micGain?: number;
}

const QuestionView: React.FC<QuestionViewProps> = ({
  question,
  questionNumber,
  totalQuestions,
  therapistName,
  childName,
  onCorrectAnswer,
  onNextQuestion,
  onComplete,
  onPickNewLesson,
  retryCount,
  onRetryCountChange,
  onAmplifyMicChange,
  onMicGainChange,
  comingFromCelebration = false,
  showMicInput = false,
  amplifyMic,
  micGain
}) => {
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(true);
  const [currentResponse, setCurrentResponse] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [hasCalledCorrectAnswer, setHasCalledCorrectAnswer] = useState(false);
  const [shouldReadQuestion, setShouldReadQuestion] = useState(true);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasUserAttemptedAnswer, setHasUserAttemptedAnswer] = useState(false);
  const [hasReadQuestion, setHasReadQuestion] = useState(false);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [choiceImageUrls, setChoiceImageUrls] = useState<string[]>([]);
  const [questionImageUrl, setQuestionImageUrl] = useState<string | null>(null);
  const [questionVideoBeforeUrl, setQuestionVideoBeforeUrl] = useState<string | null>(null);
  const [questionVideoAfterUrl, setQuestionVideoAfterUrl] = useState<string | null>(null);
  const [questionImageAfterUrl, setQuestionImageAfterUrl] = useState<string | null>(null);
  const [showVideoAfter, setShowVideoAfter] = useState(false);
  const [showImageAfter, setShowImageAfter] = useState(false);
  const [lastMicInput, setLastMicInput] = useState('');
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [waitingForVideoToComplete, setWaitingForVideoToComplete] = useState(false);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isProcessingAfterAnswer, setIsProcessingAfterAnswer] = useState(false);
  
  const questionReadInProgress = useRef(false);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const previousQuestionIdRef = useRef<string | null>(null);
  const { toast } = useToast();
  
  const { ttsSettings, isLoaded: ttsSettingsLoaded, getVoiceForTherapist, callTTS } = useTTSSettings(therapistName);
  const { preferences, updateSpeechDelayMode } = useUserPreferences();
  
  const { isRecording, isProcessing, setIsProcessing, startRecording, stopRecording, audioLevel, lastAudioBlob } = useAudioRecorder(amplifyMic ?? false, micGain ?? 1.0);

  // Parse choices_image (comma-separated URLs)
  useEffect(() => {
    if (question.choices_image) {
      const urls = question.choices_image.split(',').map(url => url.trim()).filter(url => url);
      setChoiceImageUrls(urls);
    } else {
      setChoiceImageUrls([]);
    }
  }, [question.choices_image]);

  // Load question_image URL
  useEffect(() => {
    // Reset first to ensure clean state
    setQuestionImageUrl(null);
    
    // Small delay to ensure reset has taken effect, then load new image
    const timer = setTimeout(() => {
      if (question.question_image) {
        // If it's already a full URL, use it directly
        if (question.question_image.startsWith('http')) {
          setQuestionImageUrl(question.question_image);
        } else {
          // Otherwise, try to get from storage
          const { data } = supabase.storage
            .from('question-images-v2')
            .getPublicUrl(question.question_image);
          setQuestionImageUrl(data?.publicUrl || null);
        }
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [question.question_image, question.id]);

  // Load question_video URL
  useEffect(() => {
    // Reset first to prevent showing old video
    setQuestionVideoBeforeUrl(null);
    
    if (question.question_video && question.question_video.trim() !== '') {
      // If it's already a full URL, use it directly
      if (question.question_video.startsWith('http')) {
        setQuestionVideoBeforeUrl(question.question_video);
      } else {
        // Otherwise, try to get from storage
        const { data } = supabase.storage
          .from('question-images-v2')
          .getPublicUrl(question.question_video);
        setQuestionVideoBeforeUrl(data?.publicUrl || null);
      }
    }
  }, [question.question_video, question.id]);

  // Load video_after_answer URL
  useEffect(() => {
    // Reset first to prevent showing old video
    setQuestionVideoAfterUrl(null);
    
    if (question.video_after_answer && question.video_after_answer.trim() !== '') {
      console.log('Loading video_after_answer:', question.video_after_answer);
      // If it's already a full URL, use it directly
      if (question.video_after_answer.startsWith('http')) {
        console.log('Using full URL for video_after_answer:', question.video_after_answer);
        setQuestionVideoAfterUrl(question.video_after_answer);
      } else {
        // Otherwise, try to get from storage
        const { data } = supabase.storage
          .from('question-images-v2')
          .getPublicUrl(question.video_after_answer);
        const publicUrl = data?.publicUrl || null;
        console.log('Generated public URL for video_after_answer:', publicUrl);
        setQuestionVideoAfterUrl(publicUrl);
      }
    } else {
      console.log('No video_after_answer found for question:', question.id);
    }
  }, [question.video_after_answer, question.id]);

  // Load image_after_answer URL
  useEffect(() => {
    // Reset first to prevent showing old image
    setQuestionImageAfterUrl(null);
    
    if (question.image_after_answer && question.image_after_answer.trim() !== '') {
      console.log('Loading image_after_answer:', question.image_after_answer);
      // If it's already a full URL, use it directly
      if (question.image_after_answer.startsWith('http')) {
        console.log('Using full URL for image_after_answer:', question.image_after_answer);
        setQuestionImageAfterUrl(question.image_after_answer);
      } else {
        // Otherwise, try to get from storage
        const { data } = supabase.storage
          .from('question-images-v2')
          .getPublicUrl(question.image_after_answer);
        const publicUrl = data?.publicUrl || null;
        console.log('Generated public URL for image_after_answer:', publicUrl);
        setQuestionImageAfterUrl(publicUrl);
      }
    } else {
      console.log('No image_after_answer found for question:', question.id);
    }
  }, [question.image_after_answer, question.id]);

  // Reset state when question changes
  useEffect(() => {
    // Only reset if question ID actually changed
    if (previousQuestionIdRef.current !== question.id) {
      previousQuestionIdRef.current = question.id;
      
      setHasCalledCorrectAnswer(false);
      setIsProcessingAnswer(false);
      setShowFeedback(false);
      setCurrentResponse('');
      setIsWaitingForAnswer(true);
      setShouldReadQuestion(!comingFromCelebration);
      setIsUserInteracting(false);
      setHasReadQuestion(false);
      questionReadInProgress.current = false;
      setIsCorrect(null);
      setSelectedChoiceIndex(null);
      setLastMicInput('');
      setShowVideoAfter(false);
      setShowImageAfter(false);
      setWaitingForVideoToComplete(false);
      setVideoAspectRatio(null);
      setIsProcessingAfterAnswer(false);
      // Reset image/video URLs immediately when question changes to prevent showing old media
      setQuestionImageUrl(null);
      setQuestionVideoBeforeUrl(null);
      setQuestionVideoAfterUrl(null);
      setQuestionImageAfterUrl(null);
      
      if (!comingFromCelebration) {
        onRetryCountChange(0);
      }
    }
  }, [question.id, comingFromCelebration, onRetryCountChange]);

  // Playback handler
  const handlePlayback = () => {
    if (lastAudioBlob) {
      const url = URL.createObjectURL(lastAudioBlob);
      if (audioPlaybackRef.current) {
        audioPlaybackRef.current.src = url;
        audioPlaybackRef.current.play();
        setIsPlayingBack(true);
        audioPlaybackRef.current.onended = () => {
          setIsPlayingBack(false);
          URL.revokeObjectURL(url);
        };
      }
    }
  };

  // Auto-scroll
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [question.id]);

  // Read question aloud when component mounts or question changes
  useEffect(() => {
    // Only call TTS if question_speech is available
    if (shouldReadQuestion && !hasReadQuestion && ttsSettingsLoaded && !questionReadInProgress.current && question.question_speech) {
      questionReadInProgress.current = true;
      setHasReadQuestion(true);
      
      const readQuestion = async () => {
        try {
          stopGlobalAudio();
          const questionText = question.question_speech;
          const { data, error } = await callTTS(questionText, ttsSettings.voice, ttsSettings.speed);
          
          if (data?.audioContent && !error) {
            setIsPlaying(true);
            await playGlobalTTS(data.audioContent, 'Question-Read');
            setIsPlaying(false);
            
            // If both answer and answer_index are not present, move to next question after TTS completes
            const hasAnswer = question.answer && question.answer.trim() !== '';
            const hasAnswerIndex = question.answer_index !== null;
            
            if (!hasAnswer && !hasAnswerIndex) {
              // Wait a bit then move to next question without incrementing the count
              setTimeout(() => {
                if (questionNumber >= totalQuestions) {
                  onComplete();
                } else {
                  onNextQuestion(false); // Don't increment count for questions without answer/answer_index
                }
              }, 500);
            }
          }
        } catch (error) {
          console.error('Error reading question:', error);
        } finally {
          questionReadInProgress.current = false;
        }
      };
      
      readQuestion();
    }
  }, [shouldReadQuestion, hasReadQuestion, ttsSettingsLoaded, question.question_speech, question.id, question.answer, question.answer_index, questionNumber, totalQuestions, onNextQuestion, onComplete]);

  const handleVoiceRecording = async () => {
    if (isProcessingAnswer || !question.answer) return;
    
    if (isRecording) {
      setIsProcessing(true);
      setIsUserInteracting(true);
      try {
        const base64Audio = await stopRecording();
        const { data, error } = await supabase.functions.invoke('openai-stt', {
          body: { audio: base64Audio }
        });
        
        if (error) {
          console.error('Speech-to-text error:', error);
          toast({
            title: "Voice Recognition Error",
            description: "Failed to process your voice. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        if (data?.text && data.text.trim()) {
          setLastMicInput(data.text.trim());
          await processAnswer(data.text.trim());
        } else {
          toast({
            title: "No Speech Detected",
            description: "Please try speaking again.",
          });
        }
      } catch (error) {
        console.error('Error processing voice recording:', error);
        toast({
          title: "Recording Error",
          description: "Failed to process voice recording. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      startRecording();
    }
  };

  const processAnswer = async (userAnswerText: string) => {
    if (!userAnswerText || !userAnswerText.trim() || !question.answer) {
      return;
    }
    
    if (isProcessingAnswer) return;
    setIsProcessingAnswer(true);
    setHasUserAttemptedAnswer(true);
    setUserAnswer(userAnswerText);
    
    stopGlobalAudio();
    
    const similarity = calculateSimilarity(userAnswerText, question.answer, {
      speechDelayMode: preferences.speechDelayMode,
      threshold: preferences.speechDelayMode ? 0.3 : 0.6
    });

    const acceptanceThreshold = preferences.speechDelayMode ? 0.3 : 0.7;
    
    if (similarity > acceptanceThreshold) {
      setIsCorrect(true);
      await handleCorrectAnswer(userAnswerText);
    } else {
      setIsCorrect(false);
      await handleIncorrectAnswer(userAnswerText);
    }
    
    setTimeout(() => {
      setIsProcessingAnswer(false);
      setIsUserInteracting(false);
    }, 500);
  };

  // Helper function to handle the after-answer sequence: image -> speech -> video
  const handleAfterAnswerSequence = async (onComplete: () => void, onNextQuestion: () => void) => {
    // Check if image_after_answer exists in the question
    const hasImageAfterField = question.image_after_answer && question.image_after_answer.trim() !== '';
    const hasSpeechAfter = question.speech_after_answer && question.speech_after_answer.trim() !== '';
    const hasVideoAfter = question.video_after_answer && question.video_after_answer.trim() !== '' && questionVideoAfterUrl;

    setIsProcessingAfterAnswer(true);

    // Step 1: Show image_after_answer first if it exists
    // Load the image URL if needed, then show it
    if (hasImageAfterField) {
      let imageUrl = questionImageAfterUrl;
      
      // If URL not loaded yet, load it now
      if (!imageUrl) {
        console.log('Step 1: Loading image_after_answer URL:', question.image_after_answer);
        if (question.image_after_answer.startsWith('http')) {
          imageUrl = question.image_after_answer;
          setQuestionImageAfterUrl(imageUrl);
        } else {
          const { data } = supabase.storage
            .from('question-images-v2')
            .getPublicUrl(question.image_after_answer);
          imageUrl = data?.publicUrl || null;
          if (imageUrl) {
            setQuestionImageAfterUrl(imageUrl);
          }
        }
      }
      
      if (imageUrl) {
        console.log('Step 1: Showing image_after_answer:', imageUrl);
        setShowImageAfter(true);
        // Wait a bit for the image to actually render before proceeding
        await new Promise(resolve => setTimeout(resolve, 300));
      } else {
        console.warn('Step 1: Failed to load image_after_answer URL');
      }
    }

    // Step 2: Play speech_after_answer TTS if it exists (while image is showing)
    if (hasSpeechAfter) {
      console.log('Step 2: Playing speech_after_answer:', question.speech_after_answer);
      try {
        const { data } = await callTTS(question.speech_after_answer, ttsSettings.voice, ttsSettings.speed);
        if (data?.audioContent) {
          await playGlobalTTS(data.audioContent, 'SpeechAfterAnswer');
        }
      } catch (e) {
        console.error('TTS error for speech_after_answer:', e);
      }
    }

    // Step 3: After TTS completes, show video_after_answer if it exists, otherwise handle image display
    if (hasVideoAfter) {
      console.log('Step 3: Showing video_after_answer:', questionVideoAfterUrl);
      // Hide image if it was showing, since video takes precedence
      if (hasImageAfterField && showImageAfter) {
        setShowImageAfter(false);
      }
      setWaitingForVideoToComplete(true);
      setTimeout(() => {
        setShowVideoAfter(true);
      }, 300);
      // Video completion will be handled by the video onEnded handler
    } else if (hasImageAfterField && showImageAfter) {
      // If image exists but no video, image stays visible with Next Question button
      // The button is already shown when showImageAfter is true
      // Image will stay visible until user clicks Next Question or timeout (10s)
      console.log('Step 3: Image will be shown for 10s (no video)');
      // Set timeout to auto-proceed after 10s if user doesn't click
      setTimeout(() => {
        if (showImageAfter && !waitingForVideoToComplete) {
          setShowImageAfter(false);
          setIsProcessingAfterAnswer(false);
          // Move to next question after 10 seconds
          onNextQuestion();
        }
      }, 10000);
    } else {
      // No image or video, proceed immediately
      setIsProcessingAfterAnswer(false);
      onComplete();
    }
  };

  const handleCorrectAnswer = async (userAnswerText: string) => {
    let feedbackForScreen = '';
    let hasPlayedTTS = false;
    
    if (userAnswerText && question.answer) {
      await soundFeedbackManager.initialize();
      const { targetSound, confidence } = soundFeedbackManager.detectTargetSound(userAnswerText);
      
      if (targetSound && confidence > 0.6) {
        const similarityScore = userAnswerText ? calculateSimilarity(userAnswerText, question.answer, {
          speechDelayMode: preferences.speechDelayMode,
          threshold: preferences.speechDelayMode ? 0.3 : 0.6
        }) : 1.0;
        const feedbackType = similarityScore >= 0.95 ? 'correct' : (preferences.speechDelayMode ? 'correct_speech_delay' : 'correct');
        const feedback = await soundFeedbackManager.generateSoundFeedback({
          target_sound: question.answer,
          user_attempt: userAnswerText,
          therapistName,
          childName,
          question: question.question_text,
          correct_answer: question.answer
        }, feedbackType);
        
        if (feedback) {
          feedbackForScreen = feedback;
          setCurrentResponse(feedbackForScreen);
          setShowFeedback(true);
          
          try {
            const { data } = await callTTS(feedback, ttsSettings.voice, ttsSettings.speed);
            if (data?.audioContent) {
              await playGlobalTTS(data.audioContent, 'SoundFeedback-Correct');
              hasPlayedTTS = true;
            }
          } catch (e) {
            console.error('TTS error:', e);
          }
        }
      }
    }
    
    const progressLevel = calculateProgressLevel(questionNumber);
    const celebrationMessage = await getCelebrationMessage({
      messageType: 'question_feedback',
      therapistName,
      messageCategory: 'correct_answer',
      progressLevel,
      childName
    });
    setCurrentResponse(celebrationMessage);
    setShowFeedback(true);
    
    // If no TTS was played yet, play celebration message TTS
    if (!hasPlayedTTS) {
      try {
        const { data } = await callTTS(celebrationMessage, ttsSettings.voice, ttsSettings.speed);
        if (data?.audioContent) {
          await playGlobalTTS(data.audioContent, 'CelebrationMessage');
        }
      } catch (e) {
        console.error('TTS error:', e);
      }
    }
    
    // Handle after-answer sequence: image -> speech -> video
    if (!hasCalledCorrectAnswer) {
      setHasCalledCorrectAnswer(true);
      await handleAfterAnswerSequence(() => onCorrectAnswer(), () => onNextQuestion());
    }
  };

  const handleIncorrectAnswer = async (userAnswerText: string) => {
    let feedbackForScreen = '';
    
    if (userAnswerText && question.answer) {
      await soundFeedbackManager.initialize();
      const { targetSound, confidence } = soundFeedbackManager.detectTargetSound(question.answer);
      
      if (targetSound && confidence > 0.6) {
        const feedback = await soundFeedbackManager.generateSoundFeedback({
          target_sound: targetSound.sound,
          user_attempt: userAnswerText,
          therapistName,
          childName,
          question: question.question_text,
          correct_answer: question.answer
        }, 'incorrect');
        
        if (feedback) {
          feedbackForScreen = feedback;
          setCurrentResponse(feedbackForScreen);
          setShowFeedback(true);
          
          try {
            const { data } = await callTTS(feedback, ttsSettings.voice, ttsSettings.speed);
            if (data?.audioContent) {
              await playGlobalTTS(data.audioContent, 'SoundFeedback-Incorrect');
            }
          } catch (e) {
            console.error('TTS error:', e);
          }
        }
      }
    }
    
    if (!feedbackForScreen) {
      setCurrentResponse(`That's not quite right. The answer is "${question.answer}". Let's try again!`);
      setShowFeedback(true);
      
      try {
        const { data } = await callTTS(`That's not quite right. The answer is ${question.answer}. Let's try again!`, ttsSettings.voice, ttsSettings.speed);
        if (data?.audioContent) {
          await playGlobalTTS(data.audioContent, 'Incorrect-Answer');
        }
      } catch (e) {
        console.error('TTS error:', e);
      }
    }
    
    const newRetryCount = retryCount + 1;
    onRetryCountChange(newRetryCount);
    
    // After max retries, handle after-answer sequence: image -> speech -> video
    if (newRetryCount >= 2) {
      const proceedToNext = () => {
        setShowFeedback(false);
        setIsWaitingForAnswer(false);
        setIsProcessingAnswer(false);
        setIsUserInteracting(false);
        onNextQuestion();
      };
      await handleAfterAnswerSequence(proceedToNext, proceedToNext);
      return;
    } else {
      // Allow retry - if this is the second attempt (newRetryCount === 1), re-read the question
      setTimeout(() => {
        setShowFeedback(false);
        setIsWaitingForAnswer(true);
        setIsProcessingAnswer(false);
        setIsUserInteracting(false);
        
        // If this is the second attempt, reset flags to trigger re-reading via useEffect
        if (newRetryCount === 1 && question.question_speech) {
          // Reset the flags so the useEffect will trigger to re-read the question
          questionReadInProgress.current = false;
          setHasReadQuestion(false);
          setShouldReadQuestion(true);
        }
      }, 2000);
    }
  };

  const handleChoiceClick = async (index: number) => {
    if (isProcessingAnswer || question.answer_index === null || hasCalledCorrectAnswer) return;
    
    setIsProcessingAnswer(true);
    setSelectedChoiceIndex(index);
    setHasUserAttemptedAnswer(true);
    
    stopGlobalAudio();
    
    const isCorrectChoice = index === question.answer_index;
    setIsCorrect(isCorrectChoice);
    
    // Provide feedback for choice selection
    if (isCorrectChoice) {
      setCurrentResponse('Great job! That\'s correct!');
      setShowFeedback(true);
      setHasCalledCorrectAnswer(true);
      setIsProcessingAnswer(false);
      
      try {
        const { data } = await callTTS('Great job! That\'s correct!', ttsSettings.voice, ttsSettings.speed);
        if (data?.audioContent) {
          await playGlobalTTS(data.audioContent, 'Choice-Correct');
        }
        
        // Handle after-answer sequence: image -> speech -> video
        await handleAfterAnswerSequence(() => onCorrectAnswer(), () => onNextQuestion());
      } catch (e) {
        console.error('TTS error:', e);
        // If TTS fails, still handle after-answer sequence
        await handleAfterAnswerSequence(() => onCorrectAnswer(), () => onNextQuestion());
      }
    } else {
      setCurrentResponse('That\'s not quite right. Try again!');
      setShowFeedback(true);
      
      try {
        const { data } = await callTTS('That\'s not quite right. Try again!', ttsSettings.voice, ttsSettings.speed);
        if (data?.audioContent) {
          await playGlobalTTS(data.audioContent, 'Choice-Incorrect');
        }
      } catch (e) {
        console.error('TTS error:', e);
      }
      
      // Allow retry after feedback
      setTimeout(() => {
        setShowFeedback(false);
        setIsProcessingAnswer(false);
        setSelectedChoiceIndex(null);
        setIsCorrect(null);
      }, 2000);
    }
  };

  const hasAnswerField = question.answer && question.answer.trim() !== '';
  const hasAnswerIndex = question.answer_index !== null;
  const showChoices = choiceImageUrls.length > 0 && hasAnswerIndex;

  return (
    //<div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 p-6">
    <div className="min-h-screen flex flex-col p-6">
      {/* Header with therapist, progress, and speech delay toggle */}
      <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* First Row: Therapist Name and Question Count */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 border-2 border-white shadow-sm">
              <AvatarImage src={`/lovable-uploads/${therapistName}.png`} alt={therapistName} />
              <AvatarFallback className="bg-blue-200 text-blue-800 font-semibold text-sm sm:text-base lg:text-lg">
                {therapistName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-blue-900 text-lg sm:text-xl lg:text-2xl">{therapistName}</h3>
            </div>
          </div>
          
          <div className="text-center sm:text-right">
            <p className="text-lg sm:text-xl font-bold text-purple-800">
              Question {questionNumber} of {totalQuestions}
            </p>
          </div>
        </div>

        {/* Second Row: Control Buttons - Wrap on smaller screens */}
        <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4 lg:gap-6">
          {/* Speech Delay and Mic Boost - only show for questions with answer field */}
          {hasAnswerField && (
            <>
              <button
                onClick={() => updateSpeechDelayMode(!preferences.speechDelayMode)}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 lg:px-5 py-2 rounded-full bg-gradient-to-r from-purple-200 to-blue-200 text-blue-800 font-semibold border border-blue-200 shadow-sm hover:bg-blue-100 transition text-sm sm:text-base whitespace-nowrap`}
                title={preferences.speechDelayMode ? 'Speech Delay: ON' : 'Speech Delay: OFF'}
                aria-label="Toggle Speech Delay Mode"
              >
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden sm:inline">Speech Delay</span>
                <span className="sm:hidden">Delay</span>
                <span className={`ml-1 sm:ml-2 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${preferences.speechDelayMode ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {preferences.speechDelayMode ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Mic Amplification Control */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    const newAmplifyMic = !amplifyMic;
                    if (onAmplifyMicChange) {
                      onAmplifyMicChange(newAmplifyMic);
                    }
                  }}
                  className={`flex items-center justify-center gap-2 px-3 sm:px-4 lg:px-5 py-2 rounded-full bg-gradient-to-r from-purple-200 to-blue-200 text-blue-800 font-semibold border border-blue-200 shadow-sm hover:bg-blue-100 transition text-sm sm:text-base whitespace-nowrap`}
                  title={amplifyMic ? 'Mic Amplification: ON' : 'Mic Amplification: OFF'}
                  aria-label="Toggle Mic Amplification"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span className="hidden sm:inline">Mic Boost</span>
                  <span className="sm:hidden">Mic</span>
                  <span className={`ml-1 sm:ml-2 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${amplifyMic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {amplifyMic ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* Mic Gain Slider - only show when amplification is on */}
                {amplifyMic && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-medium text-blue-700 hidden sm:inline">Gain:</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={micGain || 1}
                      onChange={(e) => {
                        const newGain = parseFloat(e.target.value);
                        if (onMicGainChange) {
                          onMicGainChange(newGain);
                        }
                      }}
                      className="w-16 sm:w-20 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider flex-shrink-0"
                      style={{
                        background: 'linear-gradient(to right, #93c5fd 0%, #93c5fd 50%, #dbeafe 50%, #dbeafe 100%)'
                      }}
                      title={`Mic Gain: ${micGain || 1}x`}
                    />
                    <span className="text-xs font-medium text-blue-700 w-6 sm:w-8 flex-shrink-0">
                      {micGain || 1}x
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Pick a new lesson button - always show if callback is provided */}
          {onPickNewLesson && (
            <button
              onClick={onPickNewLesson}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 lg:px-5 py-2 rounded-full bg-gradient-to-r from-purple-200 to-blue-200 text-blue-800 font-semibold border border-blue-200 shadow-sm hover:bg-blue-100 transition text-sm sm:text-base whitespace-nowrap"
              title="Pick a new lesson"
              aria-label="Pick a new lesson"
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="hidden sm:inline">Pick a new lesson</span>
              <span className="sm:hidden">New Lesson</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Question Area */}
      <div ref={mainContentRef} className="flex-grow flex flex-col items-center justify-center max-w-7xl mx-auto w-full">

        {/* Question Text - Show above image if not empty */}
        {question.question_text && (
          <div className="mb-4 sm:mb-6 lg:mb-8 animate-fade-in px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center leading-relaxed" style={{ color: 'rgb(36, 58, 133)' }}>
              {question.question_text}
            </h2>
          </div>
        )}

        {/* Question Video (before) or Image */}
        {(() => {
          const hasChoices = choiceImageUrls.length > 0;
          // Responsive heights: smaller on mobile, larger on desktop
          // If both question_image and choices_image are present: 50vh on iPad+, otherwise 80vh
          const mediaHeight = hasChoices 
            ? 'h-[250px] sm:h-[300px] md:h-[50vh]' 
            : 'h-[300px] sm:h-[400px] md:h-[500px] lg:h-[80vh]';
          
          // Show video_after if answer is correct and video exists, otherwise show image_after if exists, otherwise show video_before if exists, otherwise show image
          const videoToShow = showVideoAfter && questionVideoAfterUrl 
            ? questionVideoAfterUrl 
            : (questionVideoBeforeUrl || null);
          
          // Show image_after if answer is correct/max attempts and image exists (and no video_after)
          if (showImageAfter && questionImageAfterUrl && !showVideoAfter) {
            return (
              <div className="mb-4 sm:mb-6 lg:mb-8 animate-scale-in flex justify-center px-4">
                <div className="inline-block rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 border-white overflow-hidden w-full max-w-full">
                  <img
                    src={questionImageAfterUrl}
                    alt="Answer feedback image"
                    className={`w-full object-contain rounded-2xl sm:rounded-3xl ${mediaHeight}`}
                    loading="lazy"
                    onError={(e) => {
                      console.error('Error loading image_after_answer:', questionImageAfterUrl);
                      e.currentTarget.style.display = 'none';
                      toast({
                        title: "Image Loading Error",
                        description: "The image could not be loaded. Continuing without it.",
                        variant: "destructive",
                      });
                      // If image fails to load, proceed anyway
                      setShowImageAfter(false);
                      if (hasCalledCorrectAnswer && isCorrect) {
                        onCorrectAnswer();
                      } else {
                        setShowFeedback(false);
                        setIsWaitingForAnswer(false);
                        setIsProcessingAnswer(false);
                        setIsUserInteracting(false);
                        onNextQuestion();
                      }
                    }}
                  />
                </div>
              </div>
            );
          }
          
          if (videoToShow) {
            // Calculate container style based on video aspect ratio
            const containerStyle: React.CSSProperties = {};
            if (videoAspectRatio) {
              // Use aspect-ratio CSS property if available, otherwise use padding-bottom technique
              containerStyle.aspectRatio = videoAspectRatio.toString();
              containerStyle.maxWidth = '100%';
              containerStyle.width = '100%';
            }
            
            return (
              <div className="mb-4 sm:mb-6 lg:mb-8 animate-scale-in flex justify-center px-4">
                <div 
                  className="inline-block rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 border-white overflow-hidden w-full max-w-full"
                  style={containerStyle}
                >
                  <video
                    ref={videoRef}
                    src={videoToShow}
                    className="w-full h-full object-contain rounded-2xl sm:rounded-3xl"
                    controls
                    autoPlay
                    playsInline
                    onLoadedMetadata={(e) => {
                      const video = e.currentTarget;
                      if (video.videoWidth && video.videoHeight) {
                        const aspectRatio = video.videoWidth / video.videoHeight;
                        console.log('Video loaded with dimensions:', video.videoWidth, 'x', video.videoHeight, 'aspect ratio:', aspectRatio);
                        setVideoAspectRatio(aspectRatio);
                      }
                    }}
                    onEnded={() => {
                      // When video_after finishes playing, proceed to celebration or next question
                      if (showVideoAfter && questionVideoAfterUrl && waitingForVideoToComplete) {
                        console.log('Video_after finished playing');
                        setWaitingForVideoToComplete(false);
                        // If this was after a correct answer, proceed to celebration
                        if (hasCalledCorrectAnswer && isCorrect) {
                          onCorrectAnswer();
                        } else {
                          // If this was after max attempts, proceed to next question
                          setShowFeedback(false);
                          setIsWaitingForAnswer(false);
                          setIsProcessingAnswer(false);
                          setIsUserInteracting(false);
                          onNextQuestion();
                        }
                      }
                    }}
                    onError={(e) => {
                      const errorMessage = `Failed to load video: ${videoToShow}`;
                      console.error('Error loading question video:', videoToShow, e);
                      e.currentTarget.style.display = 'none';
                      
                      // Show toast notification
                      toast({
                        title: "Video Loading Error",
                        description: "The video could not be loaded. Continuing without it.",
                        variant: "destructive",
                      });
                      
                      // If video fails to load and we're waiting for it, proceed anyway
                      if (showVideoAfter && questionVideoAfterUrl && waitingForVideoToComplete) {
                        console.log('Video_after failed to load, proceeding anyway');
                        setWaitingForVideoToComplete(false);
                        // If this was after a correct answer, proceed to celebration
                        if (hasCalledCorrectAnswer && isCorrect) {
                          onCorrectAnswer();
                        } else {
                          // If this was after max attempts, proceed to next question
                          setShowFeedback(false);
                          setIsWaitingForAnswer(false);
                          setIsProcessingAnswer(false);
                          setIsUserInteracting(false);
                          onNextQuestion();
                        }
                      }
                    }}
                  />
                </div>
              </div>
            );
          } else if (questionImageUrl) {
            return (
              <div className="mb-4 sm:mb-6 lg:mb-8 animate-scale-in flex justify-center px-4">
                <div className="inline-block rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 border-white overflow-hidden w-full max-w-full">
                  <img
                    src={questionImageUrl}
                    alt={question.description_text || `Question ${questionNumber} visual content for ${therapistName} therapy session`}
                    className={`w-full object-contain rounded-2xl sm:rounded-3xl ${mediaHeight}`}
                    loading="lazy"
                    onError={(e) => {
                      console.error('Error loading question image:', questionImageUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Description Text - Show below question image if present */}
        {question.description_text && (
          <div className="mb-4 sm:mb-6 lg:mb-8 animate-fade-in px-4">
            <p className="text-sm sm:text-base lg:text-lg italic font-semibold text-center max-w-4xl mx-auto" style={{ color: 'rgb(60, 69, 85)' }}>
              {question.description_text}
            </p>
          </div>
        )}

        {/* Choices (if choices_image is present) */}
        {choiceImageUrls.length > 0 && (() => {
          const hasQuestionImage = !!questionImageUrl;
          // Use viewport height percentages: 30vh when question_image exists, 80vh when only choices
          // On mobile/tablet use fixed sizes, on iPad+ (md) use viewport heights
          const imageSize = hasQuestionImage 
            ? 'w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-auto md:h-[30vh]' 
            : 'w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-auto md:h-[80vh]';
          
          return (
            <div className="flex flex-row gap-2 sm:gap-4 mb-6 sm:mb-8 justify-center items-center flex-wrap md:flex-nowrap px-4">
              {choiceImageUrls.map((imageUrl, index) => {
                const isSelected = selectedChoiceIndex === index;
                const isCorrectChoice = question.answer_index !== null && index === question.answer_index;
                const showResult = isSelected && isCorrect !== null;
                const isClickable = question.answer_index !== null && question.answer_index >= 0;
                
                return (
                  <button
                    key={index}
                    onClick={() => isClickable && handleChoiceClick(index)}
                    disabled={isProcessingAnswer || hasCalledCorrectAnswer || !isClickable}
                    className={`
                      relative p-4 rounded-xl border-4 transition-all duration-300 overflow-hidden flex-shrink
                      ${isSelected && isCorrectChoice ? 'border-green-500 bg-green-50' : ''}
                      ${isSelected && !isCorrectChoice ? 'border-red-500 bg-red-50' : ''}
                      ${!isSelected ? 'border-blue-200 bg-white hover:border-blue-400 hover:shadow-lg' : ''}
                      ${isProcessingAnswer || hasCalledCorrectAnswer || !isClickable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      ${isClickable && !isProcessingAnswer && !hasCalledCorrectAnswer ? 'group' : ''}
                    `}
                  >
                    <img
                      src={imageUrl}
                      alt={`Choice ${index + 1}`}
                      className={`
                        ${imageSize} object-contain rounded-xl sm:rounded-2xl transition-transform duration-300
                        ${isClickable && !isProcessingAnswer && !hasCalledCorrectAnswer ? 'group-hover:scale-125' : ''}
                      `}
                    />
                  {showResult && (
                    <div className="absolute top-2 right-2 z-10">
                      {isCorrectChoice ? (
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-600" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          );
        })()}

        {/* Feedback Area */}
        {showFeedback && currentResponse && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-200 rounded-3xl p-6 max-w-2xl mx-auto mb-8 animate-fade-in">
            <p className="text-lg text-center text-green-800 font-medium">
              {currentResponse}
            </p>
          </div>
        )}

        {/* Fixed Microphone Button */}
        {hasAnswerField && isWaitingForAnswer && !showFeedback && !isProcessingAnswer && (
          <div className="text-center animate-fade-in">
            <div className="flex flex-col items-center">
              <AnimatedMicButton
                isRecording={isRecording}
                onClick={handleVoiceRecording}
                audioLevel={audioLevel}
                label={isRecording ? 'Recording...' : ''}
              />

              {amplifyMic && lastAudioBlob && (
                <div className="mt-2">
                  <button
                    onClick={handlePlayback}
                    disabled={isPlayingBack}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold shadow hover:from-purple-600 hover:to-blue-600 transition-all"
                  >
                    {isPlayingBack ? 'Playing...' : 'Play Back Recording'}
                  </button>
                  <audio ref={audioPlaybackRef} hidden />
                </div>
              )}
            
              <div className="mt-4 text-center">
                {isRecording ? (
                  <p className="text-blue-600 font-normal text-base mt-2">🔴 Recording... Tap again to stop</p>
                ) : isProcessing ? (
                  <p className="text-blue-600 font-normal text-base mt-2">🔄 Processing your voice...</p>
                ) : isPlaying ? (
                  <p className="text-blue-600 font-normal text-base mt-2">🎵 Playing...</p>
                ) : null}
                {/* Tap to answer styled and positioned below mic button */}
                {!(isRecording || isProcessing || isPlaying) && (
                  <p className="text-blue-400 italic text-base mt-2">Tap to answer</p>
                )}
                {retryCount > 0 && (
                  <p className="text-sm text-purple-600 mt-2">
                    Attempt {retryCount + 1} of 2
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Processing State - Show when processing answer but no feedback yet */}
        {isProcessingAnswer && !showFeedback && (
          <div className="text-center animate-fade-in">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-200 to-blue-200 flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-blue-600 font-normal text-lg">🔄 Processing your answer...</p>
              {lastMicInput && (
                <p className="text-gray-600 text-sm mt-2 italic">
                  "I heard: {lastMicInput}"
                </p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {(hasCalledCorrectAnswer || showImageAfter) && !waitingForVideoToComplete && (
          <div className="flex justify-center space-x-4 mt-8">
            <Button
              onClick={() => {
                if (showImageAfter) {
                  // If image is showing, hide it and proceed
                  setShowImageAfter(false);
                  setIsProcessingAfterAnswer(false);
                  if (hasCalledCorrectAnswer && isCorrect) {
                    onCorrectAnswer();
                  } else {
                    setShowFeedback(false);
                    setIsWaitingForAnswer(false);
                    setIsProcessingAnswer(false);
                    setIsUserInteracting(false);
                    onNextQuestion();
                  }
                } else {
                  // Normal navigation
                  questionNumber >= totalQuestions ? onComplete() : onNextQuestion();
                }
              }}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 text-lg font-bold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              {questionNumber >= totalQuestions ? 'Complete' : 'Next Question'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionView;


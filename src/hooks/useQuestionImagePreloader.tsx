import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  question_image: string | null;
  choices_image: string | null;
  image_after_answer: string | null;
}

// In-memory cache for preloaded images
const preloadedImages = new Set<string>();
const preloadingImages = new Set<string>();

/**
 * Converts a storage path to a public URL if needed
 */
const getPublicUrl = (path: string): string => {
  if (!path || path.trim() === '') return '';
  
  // If it's already a full URL, return as-is
  if (path.startsWith('http')) {
    return path;
  }
  
  // Get public URL from Supabase storage
  const { data } = supabase.storage
    .from('question-images-v2')
    .getPublicUrl(path);
  
  return data?.publicUrl || path;
};

/**
 * Extracts all image URLs from a question
 */
const extractImageUrls = (question: Question): string[] => {
  const urls: string[] = [];
  
  // Question image
  if (question.question_image) {
    urls.push(getPublicUrl(question.question_image));
  }
  
  // Choices images (comma-separated)
  if (question.choices_image) {
    const choiceUrls = question.choices_image
      .split(',')
      .map(url => url.trim())
      .filter(url => url)
      .map(url => getPublicUrl(url));
    urls.push(...choiceUrls);
  }
  
  // Image after answer
  if (question.image_after_answer) {
    urls.push(getPublicUrl(question.image_after_answer));
  }
  
  return urls.filter(url => url && url.trim() !== '');
};

/**
 * Preloads a single image
 */
const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve) => {
    if (preloadedImages.has(url) || preloadingImages.has(url)) {
      resolve();
      return;
    }
    
    preloadingImages.add(url);
    
    const img = new Image();
    img.onload = () => {
      preloadedImages.add(url);
      preloadingImages.delete(url);
      resolve();
    };
    img.onerror = () => {
      preloadingImages.delete(url);
      resolve(); // Don't block on errors
    };
    img.src = url;
  });
};

/**
 * Hook to preload images for upcoming questions
 * @param questions - Array of all questions in the lesson
 * @param currentIndex - Current question index
 * @param preloadCount - Number of upcoming questions to preload (default: 3)
 */
export const useQuestionImagePreloader = (
  questions: Question[],
  currentIndex: number,
  preloadCount: number = 3
) => {
  const preloadedRef = useRef<Set<string>>(new Set());
  
  // Preload images for the current and upcoming questions
  useEffect(() => {
    if (!questions || questions.length === 0 || currentIndex < 0) {
      return;
    }
    
    const preloadUpcoming = async () => {
      // Get current + next N questions
      const endIndex = Math.min(currentIndex + preloadCount + 1, questions.length);
      const questionsToPreload = questions.slice(currentIndex, endIndex);
      
      // Extract all image URLs
      const allUrls: string[] = [];
      for (const question of questionsToPreload) {
        const urls = extractImageUrls(question);
        allUrls.push(...urls);
      }
      
      // Filter out already preloaded URLs
      const newUrls = allUrls.filter(url => 
        !preloadedRef.current.has(url) && !preloadedImages.has(url)
      );
      
      if (newUrls.length > 0) {
        console.log(`🖼️ Preloading ${newUrls.length} images for questions ${currentIndex} to ${endIndex - 1}`);
        
        // Preload all images in parallel
        await Promise.all(newUrls.map(url => {
          preloadedRef.current.add(url);
          return preloadImage(url);
        }));
        
        console.log(`✅ Preloaded ${newUrls.length} images`);
      }
    };
    
    preloadUpcoming();
  }, [questions, currentIndex, preloadCount]);
  
  // Function to preload all images for a lesson upfront
  const preloadAllLessonImages = useCallback(async (lessonQuestions: Question[]) => {
    if (!lessonQuestions || lessonQuestions.length === 0) {
      return;
    }
    
    const allUrls: string[] = [];
    for (const question of lessonQuestions) {
      const urls = extractImageUrls(question);
      allUrls.push(...urls);
    }
    
    const newUrls = allUrls.filter(url => !preloadedImages.has(url));
    
    if (newUrls.length > 0) {
      console.log(`🖼️ Preloading all ${newUrls.length} lesson images`);
      
      // Preload in batches to avoid overwhelming the browser
      const batchSize = 5;
      for (let i = 0; i < newUrls.length; i += batchSize) {
        const batch = newUrls.slice(i, i + batchSize);
        await Promise.all(batch.map(preloadImage));
      }
      
      console.log(`✅ All lesson images preloaded`);
    }
  }, []);
  
  return {
    preloadAllLessonImages,
    isImagePreloaded: (url: string) => preloadedImages.has(url)
  };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LessonActivity {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
  status?: 'started' | 'complete' | null;
  overall_rating?: number | null;
  usefulness_rating?: number | null;
  communication_rating?: number | null;
  would_recommend?: boolean | null;
  what_went_well?: string | null;
  what_can_be_improved?: string | null;
  lesson?: {
    id: string;
    name: string;
    description: string | null;
    question_type: string;
    level: string;
  };
}

export const useLessonActivity = (userId: string | null) => {
  const [lessonActivities, setLessonActivities] = useState<LessonActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setLessonActivities([]);
      return;
    }

    setLoading(true);
    const fetchLessonActivity = async () => {
      try {
        const { data, error } = await supabase
          .from('lesson_activity' as any)
          .select(`
            *,
            lessons_v2:lesson_id (
              id,
              name,
              description,
              question_type,
              level
            )
          `)
          .eq('user_id', userId)
          .order('completed_at', { ascending: false });

        if (error) {
          console.error('Error fetching lesson activity:', error);
          return;
        }

        if (data) {
          const formattedData = (data as any[]).map((activity: any) => ({
            ...activity,
            lesson: activity.lessons_v2 ? (Array.isArray(activity.lessons_v2) ? activity.lessons_v2[0] : activity.lessons_v2) : null,
          }));
          setLessonActivities(formattedData);
        }
      } catch (error) {
        console.error('Error fetching lesson activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonActivity();
  }, [userId]);

  const submitReview = async (lessonId: string, review: {
    overall_rating: number;
    usefulness_rating: number;
    communication_rating: number;
    would_recommend: boolean;
    what_went_well: string;
    what_can_be_improved: string;
  }) => {
    if (!userId) throw new Error('User ID required');

    // Check if a review already exists for this lesson (to determine if this is an update or new review)
    const { data: existingReviewData, error: existingReviewError } = await supabase
      .from('lesson_activity' as any)
      .select('id, overall_rating')
      .eq('lesson_id', lessonId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingReviewError && existingReviewError.code !== 'PGRST116') {
      throw existingReviewError;
    }

    const isUpdate = !!existingReviewData;
    const existingData = existingReviewData as any;
    const oldRating = existingData?.overall_rating;
    const activityId = existingData?.id;

    let data;
    let error;

    if (isUpdate && activityId) {
      const updateResult = await supabase
        .from('lesson_activity' as any)
        .update({
          overall_rating: review.overall_rating,
          usefulness_rating: review.usefulness_rating,
          communication_rating: review.communication_rating,
          would_recommend: review.would_recommend,
          what_went_well: review.what_went_well || null,
          what_can_be_improved: review.what_can_be_improved || null,
        })
        .eq('id', activityId)
        .select()
        .single();
      
      data = updateResult.data;
      error = updateResult.error;
    } else {
      // This shouldn't happen if lesson activity was created, but handle it anyway
      const insertResult = await supabase
        .from('lesson_activity' as any)
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          overall_rating: review.overall_rating,
          usefulness_rating: review.usefulness_rating,
          communication_rating: review.communication_rating,
          would_recommend: review.would_recommend,
          what_went_well: review.what_went_well || null,
          what_can_be_improved: review.what_can_be_improved || null,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      data = insertResult.data;
      error = insertResult.error;
    }

    if (error) throw error;

    // Update lesson's review statistics in lessons_v2 table
    try {
      const { data: lessonData, error: lessonFetchError } = await supabase
        .from('lessons_v2' as any)
        .select('reviews, num_reviews, average_review')
        .eq('id', lessonId)
        .single();

      if (lessonFetchError) {
        console.error('Error fetching lesson data:', lessonFetchError);
      } else if (lessonData) {
        const ld = lessonData as any;
        let reviewsArray: number[] = [];
        try {
          if (ld.reviews) {
            // Parse reviews as comma-separated string or JSON array
            if (typeof ld.reviews === 'string') {
              if (ld.reviews.startsWith('[')) {
                reviewsArray = JSON.parse(ld.reviews);
              } else {
                reviewsArray = ld.reviews.split(',').map((r: string) => parseFloat(r.trim())).filter((r: number) => !isNaN(r));
              }
            }
          }
        } catch (e) {
          reviewsArray = [];
        }

        let newNumReviews = ld.num_reviews || 0;
        let newAverage = ld.average_review || 0;

        if (isUpdate && oldRating !== undefined) {
          // Update existing review: replace old rating with new one
          const oldRatingIndex = reviewsArray.findIndex(r => r === oldRating);
          if (oldRatingIndex !== -1) {
            reviewsArray[oldRatingIndex] = review.overall_rating;
          } else {
            reviewsArray.push(review.overall_rating);
            newNumReviews++;
          }
        } else {
          // New review: add to array and increment count
          reviewsArray.push(review.overall_rating);
          newNumReviews++;
        }

        // Recalculate average
        const sum = reviewsArray.reduce((acc, val) => acc + val, 0);
        newAverage = sum / reviewsArray.length;

        // Convert reviews array back to comma-separated string
        const reviewsString = reviewsArray.join(',');

        const { error: updateError } = await supabase
          .from('lessons_v2' as any)
          .update({
            reviews: reviewsString,
            num_reviews: newNumReviews,
            average_review: parseFloat(newAverage.toFixed(1)),
          })
          .eq('id', lessonId);

        if (updateError) {
          console.error('Error updating lesson reviews:', updateError);
        }
      }
    } catch (updateError) {
      console.error('Error updating lesson review statistics:', updateError);
    }

    // Update local state
    setLessonActivities(prev => {
      const updated = prev.map(activity => 
        activity.lesson_id === lessonId 
          ? { ...activity, ...data }
          : activity
      );
      
      // If activity doesn't exist in state, add it
      if (!prev.find(a => a.lesson_id === lessonId)) {
        updated.push(data as LessonActivity);
      }
      
      return updated;
    });

    return data;
  };

  return {
    lessonActivities,
    loading,
    submitReview,
  };
};


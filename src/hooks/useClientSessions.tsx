import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TherapySession {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  session_type: string;
  client_notes?: string;
  therapist_notes?: string;
  price_paid?: number;
  currency?: string;
  created_at: string;
  meeting_link?: string;
  zoom_meeting_id?: string;
  zoom_password?: string;
  therapist: {
    id: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

interface SessionRating {
  id: string;
  session_id: string;
  rating: number;
  overall_rating?: number;
  usefulness_rating?: number;
  communication_rating?: number;
  would_recommend?: boolean;
  what_went_well?: string;
  what_can_be_improved?: string;
  created_at: string;
}

interface ClientSessionStats {
  upcomingSessions: TherapySession[];
  completedSessions: TherapySession[];
  sessionRatings: SessionRating[];
  loading: boolean;
  error: string | null;
}

export const useClientSessions = (clientId: string | null) => {
  const [stats, setStats] = useState<ClientSessionStats>({
    upcomingSessions: [],
    completedSessions: [],
    sessionRatings: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchClientSessions = async () => {
      if (!clientId) {
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));
        
        const today = new Date().toISOString().split('T')[0];

        // Fetch all sessions with therapist details
        const { data: allSessions, error: sessionsError } = await supabase
          .from('therapy_sessions')
          .select(`
            *,
            therapists!inner (
              id,
              name,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('client_id', clientId)
          .order('session_date', { ascending: false });

        if (sessionsError) {
          throw sessionsError;
        }

        // Transform the data to match our interface
        const transformedSessions = allSessions?.map(session => ({
          ...session,
          therapist: session.therapists
        })) || [];

        // Fetch session ratings
        const { data: ratings, error: ratingsError } = await supabase
          .from('session_ratings')
          .select('*')
          .eq('client_id', clientId);

        if (ratingsError) {
          throw ratingsError;
        }

        // Separate upcoming and completed sessions
        const now = new Date();
        
        const upcoming = transformedSessions
          .filter(session => {
            // Show session as upcoming if:
            // 1. End time hasn't passed yet, OR
            // 2. Session ended within last 2 hours (grace period for late access)
            const sessionEndDateTime = new Date(`${session.session_date}T${session.end_time}`);
            const twoHoursAfterEnd = new Date(sessionEndDateTime.getTime() + 2 * 60 * 60 * 1000);
            return (sessionEndDateTime >= now || twoHoursAfterEnd >= now) && ['confirmed', 'pending'].includes(session.status);
          })
          .sort((a, b) => {
            // Sort by date and start time ascending (earliest first)
            const dateA = new Date(`${a.session_date}T${a.start_time}`);
            const dateB = new Date(`${b.session_date}T${b.start_time}`);
            return dateA.getTime() - dateB.getTime();
          });

        const completed = transformedSessions
          .filter(session => {
            const sessionDateTime = new Date(`${session.session_date}T${session.end_time}`);
            return session.status === 'completed' || session.status === 'cancelled' || (sessionDateTime < now && session.status === 'pending');
          })
          .map(session => {
            // Auto-mark past pending sessions as completed for display
            const sessionDateTime = new Date(`${session.session_date}T${session.end_time}`);
            return (sessionDateTime < now && session.status === 'pending')
              ? { ...session, status: 'completed' }
              : session;
          })
          .sort((a, b) => {
            // Sort by date and start time descending (most recent first)
            const dateA = new Date(`${a.session_date}T${a.start_time}`);
            const dateB = new Date(`${b.session_date}T${b.start_time}`);
            return dateB.getTime() - dateA.getTime();
          });

        setStats({
          upcomingSessions: upcoming,
          completedSessions: completed,
          sessionRatings: ratings || [],
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching client sessions:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch sessions',
        }));
      }
    };

    fetchClientSessions();
  }, [clientId]);

  const submitRating = async (sessionId: string, rating: number, feedbackText?: string, categories?: string[], wouldRecommend?: boolean) => {
    if (!clientId) throw new Error('Client ID required');

const { data, error } = await supabase
  .from('session_ratings')
  .upsert({
    session_id: sessionId,
    client_id: clientId,
    therapist_id: (await supabase
      .from('therapy_sessions')
      .select('therapist_id')
      .eq('id', sessionId)
      .single()
    ).data?.therapist_id,
    rating,
    would_recommend: wouldRecommend,
  })
  .select()
  .single();

    if (error) throw error;

    // Update local state
    setStats(prev => ({
      ...prev,
      sessionRatings: [
        ...prev.sessionRatings.filter(r => r.session_id !== sessionId),
        data
      ]
    }));

    return data;
  };

  const submitReview = async (sessionId: string, review: {
    overall_rating: number;
    usefulness_rating: number;
    communication_rating: number;
    would_recommend: boolean;
    what_went_well: string;
    what_can_be_improved: string;
  }) => {
    if (!clientId) throw new Error('Client ID required');

    // Get therapist_id from session
    const { data: sessionData, error: sessionError } = await supabase
      .from('therapy_sessions')
      .select('therapist_id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !sessionData?.therapist_id) {
      throw new Error('Failed to fetch session data');
    }

    const therapistId = sessionData.therapist_id;

    // Check if a review already exists for this session (to determine if this is an update or new review)
    const { data: existingReviewData, error: existingReviewError } = await supabase
      .from('session_ratings')
      .select('id, overall_rating, rating')
      .eq('session_id', sessionId)
      .eq('client_id', clientId)
      .maybeSingle();

    if (existingReviewError && existingReviewError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is fine
      throw existingReviewError;
    }

    const isUpdate = !!existingReviewData;
    const oldRating = existingReviewData?.overall_rating || existingReviewData?.rating;
    const reviewId = existingReviewData?.id;

    // Save or update the review
    let data;
    let error;

    if (isUpdate && reviewId) {
      // Update existing review
      const updateResult = await supabase
        .from('session_ratings')
        .update({
          rating: review.overall_rating, // Keep for backward compatibility
          overall_rating: review.overall_rating,
          usefulness_rating: review.usefulness_rating,
          communication_rating: review.communication_rating,
          would_recommend: review.would_recommend,
          what_went_well: review.what_went_well || null,
          what_can_be_improved: review.what_can_be_improved || null,
        })
        .eq('id', reviewId)
        .select()
        .single();
      
      data = updateResult.data;
      error = updateResult.error;
    } else {
      // Insert new review
      const insertResult = await supabase
        .from('session_ratings')
        .insert({
          session_id: sessionId,
          client_id: clientId,
          therapist_id: therapistId,
          rating: review.overall_rating, // Keep for backward compatibility
          overall_rating: review.overall_rating,
          usefulness_rating: review.usefulness_rating,
          communication_rating: review.communication_rating,
          would_recommend: review.would_recommend,
          what_went_well: review.what_went_well || null,
          what_can_be_improved: review.what_can_be_improved || null,
        })
        .select()
        .single();
      
      data = insertResult.data;
      error = insertResult.error;
    }

    if (error) throw error;

    // Update therapist's review statistics
    try {
      // Fetch current therapist review stats
      const { data: therapistData, error: therapistFetchError } = await supabase
        .from('therapists')
        .select('reviews, num_reviews, average_review')
        .eq('id', therapistId)
        .single();

      if (therapistFetchError) {
        console.error('Error fetching therapist data:', therapistFetchError);
        // Continue even if fetch fails - the review is already saved
      } else if (therapistData) {
        const oldNumReviews = therapistData.num_reviews || 0;
        const oldAverageReview = therapistData.average_review || 0;
        const currentReview = review.overall_rating;

        // Parse reviews array (stored as JSON string like '[5,5,5,5,5]')
        let reviewsArray: number[] = [];
        try {
          if (therapistData.reviews) {
            reviewsArray = JSON.parse(therapistData.reviews);
          }
        } catch (e) {
          // If parsing fails, start with empty array
          reviewsArray = [];
        }

        let newNumReviews: number;
        let newAverageReview: number;
        let updatedReviewsArray: number[];

        if (isUpdate && oldRating !== undefined) {
          // This is an update - replace the old rating with the new one
          // Find and replace the first occurrence of the old rating
          const oldRatingIndex = reviewsArray.findIndex(r => r === oldRating);
          if (oldRatingIndex !== -1) {
            updatedReviewsArray = [...reviewsArray];
            updatedReviewsArray[oldRatingIndex] = currentReview;
          } else {
            // Old rating not found in array, just add the new one
            updatedReviewsArray = [...reviewsArray, currentReview];
          }
          
          // For updates: recalculate average using formula
          // (old avg * old num - old rating + new rating) / old num
          newNumReviews = oldNumReviews; // Don't increment for updates
          newAverageReview = (oldAverageReview * oldNumReviews - oldRating + currentReview) / oldNumReviews;
        } else {
          // This is a new review
          // Add the new rating to the array
          updatedReviewsArray = [...reviewsArray, currentReview];
          
          // For new reviews: increment num_reviews and calculate new average
          // (old avg * old num + current review) / new num
          newNumReviews = oldNumReviews + 1;
          newAverageReview = (oldAverageReview * oldNumReviews + currentReview) / newNumReviews;
        }

        // Update therapist record
        const { error: updateError } = await supabase
          .from('therapists')
          .update({
            reviews: JSON.stringify(updatedReviewsArray),
            num_reviews: newNumReviews,
            average_review: parseFloat(newAverageReview.toFixed(1)),
          })
          .eq('id', therapistId);

        if (updateError) {
          console.error('Error updating therapist reviews:', updateError);
          // Continue even if update fails - the review is already saved
        }
      }
    } catch (updateError) {
      console.error('Error updating therapist review statistics:', updateError);
      // Continue even if update fails - the review is already saved
    }

    // Update local state
    setStats(prev => ({
      ...prev,
      sessionRatings: [
        ...prev.sessionRatings.filter(r => r.session_id !== sessionId),
        data
      ]
    }));

    return data;
  };

  return { ...stats, submitRating, submitReview };
};
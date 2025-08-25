import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TherapistRating {
  therapistId: string;
  averageRating: number;
  reviewCount: number;
}

export const useTherapistRatings = (therapistIds: string[]) => {
  const [ratings, setRatings] = useState<TherapistRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      if (therapistIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all session ratings for the given therapists
        const { data, error } = await supabase
          .from('session_ratings')
          .select('therapist_id, rating')
          .in('therapist_id', therapistIds);

        if (error) {
          console.error('Error fetching ratings:', error);
          setLoading(false);
          return;
        }

        // Calculate average rating and count for each therapist
        const ratingsByTherapist = data?.reduce((acc, rating) => {
          const therapistId = rating.therapist_id;
          if (!acc[therapistId]) {
            acc[therapistId] = {
              ratings: [],
              count: 0
            };
          }
          acc[therapistId].ratings.push(rating.rating);
          acc[therapistId].count++;
          return acc;
        }, {} as Record<string, { ratings: number[], count: number }>) || {};

        // Create the final ratings array
        const ratingsArray = therapistIds.map(therapistId => {
          const therapistRatings = ratingsByTherapist[therapistId];
          if (!therapistRatings || therapistRatings.count === 0) {
            return {
              therapistId,
              averageRating: 0,
              reviewCount: 0
            };
          }

          const average = therapistRatings.ratings.reduce((sum, rating) => sum + rating, 0) / therapistRatings.count;
          return {
            therapistId,
            averageRating: Math.round(average * 10) / 10, // Round to 1 decimal place
            reviewCount: therapistRatings.count
          };
        });

        setRatings(ratingsArray);
      } catch (error) {
        console.error('Error fetching therapist ratings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [therapistIds]);

  const getRatingForTherapist = (therapistId: string) => {
    return ratings.find(r => r.therapistId === therapistId) || {
      therapistId,
      averageRating: 0,
      reviewCount: 0
    };
  };

  return { ratings, loading, getRatingForTherapist };
};
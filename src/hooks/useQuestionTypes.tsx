import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface QuestionType {
  name: string;
  display_string: string;
  description: string;
}

export const useQuestionTypes = () => {
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestionTypes = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('question_types')
          .select('name, display_string, description')
          .order('name');

        if (fetchError) {
          console.error('Error loading question types:', fetchError);
          setError(fetchError.message);
          // Fallback to empty array if fetch fails
          setQuestionTypes([]);
        } else {
          setQuestionTypes(data || []);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load question types:', err);
        setError(err instanceof Error ? err.message : 'Failed to load question types');
        setQuestionTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionTypes();
  }, []);

  return { questionTypes, loading, error };
};


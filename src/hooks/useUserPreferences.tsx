import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

type PreferenceState = 'yes' | 'no' | 'default';

interface UserPreferences {
  speechDelayMode: PreferenceState;
  addMiniCelebration: PreferenceState;
  celebrationVideoId: string | null;
  useAiTherapist: boolean;
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    speechDelayMode: 'default',
    addMiniCelebration: 'default',
    celebrationVideoId: null,
    useAiTherapist: true,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { role } = useUserRole();
  const { toast } = useToast();
  
  // Check if user is a therapist (therapist or therapist_admin)
  const isTherapist = role === 'therapist' || role === 'therapist_admin';

  // Load preferences from database
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // For therapists, load use_ai_therapist from therapists table
        // For parents, load from profiles table
        let useAiTherapistValue = true;
        
        if (isTherapist) {
          // Load from therapists table
          const { data: therapistData, error: therapistError } = await supabase
            .from('therapists')
            .select('use_ai_therapist')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (!therapistError && therapistData) {
            useAiTherapistValue = therapistData.use_ai_therapist !== undefined ? therapistData.use_ai_therapist : true;
          }
        }
        
        // Load other preferences from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('speech_delay_mode, add_mini_celebration, celebration_video_id, use_ai_therapist')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading user preferences:', error);
        } else {
          // Handle migration from boolean to three-state
          // Default to 'default' if value is null, undefined, or not recognized
          let speechDelayMode: PreferenceState = 'default';
          const speechVal = data.speech_delay_mode as any;
          if (speechVal === true || speechVal === 'yes') {
            speechDelayMode = 'yes';
          } else if (speechVal === false || speechVal === 'no') {
            speechDelayMode = 'no';
          } else if (speechVal === 'default' || speechVal === null || speechVal === undefined) {
            speechDelayMode = 'default';
          }
          
          let addMiniCelebration: PreferenceState = 'default';
          const celebrationVal = data.add_mini_celebration as any;
          if (celebrationVal === true || celebrationVal === 'yes') {
            addMiniCelebration = 'yes';
          } else if (celebrationVal === false || celebrationVal === 'no') {
            addMiniCelebration = 'no';
          } else if (celebrationVal === 'default' || celebrationVal === null || celebrationVal === undefined) {
            addMiniCelebration = 'default';
          }
          
          // For parents (non-therapists), always set useAiTherapist to true
          // For therapists, use the value from therapists table (already loaded above)
          if (!isTherapist) {
            useAiTherapistValue = true;
          }
          
          setPreferences({
            speechDelayMode,
            addMiniCelebration,
            celebrationVideoId: data.celebration_video_id || null,
            useAiTherapist: useAiTherapistValue,
          });
          
          // For parents, ensure use_ai_therapist is always set to true in database
          if (!isTherapist && data.use_ai_therapist !== true) {
            supabase
              .from('profiles')
              .update({ use_ai_therapist: true })
              .eq('id', user.id)
              .then(({ error }) => {
                if (error) console.error('Error setting use_ai_therapist to true for parent:', error);
              });
          }
          
          // If preferences were null/undefined, save 'default' to database
          if (data.speech_delay_mode === null || data.speech_delay_mode === undefined || 
              (data.speech_delay_mode !== 'yes' && data.speech_delay_mode !== 'no' && data.speech_delay_mode !== 'default' && typeof data.speech_delay_mode !== 'boolean')) {
            // Save default value to database
            supabase
              .from('profiles')
              .update({ speech_delay_mode: 'default' })
              .eq('id', user.id)
              .then(({ error }) => {
                if (error) console.error('Error setting default speech_delay_mode:', error);
              });
          }
          
          if (data.add_mini_celebration === null || data.add_mini_celebration === undefined || 
              (data.add_mini_celebration !== 'yes' && data.add_mini_celebration !== 'no' && data.add_mini_celebration !== 'default' && typeof data.add_mini_celebration !== 'boolean')) {
            // Save default value to database
            supabase
              .from('profiles')
              .update({ add_mini_celebration: 'default' })
              .eq('id', user.id)
              .then(({ error }) => {
                if (error) console.error('Error setting default add_mini_celebration:', error);
              });
          }
        }
      } catch (err) {
        console.error('Failed to load user preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user?.id, isTherapist]);

  // Update speech delay mode
  const updateSpeechDelayMode = async (value: PreferenceState) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ speech_delay_mode: value })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating speech delay mode:', error);
        toast({
          title: "Error",
          description: "Failed to save speech delay setting",
          variant: "destructive",
        });
        return;
      }

      setPreferences(prev => ({
        ...prev,
        speechDelayMode: value,
      }));

      const description = value === 'yes' ? 'enabled' : value === 'no' ? 'disabled' : 'set to default';
      toast({
        title: "Setting saved",
        description: `Speech delay mode ${description}`,
      });
    } catch (err) {
      console.error('Failed to update speech delay mode:', err);
      toast({
        title: "Error",
        description: "Failed to save speech delay setting",
        variant: "destructive",
      });
    }
  };

  // Update add mini celebration preference
  const updateAddMiniCelebration = async (value: PreferenceState) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ add_mini_celebration: value })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating add mini celebration preference:', error);
        toast({
          title: "Error",
          description: "Failed to save mini celebration setting",
          variant: "destructive",
        });
        return;
      }

      setPreferences(prev => ({
        ...prev,
        addMiniCelebration: value,
      }));

      const description = value === 'yes' ? 'enabled' : value === 'no' ? 'disabled' : 'set to default';
      toast({
        title: "Setting saved",
        description: `Mini celebrations ${description}`,
      });
    } catch (err) {
      console.error('Failed to update add mini celebration preference:', err);
      toast({
        title: "Error",
        description: "Failed to save mini celebration setting",
        variant: "destructive",
      });
    }
  };

  // Helper function to extract YouTube video ID from URL or return the ID if already extracted
  const extractYouTubeVideoId = (input: string | null): string | null => {
    if (!input || !input.trim()) return null;
    
    const trimmed = input.trim();
    
    // If it's already just a video ID (no URL patterns), return as is
    if (!trimmed.includes('youtube.com') && !trimmed.includes('youtu.be')) {
      return trimmed;
    }
    
    // Try to extract from various YouTube URL formats
    // Format 1: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = trimmed.match(/[?&]v=([^&]+)/);
    if (watchMatch && watchMatch[1]) {
      return watchMatch[1];
    }
    
    // Format 2: https://youtu.be/VIDEO_ID
    const shortMatch = trimmed.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch && shortMatch[1]) {
      return shortMatch[1];
    }
    
    // Format 3: https://www.youtube.com/embed/VIDEO_ID
    const embedMatch = trimmed.match(/\/embed\/([^?&]+)/);
    if (embedMatch && embedMatch[1]) {
      return embedMatch[1];
    }
    
    // If no pattern matches, return the trimmed input (might be just an ID)
    return trimmed;
  };

  // Update celebration video id
  const updateCelebrationVideoId = async (videoId: string | null) => {
    if (!user?.id) return;

    // Extract video ID from URL if a full URL is provided
    const extractedVideoId = extractYouTubeVideoId(videoId);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ celebration_video_id: extractedVideoId || null })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating celebration video id:', error);
        toast({
          title: "Error",
          description: "Failed to save celebration video id",
          variant: "destructive",
        });
        return;
      }

      setPreferences(prev => ({
        ...prev,
        celebrationVideoId: extractedVideoId || null,
      }));

      toast({
        title: "Setting saved",
        description: extractedVideoId ? "Celebration video id saved" : "Celebration video id cleared",
      });
    } catch (err) {
      console.error('Failed to update celebration video id:', err);
      toast({
        title: "Error",
        description: "Failed to save celebration video id",
        variant: "destructive",
      });
    }
  };

  // Update use AI therapist preference
  // Only therapists can change this setting. Parents always have it set to true.
  const updateUseAiTherapist = async (enabled: boolean) => {
    if (!user?.id) return;
    
    // For parents, always set to true and don't allow changes
    if (!isTherapist) {
      const { error } = await supabase
        .from('profiles')
        .update({ use_ai_therapist: true })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error setting use_ai_therapist to true for parent:', error);
      }
      
      setPreferences(prev => ({
        ...prev,
        useAiTherapist: true,
      }));
      return;
    }

    // For therapists, allow changing the setting - save to therapists table
    try {
      // First, get the therapist profile ID
      const { data: therapistData, error: therapistFetchError } = await supabase
        .from('therapists')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (therapistFetchError || !therapistData) {
        console.error('Error fetching therapist profile:', therapistFetchError);
        toast({
          title: "Error",
          description: "Failed to find therapist profile",
          variant: "destructive",
        });
        return;
      }
      
      // Update the therapists table
      const { error } = await supabase
        .from('therapists')
        .update({ use_ai_therapist: enabled })
        .eq('id', therapistData.id);

      if (error) {
        console.error('Error updating use AI therapist preference:', error);
        toast({
          title: "Error",
          description: "Failed to save AI therapist setting",
          variant: "destructive",
        });
        return;
      }

      setPreferences(prev => ({
        ...prev,
        useAiTherapist: enabled,
      }));

      toast({
        title: "Setting saved",
        description: `AI therapist ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (err) {
      console.error('Failed to update use AI therapist preference:', err);
      toast({
        title: "Error",
        description: "Failed to save AI therapist setting",
        variant: "destructive",
      });
    }
  };

  return {
    preferences,
    loading,
    updateSpeechDelayMode,
    updateAddMiniCelebration,
    updateCelebrationVideoId,
    updateUseAiTherapist,
  };
};
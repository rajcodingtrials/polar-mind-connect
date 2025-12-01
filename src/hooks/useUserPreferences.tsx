import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface UserPreferences {
  speechDelayMode: boolean;
  addMiniCelebration: boolean;
  celebrationVideoId: string | null;
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    speechDelayMode: false,
    addMiniCelebration: false,
    celebrationVideoId: null,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load preferences from database
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('speech_delay_mode, add_mini_celebration, celebration_video_id')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading user preferences:', error);
        } else {
          setPreferences({
            speechDelayMode: data.speech_delay_mode || false,
            addMiniCelebration: data.add_mini_celebration || false,
            celebrationVideoId: data.celebration_video_id || null,
          });
        }
      } catch (err) {
        console.error('Failed to load user preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user?.id]);

  // Update speech delay mode
  const updateSpeechDelayMode = async (enabled: boolean) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ speech_delay_mode: enabled })
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
        speechDelayMode: enabled,
      }));

      toast({
        title: "Setting saved",
        description: `Speech delay mode ${enabled ? 'enabled' : 'disabled'}`,
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
  const updateAddMiniCelebration = async (enabled: boolean) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ add_mini_celebration: enabled })
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
        addMiniCelebration: enabled,
      }));

      toast({
        title: "Setting saved",
        description: `Mini celebrations ${enabled ? 'enabled' : 'disabled'}`,
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

  return {
    preferences,
    loading,
    updateSpeechDelayMode,
    updateAddMiniCelebration,
    updateCelebrationVideoId,
  };
};
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface TherapistProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  date_of_birth?: string;
  phone?: string;
  country?: string;
  name: string;
  headline?: string;
  bio?: string;
  specializations: string[];
  hourly_rate_30min?: number;
  hourly_rate_60min?: number;
  avatar_url?: string;
  years_experience: number;
  certification?: string;
  education?: string;
  languages?: string[];
  timezone: string;
  is_verified: boolean;
  is_active: boolean;
  is_content_creator?: boolean;
  created_at: string;
  updated_at: string;
}

export const useTherapistAuth = () => {
  const [therapistProfile, setTherapistProfile] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTherapistProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('therapists')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No therapist profile found
            setTherapistProfile(null);
          } else {
            setError(error.message);
          }
        } else {
          setTherapistProfile(data);
        }
      } catch (err) {
        setError('Failed to fetch therapist profile');
        console.error('Error fetching therapist profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapistProfile();
  }, [user?.id]);

  const createTherapistProfile = async (profileData: Partial<TherapistProfile>) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create a therapist profile.",
      });
      return { error: { message: "Not authenticated" } };
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('therapists')
        .insert({
          user_id: user.id,
          first_name: profileData.first_name || null,
          last_name: profileData.last_name || null,
          email: profileData.email || null,
          date_of_birth: profileData.date_of_birth || null,
          phone: profileData.phone || null,
          country: profileData.country || null,
          name: profileData.name || '',
          bio: profileData.bio || null,
          specializations: profileData.specializations || [],
          hourly_rate_30min: profileData.hourly_rate_30min || null,
          hourly_rate_60min: profileData.hourly_rate_60min || null,
          avatar_url: profileData.avatar_url || null,
          years_experience: profileData.years_experience || 0,
          certification: profileData.certification || null,
          education: profileData.education || null,
          languages: profileData.languages || null,
          timezone: profileData.timezone || 'UTC',
          is_verified: false,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
        return { error };
      }

      setTherapistProfile(data);
      toast({
        title: "Success",
        description: "Therapist profile created successfully!",
      });
      return { data, error: null };
    } catch (err) {
      console.error('Error creating therapist profile:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create therapist profile.",
      });
      return { error: { message: "Failed to create profile" } };
    } finally {
      setLoading(false);
    }
  };

  const updateTherapistProfile = async (updates: Partial<TherapistProfile>) => {
    if (!therapistProfile?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No therapist profile found to update.",
      });
      return { error: { message: "No profile found" } };
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('therapists')
        .update(updates)
        .eq('id', therapistProfile.id)
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
        return { error };
      }

      setTherapistProfile(data);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      return { data, error: null };
    } catch (err) {
      console.error('Error updating therapist profile:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile.",
      });
      return { error: { message: "Failed to update profile" } };
    } finally {
      setLoading(false);
    }
  };

  const isTherapist = () => !!therapistProfile;

  return {
    therapistProfile,
    loading,
    error,
    createTherapistProfile,
    updateTherapistProfile,
    isTherapist,
  };
};
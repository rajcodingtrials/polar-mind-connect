import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTherapistAuth } from "../hooks/useTherapistAuth";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { useUserProfile } from "../hooks/useUserProfile";
import { useAuth } from "../context/AuthContext";
import TherapistHeader from "../components/therapist/TherapistHeader";
import Footer from "@/components/Footer";
import AILearningAdventure_v2 from "@/components/AILearningAdventure_v2";
import { supabase } from "@/integrations/supabase/client";

const TherapistAILessons = () => {
  const navigate = useNavigate();
  const { therapistProfile, loading: profileLoading } = useTherapistAuth();
  const { preferences, loading: preferencesLoading } = useUserPreferences();
  const { profile } = useUserProfile();
  const { user } = useAuth();
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [loadingLinkedParents, setLoadingLinkedParents] = useState(true);

  // Security: Only therapists can access this route
  useEffect(() => {
    if (!profileLoading) {
      if (!therapistProfile) {
        console.warn('⚠️ Non-therapist tried to access AI Lessons feature');
        navigate('/home', { replace: true });
      }
    }
  }, [therapistProfile, profileLoading, navigate]);

  // Fetch activated linked parent or use therapist's user_id
  useEffect(() => {
    const fetchActivatedParent = async () => {
      if (!therapistProfile?.id || !user?.id) {
        setLoadingLinkedParents(false);
        return;
      }

      try {
        setLoadingLinkedParents(true);
        // Find activated linked parent
        const { data: linkedParentsData, error } = await supabase
          .from('linked_parents' as any)
          .select('parent_user_id, is_active')
          .eq('therapist_id', therapistProfile.id)
          .eq('is_active', true)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching activated parent:', error);
        }

        if (linkedParentsData && !('error' in linkedParentsData)) {
          const linkedParent = linkedParentsData as { parent_user_id: string; is_active: boolean };
          if (linkedParent.is_active) {
            // Use activated parent's user_id
            setTargetUserId(linkedParent.parent_user_id);
          } else {
            // No activated parent, use therapist's user_id
            setTargetUserId(user.id);
          }
        } else {
          // No activated parent, use therapist's user_id
          setTargetUserId(user.id);
        }
      } catch (error) {
        console.error('Error in fetchActivatedParent:', error);
        // Fallback to therapist's user_id on error
        setTargetUserId(user.id);
      } finally {
        setLoadingLinkedParents(false);
      }
    };

    fetchActivatedParent();
  }, [therapistProfile?.id, user?.id]);

  // Loading state - wait for profile, preferences, and linked parents to load
  if (profileLoading || preferencesLoading || loadingLinkedParents || !targetUserId) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <TherapistHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-700 mb-2">Loading...</h2>
            <p className="text-slate-600">Preparing your AI lessons</p>
          </div>
        </div>
      </div>
    );
  }

  // Get the therapist's use_ai_therapist preference (default to true if not set)
  const therapistUseAiTherapist = preferences?.useAiTherapist !== undefined 
    ? preferences.useAiTherapist 
    : true;

  // Get therapist name from profile or therapistProfile
  const therapistName = therapistProfile?.name || 
                       therapistProfile?.first_name || 
                       profile?.name || 
                       profile?.username || 
                       'Therapist';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <TherapistHeader />
      <AILearningAdventure_v2 
        therapistName={therapistName}
        overrideUseAiTherapist={therapistUseAiTherapist}
        userId={targetUserId}
      />
      <Footer />
    </div>
  );
};

export default TherapistAILessons;


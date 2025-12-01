import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTherapistAuth } from "../hooks/useTherapistAuth";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { useUserProfile } from "../hooks/useUserProfile";
import TherapistHeader from "../components/therapist/TherapistHeader";
import Footer from "@/components/Footer";
import AILearningAdventure_v2 from "@/components/parents/AILearningAdventure_v2";

const TherapistAILessons = () => {
  const navigate = useNavigate();
  const { therapistProfile, loading: profileLoading } = useTherapistAuth();
  const { preferences, loading: preferencesLoading } = useUserPreferences();
  const { profile } = useUserProfile();

  // Security: Only therapists can access this route
  useEffect(() => {
    if (!profileLoading) {
      if (!therapistProfile) {
        console.warn('⚠️ Non-therapist tried to access AI Lessons feature');
        navigate('/home', { replace: true });
      }
    }
  }, [therapistProfile, profileLoading, navigate]);

  // Loading state - wait for both profile and preferences to load
  if (profileLoading || preferencesLoading) {
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
      />
      <Footer />
    </div>
  );
};

export default TherapistAILessons;


import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTherapistAuth } from "../hooks/useTherapistAuth";
import { useUserPreferences } from "../hooks/useUserPreferences";
import ParentHome from "./ParentHome";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info } from "lucide-react";

const TherapistAIDemo = () => {
  const navigate = useNavigate();
  const { therapistProfile, loading: profileLoading } = useTherapistAuth();
  const { preferences, loading: preferencesLoading } = useUserPreferences();

  // Security: Only therapists can access this route
  useEffect(() => {
    if (!profileLoading) {
      if (!therapistProfile) {
        console.warn('⚠️ Non-therapist tried to access Try AI feature');
        navigate('/home', { replace: true });
      }
    }
  }, [therapistProfile, profileLoading, navigate]);

  // Loading state - wait for both profile and preferences to load
  if (profileLoading || preferencesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-700 mb-2">Loading Demo...</h2>
          <p className="text-slate-600">Preparing your AI therapy preview</p>
        </div>
      </div>
    );
  }

  // Get the therapist's use_ai_therapist preference (default to true if not set)
  const therapistUseAiTherapist = preferences?.useAiTherapist !== undefined 
    ? preferences.useAiTherapist 
    : true;

  // Debug logging
  useEffect(() => {
    console.log('[TherapistAIDemo] Preferences loaded:', preferences);
    console.log('[TherapistAIDemo] therapistUseAiTherapist value:', therapistUseAiTherapist);
  }, [preferences, therapistUseAiTherapist]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      {/* Top Banner: Client Preview Mode */}
      <div className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: '#6A727C' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/therapist-dashboard')}
              className="text-white hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-white/30" />
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-white" />
              <span className="font-medium text-white">Client Preview Mode</span>
            </div>
          </div>
          <div className="text-sm text-white opacity-90">
            You're experiencing the AI as your clients would
          </div>
        </div>
      </div>

      {/* Render the AI Therapy Interface */}
      {/* Pass the therapist's use_ai_therapist preference to control the preview behavior */}
      <ParentHome overrideUseAiTherapist={therapistUseAiTherapist} />
    </div>
  );
};

export default TherapistAIDemo;

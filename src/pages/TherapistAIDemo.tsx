import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "../hooks/useUserRole";
import { useTherapistAuth } from "../hooks/useTherapistAuth";
import ParentHome from "./ParentHome";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info } from "lucide-react";

const TherapistAIDemo = () => {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();
  const { therapistProfile, loading: profileLoading } = useTherapistAuth();

  // Security: Only therapists can access this route
  useEffect(() => {
    if (!roleLoading && !profileLoading) {
      if (role !== 'therapist' || !therapistProfile) {
        console.warn('⚠️ Non-therapist tried to access Try AI feature');
        navigate('/home', { replace: true });
      }
    }
  }, [role, therapistProfile, roleLoading, profileLoading, navigate]);

  // Loading state
  if (roleLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-700 mb-2">Loading Demo...</h2>
          <p className="text-slate-600">Preparing your AI therapy preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      {/* Top Banner: Client Preview Mode */}
      <div className="sticky top-0 z-50 bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/therapist-dashboard')}
              className="text-white hover:bg-blue-700 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-white/30" />
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              <span className="font-medium">Client Preview Mode</span>
            </div>
          </div>
          <div className="text-sm opacity-90">
            You're experiencing the AI as your clients would
          </div>
        </div>
      </div>

      {/* Render the AI Therapy Interface */}
      <ParentHome />
    </div>
  );
};

export default TherapistAIDemo;

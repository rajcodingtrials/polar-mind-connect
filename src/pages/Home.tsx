
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserProfile } from "../hooks/useUserProfile";
import { useTherapistAuth } from "../hooks/useTherapistAuth";
import { useUserRole } from "../hooks/useUserRole";
import Header from "../components/Header";

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { therapistProfile, loading: therapistLoading } = useTherapistAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }
    
    // Wait for role and therapist checks to complete
    if (roleLoading || therapistLoading) return;
    
    // If user has therapist role but no profile yet, redirect to complete profile
    if (role === 'therapist' && !therapistProfile) {
      navigate("/therapist-auth", { replace: true });
      return;
    }
    
    // Redirect therapists with profile to their dashboard
    if (therapistProfile) {
      navigate("/therapist-dashboard", { replace: true });
      return;
    }
    
    // Redirect regular users to the OpenAI chat page
    navigate("/openai-chat", { replace: true });
  }, [isAuthenticated, role, roleLoading, therapistProfile, therapistLoading, navigate]);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Loading...</h1>
            <p className="text-gray-600">Please wait while we load your profile.</p>
          </div>
        </main>
      </div>
    );
  }

  // This component will redirect, so we don't need to render anything
  return null;
};

export default Home;

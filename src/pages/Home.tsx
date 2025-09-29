
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserProfile } from "../hooks/useUserProfile";
import { useTherapistAuth } from "../hooks/useTherapistAuth";
import Header from "../components/Header";

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { therapistProfile, loading: therapistLoading } = useTherapistAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }
    
    // Wait for therapist check to complete
    if (therapistLoading) return;
    
    // Redirect therapists to their dashboard
    if (therapistProfile) {
      navigate("/therapist-dashboard", { replace: true });
      return;
    }
    
    // Redirect regular users to the OpenAI chat page
    navigate("/openai-chat", { replace: true });
  }, [isAuthenticated, therapistProfile, therapistLoading, navigate]);

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

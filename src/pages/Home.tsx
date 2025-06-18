
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserProfile } from "../hooks/useUserProfile";
import Header from "../components/Header";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    
    // Redirect authenticated users to the OpenAI chat page
    navigate("/openai-chat");
  }, [isAuthenticated, navigate]);

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

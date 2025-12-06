import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserRole } from "../hooks/useUserRole";
import Header from "../components/Header";
import Footer from "@/components/Footer";
import UserProfileEditor from "@/components/parents/UserProfileEditor";

const MyProfile = () => {
  const { isAuthenticated } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }
    
    // Redirect therapists to their dedicated profile page
    // Treat users with role therapist or therapist_admin as a therapist
    if (!roleLoading && (role === "therapist" || role === "therapist_admin")) {
      navigate("/therapist-my-profile", { replace: true });
    }
  }, [isAuthenticated, role, roleLoading, navigate]);

  // Show loading state while determining role
  if (roleLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4 text-slate-700">Loading...</h1>
            <p className="text-gray-600">Please wait while we load your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  // If therapist, don't render (will redirect)
  // Treat users with role therapist or therapist_admin as a therapist
  if (role === "therapist" || role === "therapist_admin") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <UserProfileEditor />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyProfile;


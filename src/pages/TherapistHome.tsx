import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTherapistAuth } from "../hooks/useTherapistAuth";
import { useUserRole } from "../hooks/useUserRole";
import Header from "../components/Header";
import AffirmationCard from "@/components/AffirmationCard";

const TherapistHome = () => {
  const { isAuthenticated } = useAuth();
  const { therapistProfile, loading: therapistLoading } = useTherapistAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }

    if (roleLoading || therapistLoading) {
      return;
    }

    if (role !== "therapist") {
      navigate("/home", { replace: true });
      return;
    }

    navigate("/therapist-dashboard", { replace: true });
  }, [isAuthenticated, role, roleLoading, therapistLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-2xl text-center space-y-6">
          <AffirmationCard />
          <div>
            <h1 className="text-2xl font-semibold mb-4 text-slate-700">Redirecting...</h1>
            <p className="text-gray-600">
              Taking you to your therapist dashboard. Please wait.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TherapistHome;



import React from "react";
import { useUserRole } from "../hooks/useUserRole";
import ParentHome from "./ParentHome";
import TherapistDashboard from "./TherapistDashboard";
import Header from "../components/Header";

const Home = () => {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4 text-slate-700">Loading...</h1>
          <p className="text-gray-600">Please wait while we load your home experience.</p>
        </div>
      </div>
    );
  }

  if (role === "therapist") {
    return <TherapistDashboard />;
  }

  return <ParentHome />;
};

export default Home;

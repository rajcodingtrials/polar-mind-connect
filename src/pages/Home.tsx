
import React from "react";
import { useUserRole } from "../hooks/useUserRole";
import ParentHome from "./ParentHome";
import TherapistHome from "./TherapistHome";
import Header from "../components/Header";

const Home = () => {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4 text-slate-700">Loading...</h1>
            <p className="text-gray-600">Please wait while we load your home experience.</p>
          </div>
        </main>
      </div>
    );
  }

  if (role === "therapist") {
    return <TherapistHome />;
  }

  return <ParentHome />;
};

export default Home;

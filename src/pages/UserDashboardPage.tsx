import React from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import UserDashboard from "./UserDashboard";

const UserDashboardPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get('userId');
  
  // Use userId from URL param if provided (for therapists viewing parent dashboards),
  // otherwise use the authenticated user's ID (for parents viewing their own dashboard)
  const userId = userIdParam || user?.id || '';

  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4 text-slate-700">Loading...</h1>
            <p className="text-gray-600">Please wait while we load your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return <UserDashboard userId={userId} />;
};

export default UserDashboardPage;


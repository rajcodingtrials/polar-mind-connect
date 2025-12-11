import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserRole } from "../hooks/useUserRole";

const DashboardRedirect = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { isTherapist, isParent, loading: roleLoading } = useUserRole();

  useEffect(() => {
    // Wait for auth and role to load
    if (authLoading || roleLoading) {
      return;
    }

    // If not authenticated, redirect to home
    if (!isAuthenticated) {
      navigate("/home", { replace: true });
      return;
    }

    // Redirect based on role
    if (isTherapist()) {
      navigate("/home", { replace: true });
    } else if (isParent()) {
      // Include user ID in the redirect URL for parents
      if (user?.id) {
        navigate(`/user-dashboard?userId=${user.id}`, { replace: true });
      } else {
        navigate("/user-dashboard", { replace: true });
      }
    } else {
      // Default fallback for other roles or no role
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, authLoading, roleLoading, isTherapist, isParent, user?.id, navigate]);

  // Show loading state while determining redirect
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4 text-slate-700">Loading...</h1>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardRedirect;


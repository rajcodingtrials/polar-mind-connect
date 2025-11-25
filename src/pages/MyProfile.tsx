import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserRole } from "../hooks/useUserRole";
import Header from "../components/Header";
import Footer from "@/components/Footer";
import UserProfileEditor from "@/components/parents/UserProfileEditor";
import UserPayment from "@/components/parents/UserPayment";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

const MyProfile = () => {
  const { isAuthenticated } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }
    
    // Redirect therapists to their dedicated profile page
    if (!roleLoading && role === "therapist") {
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
  if (role === "therapist") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <UserProfileEditor />
          <div className="pt-4">
            <Button
              onClick={() => setIsPaymentOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Make Payment (Beta)
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <UserPayment
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        fixedAmount={50}
        description="Therapy Session Payment"
      />
    </div>
  );
};

export default MyProfile;


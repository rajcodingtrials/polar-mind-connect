import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTherapistAuth } from "../hooks/useTherapistAuth";
import { useUserRole } from "../hooks/useUserRole";
import Header from "../components/Header";
import AffirmationCard from "@/components/AffirmationCard";
import TherapistDashboard from "./TherapistDashboard";

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
    // If therapist, do not redirect; show the dashboard below
  }, [isAuthenticated, role, roleLoading, therapistLoading, navigate]);

  return <TherapistDashboard />;
};

export default TherapistHome;


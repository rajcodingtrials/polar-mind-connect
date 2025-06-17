
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import AuthForm from "../components/AuthForm";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col gradient-bg stars-bg">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-start px-4 pt-2">
        <div className="text-center mb-4">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Polariz
            </h1>
            <p className="text-xl md:text-2xl text-white mb-6 max-w-2xl">
              AI speech therapists shaping the future one word at a time.
            </p>
          </div>
        </div>

        <AuthForm />
      </main>
    </div>
  );
};

export default Index;

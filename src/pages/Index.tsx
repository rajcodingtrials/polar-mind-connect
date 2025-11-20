
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
    <div className="h-screen flex flex-col gradient-bg stars-bg">
      <Header />

      {/* main fills all remaining vertical space */}
      <main className="flex-grow h-full flex items-stretch justify-stretch min-h-0 w-full">
        <div className="flex flex-row w-full h-full bg-white flex-grow">

          {/* Left: AuthForm (30%) */}
          <div className="w-full md:w-[30%] flex items-center justify-center p-8 bg-gray-50 min-h-[400px]">
            <AuthForm />
          </div>

          {/* Right: Image with overlayed text (70%) */}
          <div className="relative w-0 md:w-[70%] flex-grow flex items-center justify-center p-0 bg-black min-h-[400px]">
            <img
              src="/lovable-uploads/frontpage1.png"
              alt="Banner image"
              className="w-full h-full object-cover object-center absolute inset-0 z-0"
            />
            <div className="absolute inset-0 bg-black/20 z-10"></div>
            <div className="relative z-20 w-full flex flex-col items-end justify-center px-8 py-12 text-right md:pr-24 lg:pr-32">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-wide mb-20 whitespace-pre-line">
                Shaping future one<br />word at a time
              </h2>
              <p className="text-sm md:text-base text-white leading-loose tracking-wide max-w-lg whitespace-pre-line">
                AI speech therapists that turn home into<br />learning hubs and parents into expert teachers
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Index;

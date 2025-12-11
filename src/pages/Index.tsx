
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import AuthForm from "../components/AuthForm";
import { SEO } from "../components/SEO";
import { getOrganizationSchema, getWebSiteSchema, getServiceSchema } from "../utils/structuredData";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const structuredData = [
    getOrganizationSchema(),
    getWebSiteSchema(),
    getServiceSchema()
  ];

  return (
    <>
      <SEO
        title="Polariz - AI-Powered Speech Therapy for Children | Transform Your Home into a Learning Hub"
        description="Transform your home into a learning hub with AI speech therapists. Personalized speech therapy sessions designed for children with special needs. 24/7 access to affordable, expert-level care."
        image="/lovable-uploads/FrontPage1.jpg"
        url="https://polariz.ai/"
        structuredData={structuredData}
      />
      <div className="min-h-screen flex flex-col gradient-bg stars-bg">
        <Header />

        {/* main fills all remaining vertical space */}
        <main className="flex-grow w-full overflow-x-hidden">
          <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-4rem)] bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">

            {/* Left: AuthForm */}
            <section className="w-full lg:w-[40%] xl:w-[35%] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 py-8 sm:py-10 md:py-12 lg:py-0">
              <AuthForm />
            </section>

            {/* Right: Image with overlayed text - Hidden on mobile, shown on tablet and up */}
            <section className="hidden md:block relative w-full lg:w-[60%] xl:w-[65%] flex-grow flex items-center justify-center bg-black">
              <img
                src="/lovable-uploads/FrontPage1.jpg"
                alt="Young girl with colorful alphabet letters emerging from her speech, representing AI-powered speech therapy for children"
                className="w-full h-full object-cover object-center absolute inset-0 z-0"
                loading="eager"
              />
              <div className="absolute inset-0 bg-black/20 z-10" aria-hidden="true"></div>
              <div className="relative z-20 w-full flex flex-col items-center lg:items-end justify-center px-6 md:px-8 lg:px-12 xl:px-16 py-12 md:py-16 lg:py-20 text-center lg:text-right">
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-wide mb-6 md:mb-8 lg:mb-12 whitespace-pre-line">
                  Shaping future one<br />word at a time
                </h1>
                <p className="text-sm md:text-base lg:text-lg text-white leading-relaxed tracking-wide max-w-lg whitespace-pre-line">
                  AI speech therapists that turn home into<br />learning hubs and parents into expert teachers
                </p>
              </div>
            </section>

          </div>
        </main>
      </div>
    </>
  );
};

export default Index;

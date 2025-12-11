
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { SEO } from "../components/SEO";

const OurStory = () => {
  return (
    <>
      <SEO
        title="Our Story - Polariz | Revolutionizing Speech Therapy with AI"
        description="Learn how Polariz is transforming speech therapy for children with special needs. Discover our mission to break down barriers to treatment and provide 24/7 access to affordable, personalized AI-powered therapy."
        image="/lovable-uploads/FrontPage1.jpg"
        url="https://polariz.ai/our-story"
      />
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <Header />
        
        <main className="flex-1 flex w-full min-h-0 overflow-x-hidden">
          <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-4rem)] bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
            
            {/* Left: Content Section */}
            <section className="w-full lg:w-[40%] xl:w-[45%] flex flex-col p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 py-8 sm:py-10 md:py-12 lg:py-0">
              <article className="max-w-2xl w-full flex flex-col h-full">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 flex-shrink-0">Our Story</h1>
                
                <div className="bg-white bg-opacity-90 rounded-lg p-4 sm:p-6 shadow-md flex-1 flex flex-col overflow-y-auto min-h-0">
        
                  <section className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">Rising Rates of Autism and Speech Delays</h2>
                    <p className="text-sm sm:text-base leading-relaxed"> In recent years, developmental disorders such as Autism Spectrum Disorder (ASD) and speech delays have become increasingly prevalent 
                          among children worldwide. More families are facing the challenges of early diagnosis and long-term support, as conditions like autism 
                          often require continuous, specialized intervention. This rising incidence underscores the urgent need for scalable mental health and 
                          developmental support services tailored specifically to these growing concerns.
                    </p>
                  </section>

                  <section className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">Barriers to Accessing Treatment</h2>
                    <p className="text-sm sm:text-base leading-relaxed">
                      However, accessing timely and effective treatment remains a significant hurdle for many families. Long waitlists for specialists, 
            high costs of therapy sessions, and a general shortage of trained professionals make it difficult for children with special needs to 
            get the care they require when they need it most. These delays not only affect a child's developmental progress but also place immense 
            emotional and financial stress on parents and caregivers who are desperate for support.
                    </p>
                  </section>

                  <section className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">How Polariz is Changing the Game?</h2>
                    <p className="text-sm sm:text-base leading-relaxed">
                      Polariz aims to transform this landscape by offering 24/7 access to AI-powered agents that provide affordable, personalized support for 
            children with special needs. Designed with input from developmental experts, these AI companions can engage children in therapeutic 
            activities, track progress, and adapt to individual learning styles. By breaking down barriers to access and delivering consistent, 
            intelligent care, Polariz empowers families to support their children anytime, anywhere.
                    </p>
                  </section>
                </div>
              </article>
            </section>

            {/* Right: Image Section - Hidden on mobile, shown on tablet and up */}
            <section className="hidden md:block relative w-full lg:w-[60%] xl:w-[55%] min-h-[300px] sm:min-h-[400px] lg:min-h-0 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
              <img
                src="/lovable-uploads/FrontPage2.jpg"
                alt="Child reading a book with speech bubbles showing 'SPEECH' and 'COACHING', representing speech therapy and learning support"
                className="w-full h-full object-contain object-center"
                loading="lazy"
              />
            </section>

          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default OurStory;

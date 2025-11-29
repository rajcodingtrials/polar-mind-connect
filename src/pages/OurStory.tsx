
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
        
        <main className="flex-1 flex w-full min-h-0">
          <div className="flex flex-col md:flex-row w-full h-full bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 md:items-stretch">
            
            {/* Left: Content Section (35-40%) */}
            <section className="w-full md:w-[35%] lg:w-[40%] flex flex-col p-4 sm:p-6 md:p-8 lg:p-12 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 min-h-[400px] md:min-h-0 md:self-stretch">
              <article className="max-w-2xl w-full flex flex-col h-full">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 flex-shrink-0">Our Story</h1>
                
                <div className="bg-white bg-opacity-90 rounded-lg p-6 shadow-md flex-1 flex flex-col overflow-y-auto min-h-0">
        
                  <section className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">Rising Rates of Autism and Speech Delays</h2>
                    <p> In recent years, developmental disorders such as Autism Spectrum Disorder (ASD) and speech delays have become increasingly prevalent 
                          among children worldwide. More families are facing the challenges of early diagnosis and long-term support, as conditions like autism 
                          often require continuous, specialized intervention. This rising incidence underscores the urgent need for scalable mental health and 
                          developmental support services tailored specifically to these growing concerns.
                    </p>
                  </section>

                  <section className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">Barriers to Accessing Treatment</h2>
                    <p>
                      However, accessing timely and effective treatment remains a significant hurdle for many families. Long waitlists for specialists, 
            high costs of therapy sessions, and a general shortage of trained professionals make it difficult for children with special needs to 
            get the care they require when they need it most. These delays not only affect a child's developmental progress but also place immense 
            emotional and financial stress on parents and caregivers who are desperate for support.
                    </p>
                  </section>

                  <section className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">How Polariz is Changing the Game?</h2>
                    <p>
                      Polariz aims to transform this landscape by offering 24/7 access to AI-powered agents that provide affordable, personalized support for 
            children with special needs. Designed with input from developmental experts, these AI companions can engage children in therapeutic 
            activities, track progress, and adapt to individual learning styles. By breaking down barriers to access and delivering consistent, 
            intelligent care, Polariz empowers families to support their children anytime, anywhere.
                    </p>
                  </section>
                </div>
              </article>
            </section>

            {/* Right: Image Section (65-60%) */}
            <section className="relative w-full md:w-[65%] lg:w-[60%] min-h-[300px] sm:min-h-[400px] md:min-h-0 md:self-stretch bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
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

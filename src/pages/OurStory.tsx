
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const OurStory = () => {
  return (
    <div className="min-h-screen flex flex-col gradient-bg stars-bg">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-start px-4 py-8">
        <div className="max-w-3xl w-full mx-auto">
          <h1 className="text-3xl font-bold mb-6">Our Story</h1>
          
          <div className="bg-white bg-opacity-90 rounded-lg p-6 shadow-md">
  
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Rising Rates of Autism and Speech Delays</h2>
              <p> In recent years, developmental disorders such as Autism Spectrum Disorder (ASD) and speech delays have become increasingly prevalent 
                    among children worldwide. More families are facing the challenges of early diagnosis and long-term support, as conditions like autism 
                    often require continuous, specialized intervention. This rising incidence underscores the urgent need for scalable mental health and 
                    developmental support services tailored specifically to these growing concerns.
              </p>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Barriers to Accessing Treatment</h2>
              <p>
                However, accessing timely and effective treatment remains a significant hurdle for many families. Long waitlists for specialists, 
      high costs of therapy sessions, and a general shortage of trained professionals make it difficult for children with special needs to 
      get the care they require when they need it most. These delays not only affect a child’s developmental progress but also place immense 
      emotional and financial stress on parents and caregivers who are desperate for support.
              </p>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">How Polariz is Changing the Game?</h2>
              <p>
                Polariz aims to transform this landscape by offering 24/7 access to AI-powered agents that provide affordable, personalized support for 
      children with special needs. Designed with input from developmental experts, these AI companions can engage children in therapeutic 
      activities, track progress, and adapt to individual learning styles. By breaking down barriers to access and delivering consistent, 
      intelligent care, Polariz empowers families to support their children anytime, anywhere.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OurStory;

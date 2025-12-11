
import React from "react";
import Navigation from "@/components/Navigation";
import { SEO } from "../components/SEO";
import Footer from "../components/Footer";

const About = () => {
  return (
    <>
      <SEO
        title="About Us - Polariz | AI-Powered Speech Therapy Platform"
        description="Learn about Polariz, an innovative AI-powered speech therapy platform designed to make therapy accessible, affordable, and effective for children with special needs. Discover our mission and values."
        image="/lovable-uploads/FrontPage1.jpg"
        url="https://polariz.ai/about"
      />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">About Us</h1>
            <p className="text-base sm:text-lg text-gray-600 px-2">
              Learn more about our AI therapy platform...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default About;

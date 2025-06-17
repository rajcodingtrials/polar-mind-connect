
import React from "react";
import Navigation from "@/components/Navigation";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">About Us</h1>
          <p className="text-lg text-gray-600">
            Learn more about our AI therapy platform...
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;

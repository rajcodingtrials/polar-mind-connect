
import React from "react";
import Navigation from "@/components/Navigation";

const Resources = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Resources</h1>
          <p className="text-lg text-gray-600">
            Helpful resources will be available here...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Resources;

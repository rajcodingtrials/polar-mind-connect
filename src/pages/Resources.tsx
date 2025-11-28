
import React from "react";
import Navigation from "@/components/Navigation";
import { SEO } from "../components/SEO";
import Footer from "../components/Footer";

const Resources = () => {
  return (
    <>
      <SEO
        title="Resources - Polariz | Speech Therapy Resources and Guides"
        description="Access helpful resources, guides, and information about speech therapy, child development, and supporting children with special needs. Educational content for parents and caregivers."
        image="/lovable-uploads/FrontPage1.jpg"
        url="https://polariz.ai/resources"
      />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Resources</h1>
            <p className="text-lg text-gray-600">
              Helpful resources will be available here...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Resources;

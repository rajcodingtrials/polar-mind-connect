
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "../components/SEO";
import { getPersonSchema } from "../utils/structuredData";

const MeetTheTeam = () => {
  const structuredData = [
    getPersonSchema("Pree Nair", "Co-Founder & Builder", "/lovable-uploads/PreePic.jpg", "https://www.linkedin.com/in/preenair/"),
    getPersonSchema("Jay Pillai", "CTO & AI Specialist", "/lovable-uploads/JayPic.jpg", "https://www.linkedin.com/in/kjaypillai/")
  ];

  return (
    <>
      <SEO
        title="Meet the Team - Polariz | Founders and Leadership"
        description="Meet the passionate team behind Polariz. Learn about our founders Pree Nair and Jay Pillai, who bring decades of experience in AI, technology, and speech therapy to revolutionize children's learning."
        image="/lovable-uploads/PreePic.jpg"
        url="https://polariz.ai/meet-the-team"
        structuredData={structuredData}
      />
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <Header />
        
        <main className="flex-grow px-4 py-8 max-w-6xl mx-auto w-full">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">Meet the Team</h1>
          
          {/* First row - Pree */}
          <section className="grid md:grid-cols-2 gap-8 mb-16 items-stretch">
            <Card className="bg-white bg-opacity-90 shadow-md overflow-hidden h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-bold mb-4">
                  <a href="https://www.linkedin.com/in/preenair/" className="text-blue-600 hover:underline" rel="noopener noreferrer">Pree Nair</a>
                </h2>
                <h3 className="text-lg font-medium text-primary mb-2">Co-Founder & Builder</h3>
                <p className="mb-4">
                  Pree Nair brings over 10 years of experience in software development, technology, speech therapy and childhood development. 
                  With a passion for making speech therapy accessible to everyone, Pree founded Polariz 
                  to leverage AI technology in creating personalized learning experiences for children with special needs.
                </p>
                <p>
                  Pree holds a Master's degree in Computer Science from Texas A&M University. Pree has also developed cutting edge server side applications 
                  at different domains like medical and finance. Her passion for building technology to server medical professionals and patients started while she was a software engineer at Kaiser Permanente.
                </p>
              </CardContent>
            </Card>
            
            <div className="flex items-stretch h-full">
              <img 
                src="/lovable-uploads/PreePic.jpg" 
                alt="Pree Nair, Founder of Polariz, a professional woman with expertise in software development and speech therapy" 
                className="rounded-lg shadow-lg w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </section>
          
          {/* Second row - Jay */}
          <section className="grid md:grid-cols-2 gap-8 items-stretch">
            <div className="flex items-stretch h-full order-2 md:order-1">
              <img 
                src="/lovable-uploads/JayPic.jpg" 
                alt="Jay Pillai, CTO and AI Specialist at Polariz, an expert in artificial intelligence and machine learning" 
                className="rounded-lg shadow-lg w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            
            <Card className="bg-white bg-opacity-90 shadow-md overflow-hidden order-1 md:order-2 h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-bold mb-4">
                  <a href="https://www.linkedin.com/in/kjaypillai/" className="text-blue-600 hover:underline" rel="noopener noreferrer">Jay Pillai</a>
                </h2>
                <h3 className="text-lg font-medium text-primary mb-2">CTO & AI Expert</h3>
                <p className="mb-4">
                  Jay Pillai is a hands on and technical engineering leader, passionate about solving
                  mission critical problems using artificial intelligence. As the Director for AI and Engineering at Figma, Jay built cutting edge 
                  AI features for designers and developers. Previously at Apple, Jay's teams drove billions of revenue through AI features in Apple hardware like iPhone, iPad and iWatch,
                  and Apple apps like Camera, Photos, iMessage and Maps. Previously, at Google DeepMind and Google Research, Jay trained large AI/ML models for server side applications and
                  latency sensitive models for on-device usecases. 
                </p>
                
                <p> Previously, Jay completed my Ph.D. from University of Maryland, College Park, working with Prof Rama Chellappa. Jay's research focused 
                  on developing robust algorithms for object classification, detection and human recognition. Jay has published research papers in numerous 
                  peer reviewed conferences and journals in AI/ML including CVPR and PAMI.
                </p>
              </CardContent>
            </Card>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default MeetTheTeam;


import React from "react";
import Header from "../components/Header";
import { Card, CardContent } from "@/components/ui/card";

const MeetTheTeam = () => {
  return (
    <div className="min-h-screen flex flex-col gradient-bg stars-bg">
      <Header />
      
      <main className="flex-grow px-4 py-8 max-w-6xl mx-auto w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">Meet the Team</h1>
        
        {/* First row - Pree */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-white bg-opacity-90 shadow-md overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                <a href="https://www.linkedin.com/in/preenair/" className="text-blue-600 hover:underline">Pree Nair</a>
              </h2>
              <h3 className="text-lg font-medium text-primary mb-2">Founder</h3>
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
          
          <div className="flex items-center justify-center h-full">
            <img 
              src="/lovable-uploads/PreeProfile.png" 
              alt="Pree Nair" 
              className="rounded-lg shadow-lg w-full max-w-md h-auto object-cover"
            />
          </div>
        </div>
        
        {/* Second row - Jay */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex items-center justify-center h-full order-2 md:order-1">
            <img 
              src="/lovable-uploads/JayProfile.png" 
              alt="Jay" 
              className="rounded-lg shadow-lg w-full max-w-md h-auto object-cover"
            />
          </div>
          
          <Card className="bg-white bg-opacity-90 shadow-md overflow-hidden order-1 md:order-2">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                <a href="https://www.linkedin.com/in/kjaypillai/" className="text-blue-600 hover:underline">Jay Pillai</a>
              </h2>
              <h3 className="text-lg font-medium text-primary mb-2">CTO & AI Specialist</h3>
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
        </div>
      </main>
    </div>
  );
};

export default MeetTheTeam;

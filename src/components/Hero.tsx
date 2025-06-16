
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Shield, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-therapy-50/30 via-transparent to-calm-100/30" />
      <div className="absolute top-20 right-10 w-64 h-64 bg-therapy-200/20 rounded-full blur-3xl animate-pulse-gentle" />
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-calm-300/20 rounded-full blur-2xl animate-pulse-gentle" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm bg-therapy-100 text-therapy-700 border-therapy-300">
            <Shield className="w-4 h-4 mr-2" />
            HIPAA Compliant & Confidential
          </Badge>
          
          {/* Main Headline */}
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-calm-900 leading-tight animate-fade-in">
            Compassionate{" "}
            <span className="text-gradient">AI Therapy</span>{" "}
            Support
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl lg:text-2xl text-calm-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Access professional-grade mental health support anytime, anywhere. 
            Our AI therapist provides empathetic, evidence-based conversations to help you thrive.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button asChild size="lg" className="bg-gradient-therapy hover:opacity-90 text-lg px-8 py-6">
              <Link to="/chat">
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Free Session
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-therapy-300 text-therapy-700 hover:bg-therapy-50">
              <Link to="/resources">
                <Heart className="w-5 h-5 mr-2" />
                Explore Resources
              </Link>
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-calm-500 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              Available 24/7
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              100% Confidential
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              Evidence-Based
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              No Waiting Lists
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

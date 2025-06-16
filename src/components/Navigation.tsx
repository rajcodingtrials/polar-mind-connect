
import { Button } from "@/components/ui/button";
import { MessageCircle, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-therapy-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-therapy rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient font-playfair">
              Polariz.therapy.ai
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-calm-700 hover:text-therapy-600 transition-colors">
              Home
            </Link>
            <Link to="/chat" className="text-calm-700 hover:text-therapy-600 transition-colors">
              Chat
            </Link>
            <Link to="/resources" className="text-calm-700 hover:text-therapy-600 transition-colors">
              Resources
            </Link>
            <Link to="/about" className="text-calm-700 hover:text-therapy-600 transition-colors">
              About
            </Link>
            <Button asChild className="bg-gradient-therapy hover:opacity-90">
              <Link to="/chat">Start Session</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isMenuOpen ? "max-h-64 pb-4" : "max-h-0"
        )}>
          <div className="flex flex-col space-y-4 pt-4 border-t border-therapy-200">
            <Link 
              to="/" 
              className="text-calm-700 hover:text-therapy-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/chat" 
              className="text-calm-700 hover:text-therapy-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Chat
            </Link>
            <Link 
              to="/resources" 
              className="text-calm-700 hover:text-therapy-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Resources
            </Link>
            <Link 
              to="/about" 
              className="text-calm-700 hover:text-therapy-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Button asChild className="bg-gradient-therapy hover:opacity-90 w-full">
              <Link to="/chat" onClick={() => setIsMenuOpen(false)}>Start Session</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

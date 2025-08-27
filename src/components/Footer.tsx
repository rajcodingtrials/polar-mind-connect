import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-r from-black via-gray-900 to-black border-t border-primary/20 mt-auto overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand section */}
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <img 
                src="/lovable-uploads/polariz_icon_only_white.png" 
                alt="Polariz Logo" 
                className="h-6 w-auto transition-transform duration-300 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-white tracking-wide">Polariz</span>
              <span className="text-xs text-white/60">© 2024 All rights reserved</span>
            </div>
          </div>
          
          {/* Navigation section */}
          <nav className="flex items-center gap-8">
            <Link 
              to="/our-story" 
              className="relative text-sm font-medium text-white/90 hover:text-white transition-all duration-300 group"
            >
              <span className="relative z-10">Our Story</span>
              <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
            <Link 
              to="/meet-the-team" 
              className="relative text-sm font-medium text-white/90 hover:text-white transition-all duration-300 group"
            >
              <span className="relative z-10">Meet the Team</span>
              <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          </nav>
        </div>
        
        {/* Bottom accent line */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex justify-center">
            <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
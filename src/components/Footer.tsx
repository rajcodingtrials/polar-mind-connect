import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background/80 backdrop-blur-sm border-t border-border/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/lovable-uploads/polariz_icon_only_white.png" alt="Polariz Logo" className="h-5 w-auto" />
            <span className="text-sm text-muted-foreground">© 2024 Polariz. All rights reserved.</span>
          </div>
          
          <nav className="flex items-center gap-6">
            <Link 
              to="/our-story" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Our Story
            </Link>
            <Link 
              to="/meet-the-team" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Meet the Team
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
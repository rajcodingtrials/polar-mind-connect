import React from "react";
import { Link } from "react-router-dom";

const FooterEnhanced = () => {
  return (
    <footer className="bg-gradient-to-r from-background via-background/95 to-background border-t border-border/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Enhanced Brand Section */}
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <img 
                src="/lovable-uploads/polariz_icon_only_white.png" 
                alt="Polariz Logo" 
                className="h-8 w-auto transition-transform duration-300 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-foreground">Polariz</span>
              <span className="text-xs text-muted-foreground">© 2024 All rights reserved</span>
            </div>
          </div>
          
          {/* Enhanced Navigation */}
          <nav className="flex items-center gap-8">
            <Link 
              to="/our-story" 
              className="relative text-sm font-medium text-foreground hover:text-primary transition-all duration-300 group story-link"
            >
              <span className="relative z-10">Our Story</span>
              <div className="absolute inset-0 bg-primary/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 -m-2"></div>
            </Link>
            <Link 
              to="/meet-the-team" 
              className="relative text-sm font-medium text-foreground hover:text-primary transition-all duration-300 group story-link"
            >
              <span className="relative z-10">Meet the Team</span>
              <div className="absolute inset-0 bg-primary/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 -m-2"></div>
            </Link>
          </nav>
        </div>
        
        {/* Enhanced Separator with gradient */}
        <div className="mt-6 pt-6 border-t border-gradient-to-r from-transparent via-border to-transparent">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Made with ❤️ for better communication</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Empowering Speech
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterEnhanced;
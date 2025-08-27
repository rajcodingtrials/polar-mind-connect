import React from "react";
import { Link } from "react-router-dom";

const FooterFloating = () => {
  return (
    <>
      {/* Minimal Footer */}
      <footer className="bg-background border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/lovable-uploads/polariz_icon_only_white.png" alt="Polariz Logo" className="h-6 w-auto" />
              <span className="text-sm text-muted-foreground">© 2024 Polariz. All rights reserved.</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Made with ❤️ for better communication
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Navigation */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-2xl shadow-lg p-4">
          <nav className="flex flex-col gap-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Explore
            </div>
            <Link 
              to="/our-story" 
              className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200 story-link group"
            >
              <div className="w-2 h-2 bg-primary/60 rounded-full group-hover:bg-primary transition-colors"></div>
              Our Story
            </Link>
            <Link 
              to="/meet-the-team" 
              className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200 story-link group"
            >
              <div className="w-2 h-2 bg-primary/60 rounded-full group-hover:bg-primary transition-colors"></div>
              Meet the Team
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default FooterFloating;
import React from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

const FooterCardStyle = () => {
  return (
    <footer className="bg-background/80 backdrop-blur-sm border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Card */}
          <Card className="p-6 bg-card/50 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <img src="/lovable-uploads/polariz_icon_only_white.png" alt="Polariz Logo" className="h-8 w-auto" />
              <span className="text-xl font-semibold text-foreground">Polariz</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Empowering communication through innovative speech therapy solutions.
            </p>
          </Card>

          {/* Navigation Card */}
          <Card className="p-6 bg-card/50 border-border/50">
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <nav className="space-y-3">
              <Link 
                to="/our-story" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors story-link"
              >
                Our Story
              </Link>
              <Link 
                to="/meet-the-team" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors story-link"
              >
                Meet the Team
              </Link>
            </nav>
          </Card>

          {/* Contact Card */}
          <Card className="p-6 bg-card/50 border-border/50">
            <h3 className="font-semibold text-foreground mb-4">Connect</h3>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Follow our journey</p>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs text-primary">✉</span>
                </div>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs text-primary">📱</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-border/50 text-center">
          <span className="text-sm text-muted-foreground">© 2024 Polariz. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default FooterCardStyle;
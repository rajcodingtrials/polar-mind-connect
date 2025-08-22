import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle, Users, ArrowRight, Clock } from "lucide-react";

interface TherapistHeroProps {
  therapistCount?: number;
  onBrowseTherapists?: () => void;
}

const TherapistHero = ({ therapistCount = 150, onBrowseTherapists }: TherapistHeroProps) => {

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 stars-bg opacity-40"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-background/20"></div>
      
      {/* Content */}
      <div className="relative container mx-auto px-4 py-16 lg:py-20">
        <div className="max-w-6xl mx-auto text-center space-y-10">
          {/* Hero Heading */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-emphasis-high leading-tight tracking-tight">
              Find Your Perfect
              <span className="block text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text mt-2">
                Speech Therapist
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-emphasis-medium max-w-4xl mx-auto leading-relaxed font-medium">
              Connect with verified, licensed speech therapists for personalized therapy sessions. 
              Start your journey to better communication today.
            </p>
          </div>

          {/* Call to Action */}
          <div className="flex items-center justify-center animate-fade-in pt-4">
            <Button 
              size="lg" 
              className="text-base px-10 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
              onClick={onBrowseTherapists}
            >
              Browse Therapists
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </div>

          {/* Enhanced Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6 pt-6">
            <div className="flex items-center gap-3 bg-surface-elevated/80 backdrop-blur-sm px-5 py-3 rounded-full border border-border/30 shadow-sm hover:bg-surface-elevated/90 transition-colors duration-200">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm font-medium text-emphasis-high">Verified Therapists</span>
            </div>
            <div className="flex items-center gap-3 bg-surface-elevated/80 backdrop-blur-sm px-5 py-3 rounded-full border border-border/30 shadow-sm hover:bg-surface-elevated/90 transition-colors duration-200">
              <Users className="h-5 w-5 text-info" />
              <span className="text-sm font-medium text-emphasis-high">{therapistCount}+ Professionals</span>
            </div>
            <div className="flex items-center gap-3 bg-surface-elevated/80 backdrop-blur-sm px-5 py-3 rounded-full border border-border/30 shadow-sm hover:bg-surface-elevated/90 transition-colors duration-200">
              <Star className="h-5 w-5 text-warning fill-warning" />
              <span className="text-sm font-medium text-emphasis-high">4.9 Average Rating</span>
            </div>
            <div className="flex items-center gap-3 bg-surface-elevated/80 backdrop-blur-sm px-5 py-3 rounded-full border border-border/30 shadow-sm hover:bg-surface-elevated/90 transition-colors duration-200">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-emphasis-high">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistHero;
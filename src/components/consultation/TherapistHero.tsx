import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle, Users, ArrowRight } from "lucide-react";

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
      <div className="relative container mx-auto px-4 py-32 lg:py-40">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          {/* Hero Heading */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-emphasis-high leading-tight tracking-tight">
              Find Your Perfect
              <span className="block text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text">
                Speech Therapist
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-emphasis-medium max-w-3xl mx-auto leading-relaxed font-medium">
              Connect with verified, licensed speech therapists for personalized therapy sessions. 
              Start your journey to better communication today.
            </p>
          </div>

          {/* Call to Action */}
          <div className="flex items-center justify-center animate-fade-in">
            <Button 
              size="lg" 
              className="text-base px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={onBrowseTherapists}
            >
              Browse Therapists
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Enhanced Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-8">
            <div className="flex items-center gap-3 bg-surface-elevated/80 backdrop-blur-sm px-4 py-3 rounded-full border border-border/30 shadow-sm">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm font-medium text-emphasis-high">Verified Therapists</span>
            </div>
            <div className="flex items-center gap-3 bg-surface-elevated/80 backdrop-blur-sm px-4 py-3 rounded-full border border-border/30 shadow-sm">
              <Users className="h-5 w-5 text-info" />
              <span className="text-sm font-medium text-emphasis-high">{therapistCount}+ Professionals</span>
            </div>
            <div className="flex items-center gap-3 bg-surface-elevated/80 backdrop-blur-sm px-4 py-3 rounded-full border border-border/30 shadow-sm">
              <Star className="h-5 w-5 text-warning fill-warning" />
              <span className="text-sm font-medium text-emphasis-high">4.9 Average Rating</span>
            </div>
          </div>

          {/* Enhanced Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-12">
            <div className="text-center space-y-3 p-6 rounded-2xl bg-surface-elevated/50 backdrop-blur-sm border border-border/20 hover:bg-surface-elevated/70 transition-all duration-300">
              <div className="text-4xl lg:text-5xl font-bold text-emphasis-high">{therapistCount}+</div>
              <div className="text-sm font-medium text-emphasis-medium uppercase tracking-wider">Verified Therapists</div>
            </div>
            <div className="text-center space-y-3 p-6 rounded-2xl bg-surface-elevated/50 backdrop-blur-sm border border-border/20 hover:bg-surface-elevated/70 transition-all duration-300">
              <div className="text-4xl lg:text-5xl font-bold text-emphasis-high">1,000+</div>
              <div className="text-sm font-medium text-emphasis-medium uppercase tracking-wider">Happy Clients</div>
            </div>
            <div className="text-center space-y-3 p-6 rounded-2xl bg-surface-elevated/50 backdrop-blur-sm border border-border/20 hover:bg-surface-elevated/70 transition-all duration-300">
              <div className="text-4xl lg:text-5xl font-bold text-emphasis-high">24/7</div>
              <div className="text-sm font-medium text-emphasis-medium uppercase tracking-wider">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistHero;
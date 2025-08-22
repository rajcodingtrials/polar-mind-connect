import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, Users } from "lucide-react";

interface TherapistHeroProps {
  therapistCount?: number;
}

const TherapistHero = ({ therapistCount = 150 }: TherapistHeroProps) => {

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5">
      {/* Background Pattern */}
      <div className="absolute inset-0 stars-bg opacity-30"></div>
      
      {/* Content */}
      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Find Your Perfect
              <span className="block text-transparent bg-gradient-to-r from-primary to-primary/80 bg-clip-text">
                Speech Therapist
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connect with verified, licensed speech therapists for personalized therapy sessions. 
              Start your journey to better communication today.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Verified Therapists</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>{therapistCount}+ Professionals</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span>4.9 Average Rating</span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto pt-8">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-foreground">{therapistCount}+</div>
              <div className="text-sm text-muted-foreground">Verified Therapists</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-foreground">1,000+</div>
              <div className="text-sm text-muted-foreground">Happy Clients</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-foreground">24/7</div>
              <div className="text-sm text-muted-foreground">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistHero;
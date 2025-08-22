import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, Users } from "lucide-react";

interface TherapistHeroProps {
  therapistCount?: number;
}

const TherapistHero = ({ therapistCount = 150 }: TherapistHeroProps) => {

  return (
    <div className="relative overflow-hidden gradient-bg stars-bg">
      {/* Content */}
      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Find Your Perfect
              <span className="block text-white">
                Speech Therapist
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Connect with verified, licensed speech therapists for personalized therapy sessions. 
              Start your journey to better communication today.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-8 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-white" />
              <span>Verified Therapists</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-white" />
              <span>{therapistCount}+ Professionals</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span>4.9 Average Rating</span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto pt-8">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-white">{therapistCount}+</div>
              <div className="text-sm text-white/70">Verified Therapists</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-white">1,000+</div>
              <div className="text-sm text-white/70">Happy Clients</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-sm text-white/70">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistHero;
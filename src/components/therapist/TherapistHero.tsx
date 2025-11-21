import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
          </div>

          {/* White Rectangle Section */}
          <Card className="bg-white border-slate-200 shadow-sm animate-fade-in">
            <CardContent className="p-6 lg:p-8">
              <div className="space-y-6">
                {/* Description Text */}
                <p className="text-lg sm:text-xl lg:text-2xl text-slate-700 max-w-4xl mx-auto leading-relaxed font-medium text-center">
                  Connect with verified, licensed speech therapists for personalized therapy sessions. 
                  Start your journey to better communication today.
                </p>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6">
                  <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-full border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors duration-200">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-slate-700">Verified Therapists</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-full border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors duration-200">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">{therapistCount}+ Professionals</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-full border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors duration-200">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium text-slate-700">4.9 Average Rating</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-full border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors duration-200">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">24/7 Support</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
        </div>
      </div>
    </div>
  );
};

export default TherapistHero;
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Star, CheckCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface TherapistHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  therapistCount?: number;
}

const TherapistHero = ({ searchQuery, onSearchChange, therapistCount = 150 }: TherapistHeroProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const popularSearches = [
    "Voice Therapy",
    "Articulation",
    "Stuttering",
    "Child Speech",
    "Adult Therapy"
  ];

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

          {/* Search Section */}
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Main Search Bar */}
            <div className="relative">
              <div className={cn(
                "relative flex items-center bg-background rounded-2xl shadow-lg border-2 transition-all duration-300",
                isFocused ? "border-primary shadow-xl shadow-primary/10" : "border-border"
              )}>
                <Search className="absolute left-6 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, specialization, or location..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="pl-14 pr-6 py-6 text-lg border-0 rounded-2xl bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            {/* Popular Searches */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Popular searches:</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {popularSearches.map((search) => (
                  <Button
                    key={search}
                    variant="outline"
                    size="sm"
                    onClick={() => onSearchChange(search)}
                    className="rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {search}
                  </Button>
                ))}
              </div>
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
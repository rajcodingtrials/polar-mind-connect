import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCountryFlag } from "@/utils/countryFlags";
import { Star, CheckCircle2, Clock } from "lucide-react";

interface Therapist {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  bio: string;
  specializations: string[];
  languages: string[];
  years_experience: number;
  hourly_rate_30min: number;
  hourly_rate_60min: number;
  avatar_url: string;
  is_verified: boolean;
  timezone: string;
  education: string;
  certification: string;
  country: string;
}

interface TherapistCardProps {
  therapist: Therapist;
  onViewProfile: (therapist: Therapist) => void;
}

const TherapistCard = ({ therapist, onViewProfile }: TherapistCardProps) => {
  const rating = (Math.random() * 1.5 + 4).toFixed(1);
  const reviewCount = Math.floor(Math.random() * 200) + 50;
  const isOnline = Math.random() > 0.3; // 70% chance of being online

  return (
    <div className="flex gap-8 group hover:bg-muted/5 rounded-xl p-6 transition-all duration-300 max-w-6xl mx-auto">
      {/* Therapist Photo Card */}
      <Card className="w-80 flex-shrink-0 overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.02]">
        <CardContent className="p-0">
          {/* Photo Section with 4:3 Aspect Ratio */}
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <img
              src={therapist.avatar_url}
              alt={`${therapist.first_name} ${therapist.last_name}`}
              className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                (target.nextElementSibling as HTMLElement)?.classList.remove('hidden');
              }}
            />
            {/* Fallback Avatar */}
            <div className="hidden w-full h-full bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground">
              {therapist.first_name?.[0]}{therapist.last_name?.[0]}
            </div>
            
            {/* Online Status Indicator */}
            <div className="absolute top-4 right-4">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                isOnline 
                  ? 'bg-green-500 text-white' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-white' : 'bg-muted-foreground'
                }`} />
                {isOnline ? 'Online' : 'Offline'}
              </div>
            </div>

            {/* Verification Badge */}
            {therapist.is_verified && (
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </div>
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="p-6 space-y-4">
            {/* Country & Experience */}
            <div className="flex items-center justify-between">
              {therapist.country && (
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className="text-base">{getCountryFlag(therapist.country)}</span>
                  <span>{therapist.country}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{therapist.years_experience || 5}+ years</span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">{rating}</span>
              <span className="text-sm text-muted-foreground">({reviewCount})</span>
            </div>

            {/* CTA Button */}
            <Button
              className="w-full"
              onClick={() => onViewProfile(therapist)}
            >
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Section */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-foreground leading-tight">
            {therapist.first_name} {therapist.last_name}
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="text-2xl font-semibold text-foreground">
              ${therapist.hourly_rate_30min || 25}/30min
            </div>
            <div className="text-lg text-muted-foreground">
              ${Math.round((therapist.hourly_rate_30min || 25) * 2)}/60min
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <p className="text-base text-muted-foreground leading-relaxed line-clamp-3">
            {therapist.bio || "Experienced speech therapist specializing in voice therapy and articulation improvement. Dedicated to helping clients achieve clear and confident communication through personalized treatment plans and evidence-based techniques."}
          </p>
        </div>

        {/* Specializations */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
            Specializations
          </h3>
          <div className="flex flex-wrap gap-2">
            {(therapist.specializations && therapist.specializations.length > 0) ? 
              therapist.specializations.map((spec, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1.5 text-xs">
                  {spec}
                </Badge>
              )) : 
              [
                <Badge key="voice" variant="secondary" className="px-3 py-1.5 text-xs">Voice Therapy</Badge>,
                <Badge key="articulation" variant="secondary" className="px-3 py-1.5 text-xs">Articulation Therapy</Badge>
              ]
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistCard;
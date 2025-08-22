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
  headline: string;
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
    <div className="flex gap-10 group hover:bg-gradient-to-r hover:from-surface-elevated/70 hover:to-surface-elevated/40 rounded-2xl p-8 transition-all duration-500 max-w-7xl mx-auto border border-border/20 hover:border-border/40 hover:shadow-xl backdrop-blur-sm">
      {/* Therapist Photo Card */}
      <Card className="w-80 flex-shrink-0 overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.03] bg-surface-elevated border-border/30 hover:border-border/50">
        <CardContent className="p-0">
          {/* Photo Section with 4:3 Aspect Ratio */}
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface-sunken">
            <img
              src={therapist.avatar_url}
              alt={`${therapist.first_name} ${therapist.last_name}`}
              className="w-full h-full object-cover object-[50%_30%] transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                (target.nextElementSibling as HTMLElement)?.classList.remove('hidden');
              }}
            />
            {/* Fallback Avatar */}
            <div className="hidden w-full h-full bg-surface-sunken flex items-center justify-center text-3xl font-bold text-emphasis-medium">
              {therapist.first_name?.[0]}{therapist.last_name?.[0]}
            </div>
            
            {/* Online Status Indicator */}
            <div className="absolute top-4 right-4">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
                isOnline 
                  ? 'bg-success text-success-foreground border border-success/20' 
                  : 'bg-surface-elevated text-emphasis-medium border border-border'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-success-foreground' : 'bg-offline'
                }`} />
                {isOnline ? 'Online' : 'Offline'}
              </div>
            </div>

            {/* Verification Badge */}
            {therapist.is_verified && (
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-info text-info-foreground rounded-full text-xs font-medium shadow-sm border border-info/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </div>
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="p-6 space-y-4 bg-card">
            {/* Country & Experience */}
            <div className="flex items-center justify-between">
              {therapist.country && (
                <div className="flex items-center gap-2 text-sm font-medium text-emphasis-high">
                  <span className="text-base">{getCountryFlag(therapist.country)}</span>
                  <span>{therapist.country}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-sm text-emphasis-medium bg-surface-sunken px-2 py-1 rounded-md">
                <Clock className="w-4 h-4" />
                <span>{therapist.years_experience || 5}+ years</span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 bg-surface-sunken p-3 rounded-lg">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>
              <span className="text-sm font-bold text-emphasis-high">{rating}</span>
              <span className="text-sm text-emphasis-medium">({reviewCount} reviews)</span>
            </div>

            {/* CTA Button */}
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 shadow-sm hover:shadow-md"
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
        <div className="space-y-4 pb-4 border-b border-border/30">
          <div className="space-y-2">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-emphasis-high leading-tight">
                {therapist.first_name} {therapist.last_name}
                {therapist.certification && (
                  <span className="text-base font-normal text-emphasis-medium ml-2">
                    {therapist.certification}
                  </span>
                )}
              </h2>
              
              {/* Professional Headline */}
              {therapist.headline && (
                <p className="text-base text-emphasis-medium leading-relaxed">
                  {therapist.headline}
                </p>
              )}
            </div>
          </div>
          
          {/* Bio */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-emphasis-high">About</h3>
            <p className="text-base text-emphasis-medium leading-relaxed line-clamp-3">
              {therapist.bio || "Experienced speech therapist specializing in voice therapy and articulation improvement. Dedicated to helping clients achieve clear and confident communication through personalized treatment plans and evidence-based techniques."}
            </p>
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-6">
            <div className="bg-surface-elevated p-4 rounded-lg border border-border/30">
              <div className="text-2xl font-bold text-emphasis-high">
                ${therapist.hourly_rate_30min || 25}
              </div>
              <div className="text-xs text-emphasis-medium uppercase tracking-wide">
                30 minutes
              </div>
            </div>
            <div className="text-emphasis-medium">
              <div className="text-lg font-medium">
                ${Math.round((therapist.hourly_rate_30min || 25) * 2)}
              </div>
              <div className="text-xs uppercase tracking-wide">
                60 minutes
              </div>
            </div>
          </div>
        </div>


        {/* Specializations */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-emphasis-high uppercase tracking-wide">
            Specializations
          </h3>
          <div className="flex flex-wrap gap-2">
            {(therapist.specializations && therapist.specializations.length > 0) ? 
              therapist.specializations.map((spec, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1.5 text-xs bg-surface-elevated text-emphasis-high border border-border/30">
                  {spec}
                </Badge>
              )) : 
              [
                <Badge key="voice" variant="secondary" className="px-3 py-1.5 text-xs bg-surface-elevated text-emphasis-high border border-border/30">Voice Therapy</Badge>,
                <Badge key="articulation" variant="secondary" className="px-3 py-1.5 text-xs bg-surface-elevated text-emphasis-high border border-border/30">Articulation Therapy</Badge>
              ]
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistCard;
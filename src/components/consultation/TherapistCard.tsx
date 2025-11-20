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

interface TherapistRating {
  therapistId: string;
  averageRating: number;
  reviewCount: number;
}

interface TherapistCardProps {
  therapist: Therapist;
  rating: TherapistRating;
  onViewProfile: (therapist: Therapist) => void;
}

const TherapistCard = ({ therapist, rating, onViewProfile }: TherapistCardProps) => {
  return (
    <div className="flex gap-10 group bg-white rounded-2xl p-8 transition-all duration-300 max-w-7xl mx-auto border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-xl hover:scale-[1.01]">
      {/* Therapist Photo Card */}
      <Card className="w-80 flex-shrink-0 overflow-hidden transition-all duration-300 bg-white border-slate-200">
        <CardContent className="p-0">
          {/* Photo Section with 4:3 Aspect Ratio */}
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
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
            <div className="hidden w-full h-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-600">
              {therapist.first_name?.[0]}{therapist.last_name?.[0]}
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
          <div className="p-6 space-y-4 bg-white">
            {/* Country & Experience */}
            <div className="flex items-center justify-between">
              {therapist.country && (
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <span className="text-base">{getCountryFlag(therapist.country)}</span>
                  <span>{therapist.country}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-sm text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
                <Clock className="w-4 h-4" />
                <span>{therapist.years_experience || 5}+ years</span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
              {rating.reviewCount > 0 ? (
                <>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < Math.floor(rating.averageRating) 
                            ? 'fill-amber-500 text-amber-500' 
                            : 'text-slate-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{rating.averageRating.toFixed(1)}</span>
                  <span className="text-sm text-slate-600">({rating.reviewCount} review{rating.reviewCount !== 1 ? 's' : ''})</span>
                </>
              ) : (
                <span className="text-sm text-slate-600 italic">No reviews yet</span>
              )}
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
        <div className="space-y-4 pb-4 border-b border-slate-200">
          <div className="space-y-2">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-slate-700 leading-tight">
                {therapist.first_name} {therapist.last_name}
                {therapist.certification && (
                  <span className="text-base font-normal text-slate-600 ml-2">
                    {therapist.certification}
                  </span>
                )}
              </h2>
              
              {/* Professional Headline */}
              {therapist.headline && (
                <p className="text-base text-slate-600 leading-relaxed">
                  {therapist.headline}
                </p>
              )}
            </div>
          </div>
          
          {/* Bio */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-700">About</h3>
            <p className={`text-base leading-relaxed line-clamp-3 ${
              therapist.bio ? 'text-slate-600' : 'text-slate-500 italic'
            }`}>
              {therapist.bio || "This therapist hasn't added a bio yet."}
            </p>
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-6">
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="text-2xl font-bold text-slate-700">
                ${therapist.hourly_rate_30min || 25}
              </div>
              <div className="text-xs text-slate-600 uppercase tracking-wide">
                30 minutes
              </div>
            </div>
            <div className="text-slate-600">
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
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            Specializations
          </h3>
          <div className="flex flex-wrap gap-2">
            {(therapist.specializations && therapist.specializations.length > 0) ? 
              therapist.specializations.map((spec, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1.5 text-xs bg-white text-slate-700 border border-slate-200">
                  {spec}
                </Badge>
              )) : 
              [
                <Badge key="voice" variant="secondary" className="px-3 py-1.5 text-xs bg-white text-slate-700 border border-slate-200">Voice Therapy</Badge>,
                <Badge key="articulation" variant="secondary" className="px-3 py-1.5 text-xs bg-white text-slate-700 border border-slate-200">Articulation Therapy</Badge>
              ]
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistCard;
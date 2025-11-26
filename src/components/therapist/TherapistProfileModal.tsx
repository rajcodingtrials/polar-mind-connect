import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Clock, 
  DollarSign, 
  MapPin, 
  Languages, 
  GraduationCap,
  Award,
  Calendar
} from "lucide-react";
import BookingModal from "./BookingModal";

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
  num_reviews?: number;
  average_review?: number;
}

interface TherapistProfileModalProps {
  therapist: Therapist;
  isOpen: boolean;
  onClose: () => void;
}

const TherapistProfileModal = ({ therapist, isOpen, onClose }: TherapistProfileModalProps) => {
  const [showBooking, setShowBooking] = useState(false);

  const handleBookingClick = () => {
    setShowBooking(true);
  };

  const handleBookingClose = () => {
    setShowBooking(false);
  };

  const displayRating = therapist.average_review !== undefined ? therapist.average_review : 0;
  const displayReviewCount = therapist.num_reviews !== undefined ? therapist.num_reviews : 0;
  const hasReviews = displayReviewCount > 0;

  const renderStars = (ratingValue: number) => {
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <span className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400">★</span>
        ))}
        {hasHalfStar && (
          <span className="text-yellow-400">★</span>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">★</span>
        ))}
      </span>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Therapist Profile</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 p-6">
            {/* Header */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={therapist.avatar_url} />
                <AvatarFallback className="text-lg">
                  {therapist.first_name?.[0]}{therapist.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">
                    {therapist.first_name} {therapist.last_name}
                  </h2>
                  {therapist.is_verified && (
                    <Badge variant="secondary">Verified</Badge>
                  )}
                </div>
                
                    <div className="flex items-center text-muted-foreground text-sm space-x-4 flex-wrap gap-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {therapist.years_experience || 0} years experience
                  </div>
                  {therapist.timezone && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {therapist.timezone}
                    </div>
                  )}
                      {hasReviews && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700">
                            {displayRating.toFixed(1)}
                          </span>
                          {renderStars(displayRating)}
                          <span className="text-xs text-slate-600">
                            ({displayReviewCount})
                          </span>
                        </div>
                      )}
                </div>
              </div>
            </div>
              </CardContent>
            </Card>

            {/* Bio */}
            {therapist.bio && (
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">About</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {therapist.bio}
                </p>
                </CardContent>
              </Card>
            )}

            {/* Specializations */}
            {therapist.specializations && therapist.specializations.length > 0 && (
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Specializations</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="flex flex-wrap gap-2">
                  {therapist.specializations.map((spec) => (
                    <Badge key={spec} variant="outline">
                      {spec}
                    </Badge>
                  ))}
                </div>
                </CardContent>
              </Card>
            )}

            {/* Languages */}
            {therapist.languages && therapist.languages.length > 0 && (
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                  <Languages className="h-4 w-4 mr-2" />
                  Languages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="flex flex-wrap gap-2">
                  {therapist.languages.map((lang) => (
                    <Badge key={lang} variant="secondary">
                      {lang}
                    </Badge>
                  ))}
                </div>
                </CardContent>
              </Card>
            )}

            {/* Education & Certification */}
            {(therapist.education || therapist.certification) && (
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {therapist.education && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Education
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {therapist.education}
                  </p>
                </div>
              )}
              
              {therapist.certification && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Award className="h-4 w-4 mr-2" />
                    Certification
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {therapist.certification}
                  </p>
                </div>
              )}
            </div>
                </CardContent>
              </Card>
            )}

            {/* Pricing */}
            {(therapist.hourly_rate_30min || therapist.hourly_rate_60min) && (
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Session Rates
                  </CardTitle>
                </CardHeader>
                <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {therapist.hourly_rate_30min && (
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">30-minute session</div>
                    <div className="text-2xl font-bold text-primary">
                      ${therapist.hourly_rate_30min}
                    </div>
                  </div>
                )}
                {therapist.hourly_rate_60min && (
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">60-minute session</div>
                    <div className="text-2xl font-bold text-primary">
                      ${therapist.hourly_rate_60min}
                    </div>
                  </div>
                )}
              </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex gap-3">
              <Button onClick={handleBookingClick} className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Book Consultation
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {showBooking && (
        <BookingModal
          therapist={therapist}
          isOpen={showBooking}
          onClose={handleBookingClose}
        />
      )}
    </>
  );
};

export default TherapistProfileModal;
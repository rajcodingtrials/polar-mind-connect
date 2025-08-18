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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Therapist Profile</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Header */}
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
                
                <div className="flex items-center text-muted-foreground text-sm space-x-4">
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
                </div>
              </div>
            </div>

            {/* Bio */}
            {therapist.bio && (
              <div>
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {therapist.bio}
                </p>
              </div>
            )}

            <Separator />

            {/* Specializations */}
            {therapist.specializations && therapist.specializations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {therapist.specializations.map((spec) => (
                    <Badge key={spec} variant="outline">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {therapist.languages && therapist.languages.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Languages className="h-4 w-4 mr-2" />
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {therapist.languages.map((lang) => (
                    <Badge key={lang} variant="secondary">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Education & Certification */}
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

            <Separator />

            {/* Pricing */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Session Rates
              </h3>
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
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleBookingClick} className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Book Consultation
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
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
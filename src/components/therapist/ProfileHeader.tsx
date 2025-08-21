import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface ProfileHeaderProps {
  therapistProfile: {
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
    name?: string;
    headline?: string;
    certification?: string;
    is_verified: boolean;
    is_active: boolean;
  };
}

export const ProfileHeader = ({ therapistProfile }: ProfileHeaderProps) => {
  return (
    <div className="flex items-start space-x-6 pb-6">
      <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
        <AvatarImage 
          src={therapistProfile?.avatar_url} 
          alt="Profile photo" 
          className="object-cover"
        />
        <AvatarFallback className="text-2xl bg-muted">
          <User className="h-16 w-16" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {therapistProfile.first_name && therapistProfile.last_name 
            ? `${therapistProfile.first_name} ${therapistProfile.last_name}`
            : therapistProfile.name || 'Unnamed Therapist'}
        </h2>
        {therapistProfile.headline && (
          <p className="text-lg text-muted-foreground font-medium">{therapistProfile.headline}</p>
        )}
        {therapistProfile.certification && (
          <p className="text-sm text-muted-foreground">{therapistProfile.certification}</p>
        )}
        <div className="flex items-center space-x-2 pt-2">
          <Badge variant={therapistProfile.is_verified ? "default" : "secondary"}>
            {therapistProfile.is_verified ? "Active" : "Pending Verification"}
          </Badge>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        {therapistProfile?.avatar_url ? '' : 'Go to "Photos & Docs" tab to upload photo'}
      </div>
    </div>
  );
};
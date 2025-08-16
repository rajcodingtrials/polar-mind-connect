import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface ProfileHeaderProps {
  therapistProfile: {
    avatar_url?: string;
    name: string;
    years_experience: number;
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
        <h2 className="text-2xl font-bold text-foreground">{therapistProfile.name}</h2>
        <p className="text-muted-foreground">Licensed Therapist</p>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>{therapistProfile.years_experience} years experience</span>
          {therapistProfile.certification && (
            <span>• {therapistProfile.certification}</span>
          )}
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <Badge variant={therapistProfile.is_verified ? "default" : "secondary"}>
            {therapistProfile.is_verified ? "Verified" : "Pending Verification"}
          </Badge>
          <Badge variant={therapistProfile.is_active ? "default" : "destructive"}>
            {therapistProfile.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        {therapistProfile?.avatar_url ? '' : 'Go to "Photos & Docs" tab to upload photo'}
      </div>
    </div>
  );
};
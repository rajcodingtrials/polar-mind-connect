import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { User, Upload } from "lucide-react";

interface ProfileHeaderProps {
  therapistProfile: {
    id?: string;
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
    name?: string;
    headline?: string;
    certification?: string;
    is_verified?: boolean;
    is_active?: boolean;
  } | null;
  onAvatarUpdate?: (url: string) => void;
}

export const ProfileHeader = ({ therapistProfile, onAvatarUpdate }: ProfileHeaderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | undefined>(therapistProfile?.avatar_url);

  // Update local avatar URL when therapistProfile prop changes
  useEffect(() => {
    setCurrentAvatarUrl(therapistProfile?.avatar_url);
  }, [therapistProfile?.avatar_url]);

  const uploadPhoto = async (file: File) => {
    if (!therapistProfile?.id || !user?.id) return;

    try {
      setUploading(true);
      
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('therapist-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('therapist-photos')
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      // Update therapist profile with new avatar URL
      const { error: updateError } = await supabase
        .from('therapists')
        .update({ avatar_url: avatarUrl })
        .eq('id', therapistProfile.id);

      if (updateError) throw updateError;

      // Update local state immediately for instant UI update
      setCurrentAvatarUrl(avatarUrl);
      onAvatarUpdate?.(avatarUrl);
      
      toast({
        title: "Success",
        description: "Profile photo updated successfully!",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload photo.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select an image file.",
        });
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
        });
        return;
      }
      
      uploadPhoto(file);
    }
  };

  return (
    <div className="flex items-start space-x-6 pb-6">
      <div className="relative">
      <Avatar className="h-48 w-48 border-4 border-white shadow-lg rounded-lg">
        <AvatarImage 
          src={currentAvatarUrl || therapistProfile?.avatar_url} 
          alt="Profile photo" 
          className="object-cover"
        />
        <AvatarFallback className="text-2xl bg-muted">
          <User className="h-16 w-16" />
        </AvatarFallback>
      </Avatar>
        <div className="absolute bottom-0 right-0">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
            id="avatar-upload"
            disabled={uploading || !therapistProfile?.id}
          />
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full p-2 h-10 w-10 cursor-pointer"
            disabled={uploading || !therapistProfile?.id}
            onClick={() => document.getElementById('avatar-upload')?.click()}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {therapistProfile?.first_name && therapistProfile?.last_name 
            ? `${therapistProfile.first_name} ${therapistProfile.last_name}`
            : therapistProfile?.name || 'New Therapist'}
        </h2>
        {therapistProfile?.headline && (
          <p className="text-lg text-muted-foreground font-medium">{therapistProfile.headline}</p>
        )}
        {therapistProfile?.certification && (
          <p className="text-sm text-muted-foreground">{therapistProfile.certification}</p>
        )}
        <div className="flex items-center space-x-2">
          <Badge variant={therapistProfile?.is_verified ? "default" : "secondary"}>
            {therapistProfile?.is_verified ? "Active" : "Pending Verification"}
          </Badge>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface TherapistFileUploadProps {
  therapistId: string;
  currentAvatarUrl?: string;
  onAvatarUpdate?: (url: string) => void;
}

export const TherapistFileUpload = ({ therapistId, currentAvatarUrl, onAvatarUpdate }: TherapistFileUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const uploadPhoto = async (file: File) => {
    try {
      setUploading(true);
      
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/profile.${fileExt}`;
      
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
        .eq('id', therapistId);

      if (updateError) throw updateError;

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Photo
        </CardTitle>
        <CardDescription>
          Upload your professional profile photo (max 5MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={currentAvatarUrl} alt="Profile photo" />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Button
              onClick={() => photoInputRef.current?.click()}
              disabled={uploading}
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
            <p className="text-xs text-muted-foreground">
              JPG, PNG or GIF up to 5MB
            </p>
          </div>
        </div>
        <Input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};
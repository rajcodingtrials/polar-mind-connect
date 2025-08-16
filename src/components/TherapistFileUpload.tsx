import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, FileText, Trash2, Eye, Download, User, FileCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
  created_at: string;
}

interface TherapistFileUploadProps {
  therapistId: string;
  currentAvatarUrl?: string;
  onAvatarUpdate?: (url: string) => void;
}

export const TherapistFileUpload = ({ therapistId, currentAvatarUrl, onAvatarUpdate }: TherapistFileUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    fetchDocuments();
  }, [therapistId]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('therapist-documents')
        .list(`${user?.id}/`, {
          limit: 100,
          offset: 0,
        });

      if (error) throw error;

      const documentsWithUrls = await Promise.all(
        (data || []).map(async (file) => {
          const { data: urlData } = await supabase.storage
            .from('therapist-documents')
            .createSignedUrl(`${user?.id}/${file.name}`, 3600);
          
          return {
            name: file.name,
            url: urlData?.signedUrl || '',
            size: file.metadata?.size || 0,
            type: file.metadata?.mimetype || '',
            created_at: file.created_at || '',
          };
        })
      );

      setDocuments(documentsWithUrls);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

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

  const uploadDocument = async (file: File) => {
    try {
      setUploading(true);
      
      // Upload to storage
      const fileName = `${user?.id}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('therapist-documents')
        .upload(fileName, file);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document uploaded successfully!",
      });
      
      // Refresh documents list
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload document.",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (fileName: string) => {
    try {
      const { error } = await supabase.storage
        .from('therapist-documents')
        .remove([`${user?.id}/${fileName}`]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document deleted successfully!",
      });
      
      // Refresh documents list
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete document.",
      });
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

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
        });
        return;
      }
      
      uploadDocument(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Profile Photo Upload */}
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

      {/* Documents Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Certificates & Documents
          </CardTitle>
          <CardDescription>
            Upload your certifications, licenses, and other professional documents (max 10MB each)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => documentInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
          <Input
            ref={documentInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleDocumentChange}
            className="hidden"
          />
          
          {/* Documents List */}
          <div className="space-y-3">
            {loadingDocuments ? (
              <p className="text-sm text-muted-foreground">Loading documents...</p>
            ) : documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
            ) : (
              documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.size)} • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteDocument(doc.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
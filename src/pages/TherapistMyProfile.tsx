import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTherapistAuth } from "../hooks/useTherapistAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import TherapistHeader from "../components/therapist/TherapistHeader";
import Footer from "@/components/Footer";
import { ProfileHeader } from "@/components/therapist/ProfileHeader";
import { PersonalInformation } from "@/components/therapist/PersonalInformation";
import { ProfessionalDetails } from "@/components/therapist/ProfessionalDetails";
import { TherapistDocuments } from "@/components/therapist/TherapistDocuments";
import { Shield, LogOut, Upload, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TherapistMyProfile = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { therapistProfile, updateTherapistProfile, createTherapistProfile, loading } = useTherapistAuth();
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(!therapistProfile);
  const [editedProfile, setEditedProfile] = useState(therapistProfile || {
    name: '',
    first_name: '',
    last_name: '',
    email: '',
    date_of_birth: '',
    phone: '',
    country: '',
    bio: '',
    headline: '',
    years_experience: 0,
    certification: '',
    education: '',
    languages: [],
    specializations: [],
    avatar_url: '',
  });
  const [directoryPath, setDirectoryPath] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (therapistProfile) {
      setEditedProfile(therapistProfile);
      setIsEditing(false);
    }
  }, [therapistProfile]);

  const handleSaveProfile = async () => {
    if (!editedProfile) return;

    const profileData = {
      name: editedProfile.name,
      first_name: editedProfile.first_name,
      last_name: editedProfile.last_name,
      email: editedProfile.email,
      date_of_birth: editedProfile.date_of_birth || null,
      phone: editedProfile.phone,
      country: editedProfile.country,
      headline: editedProfile.headline,
      bio: editedProfile.bio,
      years_experience: editedProfile.years_experience,
      certification: editedProfile.certification,
      education: editedProfile.education,
      languages: editedProfile.languages,
      specializations: editedProfile.specializations,
      avatar_url: editedProfile.avatar_url,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    let result;
    if (therapistProfile) {
      result = await updateTherapistProfile(profileData);
    } else {
      result = await createTherapistProfile(profileData);
    }

    if (!result.error) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    if (therapistProfile) {
      setEditedProfile(therapistProfile);
      setIsEditing(false);
    } else {
      setEditedProfile({
        name: '',
        first_name: '',
        last_name: '',
        email: '',
        date_of_birth: '',
        phone: '',
        country: '',
        bio: '',
        headline: '',
        years_experience: 0,
        certification: '',
        education: '',
        languages: [],
        specializations: [],
        avatar_url: '',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const handleDirectoryUpload = async () => {
    if (!directoryPath.trim() && selectedFiles.length === 0) {
      uiToast({
        title: "Error",
        description: "Please select a directory or enter a directory path",
        variant: "destructive",
      });
      return;
    }

    if (selectedFiles.length === 0) {
      uiToast({
        title: "Error",
        description: "Please browse and select a directory with lesson files",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Process files - filter for JSON files (lesson files)
      const jsonFiles = selectedFiles.filter(file => 
        file.name.endsWith('.json') || file.type === 'application/json'
      );
      
      if (jsonFiles.length === 0) {
        uiToast({
          title: "Warning",
          description: "No JSON files found in the selected directory. Lesson files should be in JSON format.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      // Process each JSON file as a lesson
      let successCount = 0;
      let errorCount = 0;

      for (const file of jsonFiles) {
        try {
          const text = await file.text();
          const lessonData = JSON.parse(text);

          // Determine lesson type and create lesson record
          // This is a basic implementation - you may need to adjust based on your lesson structure
          if (lessonData.name || lessonData.lesson_name) {
            const lessonRecord = {
              name: lessonData.name || lessonData.lesson_name || file.name.replace('.json', ''),
              description: lessonData.description || null,
              question_type: lessonData.question_type || 'question_time',
              difficulty_level: lessonData.difficulty_level || 'beginner',
              is_active: true,
            };

            const { error: insertError } = await supabase
              .from('lessons')
              .insert(lessonRecord);

            if (insertError) {
              console.error(`Error uploading lesson from ${file.name}:`, insertError);
              errorCount++;
            } else {
              successCount++;
            }
          } else {
            errorCount++;
            console.warn(`Invalid lesson format in ${file.name}: missing name field`);
          }
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          errorCount++;
        }
      }

      if (successCount > 0) {
        uiToast({
          title: "Success",
          description: `Successfully uploaded ${successCount} lesson(s)${errorCount > 0 ? `. ${errorCount} file(s) failed.` : '.'}`,
        });
        setDirectoryPath("");
        setSelectedFiles([]);
      } else {
        uiToast({
          title: "Error",
          description: `Failed to upload lessons. ${errorCount} file(s) had errors.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading lessons:", error);
      uiToast({
        title: "Error",
        description: "Failed to upload lessons from directory",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <TherapistHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4 text-slate-700">Loading...</h1>
            <p className="text-gray-600">Please wait while we load your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <TherapistHeader />
      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <ProfileHeader 
                therapistProfile={therapistProfile} 
                onAvatarUpdate={(url) => {
                  setEditedProfile(prev => prev ? {...prev, avatar_url: url} : null);
                }}
              />
            </CardContent>
          </Card>

          {/* Personal Information */}
          <PersonalInformation
            therapistProfile={therapistProfile}
            editedProfile={editedProfile}
            setEditedProfile={setEditedProfile}
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onSave={handleSaveProfile}
            onCancel={handleCancelEdit}
          />

          {/* Professional Details */}
          <ProfessionalDetails
            therapistProfile={therapistProfile}
            editedProfile={editedProfile}
            setEditedProfile={setEditedProfile}
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onSave={handleSaveProfile}
            onCancel={handleCancelEdit}
          />

          {/* Certificates & Documents */}
          {therapistProfile && (
            <TherapistDocuments therapistId={therapistProfile.id} />
          )}

          {/* Lesson Upload Section for Content Creators */}
          {therapistProfile?.is_content_creator && (
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Lessons
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="directory-path">Directory Path</Label>
                  <div className="flex gap-2">
                    <Input
                      id="directory-path"
                      type="text"
                      placeholder="Enter directory path or search for folder..."
                      value={directoryPath}
                      onChange={(e) => setDirectoryPath(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.webkitdirectory = true;
                        input.onchange = (e: any) => {
                          if (e.target.files && e.target.files.length > 0) {
                            const files = Array.from(e.target.files) as File[];
                            const path = files[0].webkitRelativePath.split("/")[0];
                            setDirectoryPath(path || "");
                            setSelectedFiles(files);
                            uiToast({
                              title: "Directory Selected",
                              description: `Selected directory with ${files.length} file(s)`,
                            });
                          }
                        };
                        input.click();
                      }}
                      disabled={isUploading}
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Browse
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click Browse to select a folder containing lesson JSON files
                    {selectedFiles.length > 0 && (
                      <span className="block mt-1 text-green-600">
                        ✓ {selectedFiles.length} file(s) selected
                      </span>
                    )}
                  </p>
                </div>
                
                <Button
                  onClick={handleDirectoryUpload}
                  disabled={selectedFiles.length === 0 || isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Lessons from Directory
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Account Security */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Account Email</Label>
                <p className="text-sm text-muted-foreground">
                  {user?.email || 'No email associated'}
                </p>
              </div>
              
              <Separator />
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.location.href = '/reset-password'}>
                  Change Password
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TherapistMyProfile;


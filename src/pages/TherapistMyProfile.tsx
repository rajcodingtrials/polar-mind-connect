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
import { Shield, LogOut, Upload, HelpCircle, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import UploadLessons from "@/components/therapist/UploadLessons";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useUserPreferences } from "@/hooks/useUserPreferences";

const TherapistMyProfile = () => {
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth();
  const { therapistProfile, updateTherapistProfile, createTherapistProfile, loading } = useTherapistAuth();
  const { preferences, updateSpeechDelayMode, updateAddMiniCelebration, updateCelebrationVideoId, updateUseAiTherapist } = useUserPreferences();
  const navigate = useNavigate();
  
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
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading before checking authentication
    if (!authLoading && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

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
                <Button
                  onClick={() => setShowUploadDialog(true)}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Lessons from Directory
                </Button>
                <div className="text-center">
                  <Link
                    to="/how-to-add-lessons"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Learn how to add new lessons
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Therapy Preferences */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                AI Therapy Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Speech Delay Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable extra time for processing and responding during AI therapy sessions
                  </p>
                </div>
                <Switch
                  checked={preferences?.speechDelayMode === 'yes'}
                  onCheckedChange={(checked) => {
                    // Toggle between 'yes' (enabled) and 'no' (disabled)
                    // 'default' is treated as 'no' (disabled) for the toggle
                    updateSpeechDelayMode(checked ? 'yes' : 'no');
                  }}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Add Mini Celebrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Add celebration after each correct answer to keep the child more motivated.
                  </p>
                </div>
                <ToggleGroup
                  type="single"
                  value={preferences?.addMiniCelebration || 'default'}
                  onValueChange={(value) => {
                    // Radix ToggleGroup with type="single" allows deselection, which passes empty string
                    // We need to handle this case and prevent deselection by keeping the current value
                    if (value && (value === 'yes' || value === 'no' || value === 'default')) {
                      updateAddMiniCelebration(value as 'yes' | 'no' | 'default');
                    }
                    // If value is empty/undefined (deselection), do nothing to keep current selection
                  }}
                  className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1 gap-1"
                >
                  <ToggleGroupItem
                    value="no"
                    aria-label="No"
                    className="data-[state=on]:bg-white data-[state=on]:text-gray-900 data-[state=on]:shadow-sm data-[state=off]:text-gray-600 rounded-md px-4 py-2 text-sm font-medium transition-all hover:text-gray-900"
                  >
                    No
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="default"
                    aria-label="Default"
                    className="data-[state=on]:bg-white data-[state=on]:text-gray-900 data-[state=on]:shadow-sm data-[state=off]:text-gray-600 rounded-md px-4 py-2 text-sm font-medium transition-all hover:text-gray-900"
                  >
                    Default
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="yes"
                    aria-label="Yes"
                    className="data-[state=on]:bg-white data-[state=on]:text-gray-900 data-[state=on]:shadow-sm data-[state=off]:text-gray-600 rounded-md px-4 py-2 text-sm font-medium transition-all hover:text-gray-900"
                  >
                    Yes
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Use AI Therapist</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable AI therapist features like voice interaction and automatic feedback
                  </p>
                </div>
                <Switch
                  checked={preferences?.useAiTherapist !== false}
                  onCheckedChange={updateUseAiTherapist}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="celebration-video-id">Celebration video id</Label>
                <Input
                  id="celebration-video-id"
                  value={preferences?.celebrationVideoId || ""}
                  onChange={(e) => updateCelebrationVideoId(e.target.value.trim() || null)}
                  placeholder="Enter YouTube video ID"
                />
                <p className="text-sm text-muted-foreground">
                  Id of the youtube video to show after successfully completing a lesson. If not set, the video set by the lesson creator will be shown.
                </p>
              </div>
            </CardContent>
          </Card>

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
      
      {/* Upload Lessons Dialog */}
      <UploadLessons
        userId={user?.id}
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
      />
    </div>
  );
};

export default TherapistMyProfile;



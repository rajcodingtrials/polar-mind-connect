import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTherapistAuth } from "../hooks/useTherapistAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import TherapistHeader from "../components/therapist/TherapistHeader";
import Footer from "@/components/Footer";
import { ProfileHeader } from "@/components/therapist/ProfileHeader";
import { PersonalInformation } from "@/components/therapist/PersonalInformation";
import { ProfessionalDetails } from "@/components/therapist/ProfessionalDetails";
import { TherapistDocuments } from "@/components/therapist/TherapistDocuments";
import { Shield, LogOut } from "lucide-react";
import { toast } from "sonner";

const TherapistMyProfile = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { therapistProfile, updateTherapistProfile, createTherapistProfile, loading } = useTherapistAuth();
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


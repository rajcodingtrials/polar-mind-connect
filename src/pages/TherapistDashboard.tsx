import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "../context/AuthContext";
import { useTherapistAuth } from "../hooks/useTherapistAuth";
import { useTherapistSessions } from "../hooks/useTherapistSessions";
import { useToast } from "@/components/ui/use-toast";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Settings, 
  Clock, 
  Star,
  Edit,
  Save,
  X,
  User,
  LogOut,
  Upload,
  FileText
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TherapistAvailabilityCalendar } from "@/components/TherapistAvailabilityCalendar";
import { TherapistFileUpload } from "@/components/TherapistFileUpload";
import { ProfileHeader } from "@/components/therapist/ProfileHeader";
import { PersonalInformation } from "@/components/therapist/PersonalInformation";
import { ProfessionalDetails } from "@/components/therapist/ProfessionalDetails";

const TherapistDashboard = () => {
  const { user, signOut } = useAuth();
  const { therapistProfile, updateTherapistProfile, loading } = useTherapistAuth();
  const { todaySessions, totalSessions, loading: sessionsLoading } = useTherapistSessions(therapistProfile?.id || null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(therapistProfile);

  useEffect(() => {
    if (!user) {
      navigate("/therapist-auth");
      return;
    }
    
    if (!loading && !therapistProfile) {
      navigate("/therapist-auth");
    }
  }, [user, therapistProfile, loading, navigate]);

  useEffect(() => {
    setEditedProfile(therapistProfile);
  }, [therapistProfile]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/therapist-auth");
  };

  const handleSaveProfile = async () => {
    if (!editedProfile) return;

    const updates = {
      name: editedProfile.name,
      headline: editedProfile.headline,
      bio: editedProfile.bio,
      years_experience: editedProfile.years_experience,
      certification: editedProfile.certification,
      education: editedProfile.education,
      languages: editedProfile.languages,
      hourly_rate_30min: editedProfile.hourly_rate_30min,
      hourly_rate_60min: editedProfile.hourly_rate_60min,
      specializations: editedProfile.specializations,
      avatar_url: editedProfile.avatar_url,
    };

    const { error } = await updateTherapistProfile(updates);
    if (!error) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(therapistProfile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!therapistProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">No therapist profile found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg stars-bg">
      {/* Header */}
      <header className="backdrop-blur-md bg-black border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Polariz Dashboard</h1>
                <p className="text-xs text-white/70">Therapist Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm">
                <User className="h-4 w-4 text-white" />
                <span className="text-sm text-white">{therapistProfile.name}</span>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 hover:text-white">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome back, {therapistProfile.name}!
          </h2>
          <p className="text-white/80">
            Manage your practice, schedule, and client sessions from your dashboard.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sessionsLoading ? "..." : todaySessions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sessionsLoading ? "..." : totalSessions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">$2,400</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-gray-900">4.9</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="files">Photos & Docs</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="space-y-6">
              {/* Profile Header */}
              <Card>
                <CardContent className="pt-6">
                  <ProfileHeader therapistProfile={therapistProfile} />
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
            </div>
          </TabsContent>
          
          <TabsContent value="files">
            <TherapistFileUpload 
              therapistId={therapistProfile.id}
              currentAvatarUrl={therapistProfile.avatar_url}
              onAvatarUpdate={(url) => {
                setEditedProfile(prev => prev ? {...prev, avatar_url: url} : null);
              }}
            />
          </TabsContent>
          
          <TabsContent value="schedule">
            <TherapistAvailabilityCalendar therapistId={therapistProfile.id} />
          </TabsContent>
          
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Session History
                </CardTitle>
                <CardDescription>
                  View and manage your therapy sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No sessions yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Your session history will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Earnings & Payments
                </CardTitle>
                <CardDescription>
                  Track your earnings and payment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No earnings data available</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Your earnings will be tracked here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TherapistDashboard;
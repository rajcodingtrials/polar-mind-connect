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
    <div className="min-h-screen gradient-mesh">
      {/* Enhanced Header with Glass Morphism */}
      <header className="glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">Therapist Dashboard</h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                <User className="h-5 w-5 text-white" />
                <span className="text-sm font-medium text-white">{therapistProfile.name}</span>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 backdrop-blur-sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Welcome Section */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg animate-fade-in">
            Welcome back, {therapistProfile.name}!
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
            Manage your practice, schedule, and client sessions from your personalized dashboard.
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="glass-card stats-card-hover group animate-scale-in border-0">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/70">Today's Sessions</p>
                  <p className="text-3xl font-bold text-white">
                    {sessionsLoading ? (
                      <div className="shimmer bg-white/20 rounded w-12 h-8"></div>
                    ) : (
                      todaySessions
                    )}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-info to-info/80 rounded-xl group-hover:animate-float">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card stats-card-hover group animate-scale-in border-0" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/70">Total Sessions</p>
                  <p className="text-3xl font-bold text-white">
                    {sessionsLoading ? (
                      <div className="shimmer bg-white/20 rounded w-12 h-8"></div>
                    ) : (
                      totalSessions
                    )}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-success to-success/80 rounded-xl group-hover:animate-float">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card stats-card-hover group animate-scale-in border-0" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/70">This Month</p>
                  <p className="text-3xl font-bold text-white">$2,400</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-warning to-warning/80 rounded-xl group-hover:animate-float">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card stats-card-hover group animate-scale-in border-0" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/70">Rating</p>
                  <p className="text-3xl font-bold text-white">4.9</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:animate-float">
                  <Star className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content Tabs */}
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="glass-card grid w-full grid-cols-5 p-2 h-14 border-0">
            <TabsTrigger 
              value="profile" 
              className="text-white/70 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg font-medium transition-all duration-300 hover:text-white hover:bg-white/10"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="files" 
              className="text-white/70 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg font-medium transition-all duration-300 hover:text-white hover:bg-white/10"
            >
              Photos & Docs
            </TabsTrigger>
            <TabsTrigger 
              value="schedule" 
              className="text-white/70 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg font-medium transition-all duration-300 hover:text-white hover:bg-white/10"
            >
              Schedule
            </TabsTrigger>
            <TabsTrigger 
              value="sessions" 
              className="text-white/70 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg font-medium transition-all duration-300 hover:text-white hover:bg-white/10"
            >
              Sessions
            </TabsTrigger>
            <TabsTrigger 
              value="earnings" 
              className="text-white/70 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg font-medium transition-all duration-300 hover:text-white hover:bg-white/10"
            >
              Earnings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="animate-fade-in">
            <div className="space-y-8">
              {/* Enhanced Profile Header */}
              <Card className="glass-card border-0 overflow-hidden">
                <CardContent className="pt-8">
                  <ProfileHeader therapistProfile={therapistProfile} />
                </CardContent>
              </Card>

              {/* Enhanced Personal Information */}
              <div className="glass-card rounded-xl p-1">
                <PersonalInformation
                  therapistProfile={therapistProfile}
                  editedProfile={editedProfile}
                  setEditedProfile={setEditedProfile}
                  isEditing={isEditing}
                  onEdit={() => setIsEditing(true)}
                  onSave={handleSaveProfile}
                  onCancel={handleCancelEdit}
                />
              </div>

              {/* Enhanced Professional Details */}
              <div className="glass-card rounded-xl p-1">
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
            </div>
          </TabsContent>
          
          <TabsContent value="files" className="animate-fade-in">
            <div className="glass-card rounded-xl p-8 border-0">
              <TherapistFileUpload 
                therapistId={therapistProfile.id}
                currentAvatarUrl={therapistProfile.avatar_url}
                onAvatarUpdate={(url) => {
                  setEditedProfile(prev => prev ? {...prev, avatar_url: url} : null);
                }}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="animate-fade-in">
            <div className="glass-card rounded-xl p-8 border-0">
              <TherapistAvailabilityCalendar therapistId={therapistProfile.id} />
            </div>
          </TabsContent>
          
          <TabsContent value="sessions" className="animate-fade-in">
            <Card className="glass-card border-0">
              <CardHeader className="pb-8">
                <CardTitle className="flex items-center gap-3 text-white text-xl">
                  <div className="p-2 bg-gradient-to-br from-info to-info/80 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  Session History
                </CardTitle>
                <CardDescription className="text-white/70 text-base">
                  View and manage your therapy sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <div className="p-4 bg-white/10 rounded-full w-fit mx-auto mb-6">
                    <Users className="h-16 w-16 text-white/60" />
                  </div>
                  <p className="text-white/80 text-lg font-medium">No sessions yet</p>
                  <p className="text-white/60 mt-2">
                    Your session history will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="earnings" className="animate-fade-in">
            <Card className="glass-card border-0">
              <CardHeader className="pb-8">
                <CardTitle className="flex items-center gap-3 text-white text-xl">
                  <div className="p-2 bg-gradient-to-br from-warning to-warning/80 rounded-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  Earnings & Payments
                </CardTitle>
                <CardDescription className="text-white/70 text-base">
                  Track your earnings and payment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <div className="p-4 bg-white/10 rounded-full w-fit mx-auto mb-6">
                    <DollarSign className="h-16 w-16 text-white/60" />
                  </div>
                  <p className="text-white/80 text-lg font-medium">No earnings data available</p>
                  <p className="text-white/60 mt-2">
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
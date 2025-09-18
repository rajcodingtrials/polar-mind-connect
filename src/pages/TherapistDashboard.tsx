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
import { useTherapistRatings } from "../hooks/useTherapistRatings";
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
  const { todaySessions, totalSessions, sessions, loading: sessionsLoading } = useTherapistSessions(therapistProfile?.id || null);
  const { getRatingForTherapist } = useTherapistRatings(therapistProfile?.id ? [therapistProfile.id] : []);
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

  // Calculate monthly earnings from completed sessions
  const calculateMonthlyEarnings = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return sessions
      .filter(session => {
        const sessionDate = new Date(session.session_date);
        return sessionDate.getMonth() === currentMonth && 
               sessionDate.getFullYear() === currentYear &&
               session.status === 'completed' &&
               session.price_paid;
      })
      .reduce((total, session) => total + (session.price_paid || 0), 0);
  };

  // Get therapist rating
  const therapistRating = therapistProfile?.id ? getRatingForTherapist(therapistProfile.id) : { averageRating: 0, reviewCount: 0 };

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
                <h1 className="text-xl font-semibold text-white">Polariz</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm">
                <User className="h-4 w-4 text-white" />
                <span className="text-sm text-white">{therapistProfile.name}</span>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm" className="border-white/50 text-white hover:bg-white/20 hover:text-white bg-white/10">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Heading */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-black mb-4 tracking-tight">
            Therapist Dashboard
          </h1>
        </div>
        
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-3">
            Welcome back, {therapistProfile.name}!
          </h2>
          <p className="text-white/80 text-lg">
            Manage your practice, schedule, and client sessions from your dashboard.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card className="bg-blue-50 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">Today's Sessions</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {sessionsLoading ? "..." : todaySessions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-green-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-100">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">Total Sessions</p>
                  <p className="text-2xl font-bold text-green-900">
                    {sessionsLoading ? "..." : totalSessions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50 border border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-700">This Month</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    ${sessionsLoading ? "..." : calculateMonthlyEarnings().toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-700">Rating</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {therapistRating.reviewCount > 0 ? therapistRating.averageRating.toFixed(1) : "N/A"}
                  </p>
                  {therapistRating.reviewCount > 0 && (
                    <p className="text-xs text-purple-600">
                      ({therapistRating.reviewCount} review{therapistRating.reviewCount !== 1 ? 's' : ''})
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-black via-gray-900 to-black border border-white/30 rounded-xl p-3 shadow-2xl backdrop-blur-sm ring-1 ring-white/10">
            <TabsTrigger 
              value="profile" 
              className="group relative text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-white/15 hover:to-white/25 hover:shadow-lg hover:shadow-white/20 hover:ring-1 hover:ring-white/30 data-[state=active]:bg-gradient-to-r data-[state=active]:from-white/25 data-[state=active]:to-white/35 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-white/30 data-[state=active]:ring-2 data-[state=active]:ring-white/40 data-[state=active]:font-semibold transition-all duration-300 ease-out hover:scale-110 data-[state=active]:scale-105 rounded-lg mx-1 py-3.5 px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <span className="relative z-10">Profile</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
            </TabsTrigger>
            <TabsTrigger 
              value="files" 
              className="group relative text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-white/15 hover:to-white/25 hover:shadow-lg hover:shadow-white/20 hover:ring-1 hover:ring-white/30 data-[state=active]:bg-gradient-to-r data-[state=active]:from-white/25 data-[state=active]:to-white/35 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-white/30 data-[state=active]:ring-2 data-[state=active]:ring-white/40 data-[state=active]:font-semibold transition-all duration-300 ease-out hover:scale-110 data-[state=active]:scale-105 rounded-lg mx-1 py-3.5 px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <span className="relative z-10">Photos & Docs</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
            </TabsTrigger>
            <TabsTrigger 
              value="schedule" 
              className="group relative text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-white/15 hover:to-white/25 hover:shadow-lg hover:shadow-white/20 hover:ring-1 hover:ring-white/30 data-[state=active]:bg-gradient-to-r data-[state=active]:from-white/25 data-[state=active]:to-white/35 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-white/30 data-[state=active]:ring-2 data-[state=active]:ring-white/40 data-[state=active]:font-semibold transition-all duration-300 ease-out hover:scale-110 data-[state=active]:scale-105 rounded-lg mx-1 py-3.5 px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <span className="relative z-10">Schedule</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
            </TabsTrigger>
            <TabsTrigger 
              value="sessions" 
              className="group relative text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-white/15 hover:to-white/25 hover:shadow-lg hover:shadow-white/20 hover:ring-1 hover:ring-white/30 data-[state=active]:bg-gradient-to-r data-[state=active]:from-white/25 data-[state=active]:to-white/35 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-white/30 data-[state=active]:ring-2 data-[state=active]:ring-white/40 data-[state=active]:font-semibold transition-all duration-300 ease-out hover:scale-110 data-[state=active]:scale-105 rounded-lg mx-1 py-3.5 px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <span className="relative z-10">Sessions</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
            </TabsTrigger>
            <TabsTrigger 
              value="earnings" 
              className="group relative text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-white/15 hover:to-white/25 hover:shadow-lg hover:shadow-white/20 hover:ring-1 hover:ring-white/30 data-[state=active]:bg-gradient-to-r data-[state=active]:from-white/25 data-[state=active]:to-white/35 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-white/30 data-[state=active]:ring-2 data-[state=active]:ring-white/40 data-[state=active]:font-semibold transition-all duration-300 ease-out hover:scale-110 data-[state=active]:scale-105 rounded-lg mx-1 py-3.5 px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <span className="relative z-10">Earnings</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
            </TabsTrigger>
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
                {sessionsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading sessions...</p>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No sessions yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Your session history will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <Card key={session.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge 
                                  variant={session.status === 'completed' ? 'default' : 
                                          session.status === 'pending' ? 'secondary' : 'destructive'}
                                >
                                  {session.status}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {session.session_type}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="font-medium text-gray-700">Date</p>
                                  <p className="text-gray-600">{new Date(session.session_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-700">Time</p>
                                  <p className="text-gray-600">{session.start_time} - {session.end_time}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-700">Duration</p>
                                  <p className="text-gray-600">{session.duration_minutes} min</p>
                                </div>
                                {session.price_paid && (
                                  <div>
                                    <p className="font-medium text-gray-700">Payment</p>
                                    <p className="text-gray-600">${session.price_paid} {session.currency}</p>
                                  </div>
                                )}
                              </div>
                              {session.client_notes && (
                                <div className="mt-3">
                                  <p className="font-medium text-gray-700 text-sm">Client Notes</p>
                                  <p className="text-gray-600 text-sm">{session.client_notes}</p>
                                </div>
                              )}
                              {session.therapist_notes && (
                                <div className="mt-3">
                                  <p className="font-medium text-gray-700 text-sm">Your Notes</p>
                                  <p className="text-gray-600 text-sm">{session.therapist_notes}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {new Date(session.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
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
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
  FileText,
  Video
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TherapistAvailabilityCalendar } from "@/components/TherapistAvailabilityCalendar";
import TherapistHeader from "@/components/therapist/TherapistHeader";
import { format } from "date-fns";

const TherapistDashboard = () => {
  const { user, signOut } = useAuth();
  const { therapistProfile, updateTherapistProfile, createTherapistProfile, loading } = useTherapistAuth();
  const { todaySessions, totalSessions, sessions, loading: sessionsLoading } = useTherapistSessions(therapistProfile?.id || null);
  const { getRatingForTherapist } = useTherapistRatings(therapistProfile?.id ? [therapistProfile.id] : []);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(!therapistProfile); // Start in edit mode if no profile

  // Helper functions for session management
  const formatSessionDateTime = (date: string, startTime: string) => {
    const sessionDate = new Date(`${date}T${startTime}`);
    return {
      date: format(sessionDate, "MMM dd, yyyy"),
      time: format(sessionDate, "h:mm a"),
    };
  };

  const isSessionJoinable = (date: string, startTime: string) => {
    const sessionDate = new Date(`${date}T${startTime}`);
    const now = new Date();
    const twelveHoursBefore = new Date(sessionDate.getTime() - 12 * 60 * 60 * 1000);
    return now >= twelveHoursBefore;
  };

  const hasSessionPassed = (date: string, endTime: string) => {
    const sessionEndDate = new Date(`${date}T${endTime}`);
    const now = new Date();
    return now > sessionEndDate;
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

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
  const [profileInitialized, setProfileInitialized] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth", { replace: true });
    }
  }, [user, navigate]);

  // Auto-create minimal profile for new therapists with prefilled data from sign-up
  useEffect(() => {
    const initializeProfile = async () => {
      if (user && !therapistProfile && !loading && !profileInitialized) {
        setProfileInitialized(true);
        
        // Get user metadata from sign-up
        const firstName = user.user_metadata?.first_name || '';
        const lastName = user.user_metadata?.last_name || '';
        const email = user.email || '';
        
        // Create minimal profile with sign-up data
        const minimalProfile = {
          name: firstName && lastName ? `${firstName} ${lastName}` : firstName || '',
          first_name: firstName,
          last_name: lastName,
          email: email,
          date_of_birth: (user.user_metadata?.date_of_birth || user.user_metadata?.dob || ''),
          bio: '',
          headline: '',
          years_experience: 0,
          certification: '',
          education: '',
          languages: [],
          specializations: [],
          avatar_url: '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        
        await createTherapistProfile(minimalProfile);
      }
    };
    
    initializeProfile();
  }, [user, therapistProfile, loading, createTherapistProfile, profileInitialized]);

  useEffect(() => {
    if (therapistProfile) {
      setEditedProfile(therapistProfile);
      setIsEditing(false); // Exit edit mode when profile loads
    }
  }, [therapistProfile]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

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
      // Update existing profile
      result = await updateTherapistProfile(profileData);
    } else {
      // Create new profile
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
      // If no profile exists, reset to empty form
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <div className="text-center">Loading...</div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <TherapistHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800">
              {therapistProfile ? `Welcome back, ${therapistProfile.name}!` : "Welcome! Complete your profile to get started"}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              {therapistProfile 
                ? "Manage your practice, schedule, and client sessions from your dashboard."
                : "Fill in your professional details in the Profile tab to start accepting clients."}
            </p>
          </div>
        </div>

        {/* Your Earnings Section */}
        <Card className="bg-white border-slate-200 shadow-sm mb-12">
          <CardHeader>
            <CardTitle className="text-slate-700 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Your Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 border border-yellow-200 hover:border-yellow-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-yellow-100">
                      <Calendar className="h-8 w-8 text-amber-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-amber-700">Today's Sessions</p>
                      <p className="text-2xl font-bold text-amber-900">
                        {sessionsLoading ? "..." : todaySessions}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-700">Total Sessions</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {sessionsLoading ? "..." : totalSessions}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 hover:border-green-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-green-100">
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-700">This Month</p>
                      <p className="text-2xl font-bold text-green-900">
                        ${sessionsLoading ? "..." : calculateMonthlyEarnings().toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 border border-purple-200 hover:border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
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
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/40 backdrop-blur rounded-2xl shadow-sm">
            <TabsTrigger value="schedule" className="rounded-xl text-sm sm:text-base bg-white text-slate-700 border-2 border-transparent data-[state=active]:bg-blue-50 data-[state=inactive]:hover:bg-blue-100 hover:scale-[1.01] hover:shadow-xl transition-all duration-300">Schedule</TabsTrigger>
            <TabsTrigger value="sessions" className="rounded-xl text-sm sm:text-base bg-white text-slate-700 border-2 border-transparent data-[state=active]:bg-blue-50 data-[state=inactive]:hover:bg-blue-100 hover:scale-[1.01] hover:shadow-xl transition-all duration-300">Sessions</TabsTrigger>
            <TabsTrigger value="earnings" className="rounded-xl text-sm sm:text-base bg-white text-slate-700 border-2 border-transparent data-[state=active]:bg-blue-50 data-[state=inactive]:hover:bg-blue-100 hover:scale-[1.01] hover:shadow-xl transition-all duration-300">Earnings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="schedule">
            {therapistProfile ? (
              <TherapistAvailabilityCalendar therapistId={therapistProfile.id} />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Please complete your profile first to set availability.</p>
                </CardContent>
              </Card>
            )}
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
                      {sessions.map((session) => {
                        const { date, time } = formatSessionDateTime(session.session_date, session.start_time);
                        const canJoin = isSessionJoinable(session.session_date, session.start_time);
                        const hasPassed = hasSessionPassed(session.session_date, session.end_time);
                        const hasMeetingLink = session.meeting_link;
                      
                      return (
                        <Card key={session.id} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge className={getSessionStatusColor(session.status)}>
                                    {session.status}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {session.session_type}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="font-medium text-gray-700">Date</p>
                                    <p className="text-gray-600">{date}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-700">Time</p>
                                    <p className="text-gray-600">{time}</p>
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
                                
                                {/* Meeting Details Section */}
                                {hasMeetingLink && (
                                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center text-sm font-medium text-blue-900 mb-2">
                                      <Video className="w-4 h-4 mr-2" />
                                      Meeting Details
                                    </div>
                                    {session.zoom_meeting_id && (
                                      <p className="text-xs text-slate-600 mb-1">
                                        <span className="font-medium">Meeting ID:</span> {session.zoom_meeting_id}
                                      </p>
                                    )}
                                    {session.zoom_password && (
                                      <p className="text-xs text-slate-600">
                                        <span className="font-medium">Password:</span> {session.zoom_password}
                                      </p>
                                    )}
                                  </div>
                                )}
                                
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
                              <div className="flex flex-col items-end gap-2 ml-4">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {new Date(session.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                {/* Join Video Button */}
                                {hasMeetingLink && !hasPassed && (
                                  <Button
                                    onClick={() => window.open(session.meeting_link, '_blank')}
                                    disabled={!canJoin}
                                    className="w-full md:w-auto"
                                    variant={canJoin ? "default" : "outline"}
                                  >
                                    <Video className="w-4 h-4 mr-2" />
                                    {canJoin ? 'Join Video Call' : 'Available 12hrs Before'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
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
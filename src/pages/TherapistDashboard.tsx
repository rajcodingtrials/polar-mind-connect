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

const TherapistDashboard = () => {
  const { user, signOut } = useAuth();
  const { therapistProfile, updateTherapistProfile, loading } = useTherapistAuth();
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
      bio: editedProfile.bio,
      years_experience: editedProfile.years_experience,
      certification: editedProfile.certification,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Therapist Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm text-gray-700">{therapistProfile.name}</span>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {therapistProfile.name}!
          </h2>
          <p className="text-gray-600">
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
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Clients</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
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
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Professional Profile</CardTitle>
                    <CardDescription>
                      Manage your professional information and rates
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveProfile} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo Display */}
                <div className="flex items-center space-x-6 p-4 bg-muted/50 rounded-lg">
                  <Avatar className="h-32 w-32 border-2 border-border">
                    <AvatarImage 
                      src={therapistProfile?.avatar_url} 
                      alt="Profile photo" 
                      className="object-cover"
                    />
                    <AvatarFallback className="text-lg">
                      <User className="h-16 w-16" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-medium">Profile Photo</h3>
                    <p className="text-sm text-muted-foreground">
                      {therapistProfile?.avatar_url ? 'Photo uploaded successfully' : 'No photo uploaded yet'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Go to "Photos & Docs" tab to upload or change your photo
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Professional Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedProfile?.name || ''}
                        onChange={(e) => setEditedProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{therapistProfile.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    {isEditing ? (
                      <Input
                        id="experience"
                        type="number"
                        value={editedProfile?.years_experience || 0}
                        onChange={(e) => setEditedProfile(prev => prev ? {...prev, years_experience: parseInt(e.target.value) || 0} : null)}
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{therapistProfile.years_experience} years</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={editedProfile?.bio || ''}
                      onChange={(e) => setEditedProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{therapistProfile.bio || 'No bio provided'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certification">Certifications</Label>
                  {isEditing ? (
                    <Input
                      id="certification"
                      value={editedProfile?.certification || ''}
                      onChange={(e) => setEditedProfile(prev => prev ? {...prev, certification: e.target.value} : null)}
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{therapistProfile.certification || 'No certifications listed'}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rate30">30-minute Session Rate</Label>
                    {isEditing ? (
                      <Input
                        id="rate30"
                        type="number"
                        step="0.01"
                        value={editedProfile?.hourly_rate_30min || ''}
                        onChange={(e) => setEditedProfile(prev => prev ? {...prev, hourly_rate_30min: parseFloat(e.target.value) || null} : null)}
                      />
                    ) : (
                      <p className="text-sm text-gray-900">
                        ${therapistProfile.hourly_rate_30min || 'Not set'}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rate60">60-minute Session Rate</Label>
                    {isEditing ? (
                      <Input
                        id="rate60"
                        type="number"
                        step="0.01"
                        value={editedProfile?.hourly_rate_60min || ''}
                        onChange={(e) => setEditedProfile(prev => prev ? {...prev, hourly_rate_60min: parseFloat(e.target.value) || null} : null)}
                      />
                    ) : (
                      <p className="text-sm text-gray-900">
                        ${therapistProfile.hourly_rate_60min || 'Not set'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Specializations</Label>
                  <div className="flex flex-wrap gap-2">
                    {therapistProfile.specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant={therapistProfile.is_verified ? "default" : "secondary"}>
                    {therapistProfile.is_verified ? "Verified" : "Pending Verification"}
                  </Badge>
                  <Badge variant={therapistProfile.is_active ? "default" : "destructive"}>
                    {therapistProfile.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
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
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Settings, Shield, LogOut } from "lucide-react";

const UserProfileEditor = () => {
  const { user, logout } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { preferences, updateSpeechDelayMode, updateAddMiniCelebration, updateCelebrationVideoId } = useUserPreferences();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    age: 0,
    email: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        username: profile.username || "",
        age: profile.age || 0,
        email: profile.email || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          username: formData.username,
          age: formData.age,
          email: formData.email,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        username: profile.username || "",
        age: profile.age || 0,
        email: profile.email || "",
      });
    }
    setIsEditing(false);
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

  if (profileLoading) {
    return (
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center">Loading profile...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <User className="w-5 h-5 mr-2" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                disabled={!isEditing}
                placeholder="Enter your username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
                placeholder="Enter your email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                disabled={!isEditing}
                placeholder="Enter your age"
                min="1"
                max="120"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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
              checked={preferences?.speechDelayMode || false}
              onCheckedChange={updateSpeechDelayMode}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Add Mini Celebrations</Label>
              <p className="text-sm text-muted-foreground">
                Add celebration after each correct answer to keep the child more motivated.
              </p>
            </div>
            <Switch
              checked={preferences?.addMiniCelebration || false}
              onCheckedChange={updateAddMiniCelebration}
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
  );
};

export default UserProfileEditor;
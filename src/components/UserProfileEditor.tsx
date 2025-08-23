import React, { useState, useEffect } from "react";
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
import { User, Settings, Shield } from "lucide-react";

const UserProfileEditor = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { preferences, updateSpeechDelayMode } = useUserPreferences();
  
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

  if (profileLoading) {
    return (
      <Card className="bg-card/20 backdrop-blur-sm border-border/40">
        <CardContent className="p-6">
          <div className="text-center">Loading profile...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card className="bg-card/20 backdrop-blur-sm border-border/40">
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

      {/* Therapy Preferences */}
      <Card className="bg-card/20 backdrop-blur-sm border-border/40">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Therapy Preferences
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
          
          <div className="space-y-2">
            <Label>Account Created</Label>
            <p className="text-sm text-muted-foreground">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card className="bg-card/20 backdrop-blur-sm border-border/40">
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
          
          <Button variant="outline" onClick={() => window.location.href = '/reset-password'}>
            Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfileEditor;
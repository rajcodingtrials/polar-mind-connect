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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Settings, Shield, LogOut, Link2, Copy, Check } from "lucide-react";

const UserProfileEditor = () => {
  const { user, logout } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { preferences, updateSpeechDelayMode, updateAddMiniCelebration, updateCelebrationVideoId, updateUseAiTherapist } = useUserPreferences();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    age: 0,
    email: "",
  });
  const [activeCodes, setActiveCodes] = useState<Array<{ id: string; code: string; created_at: string; expires_at: string | null }>>([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

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

  useEffect(() => {
    if (user?.id) {
      fetchActiveCodes();
    }
  }, [user?.id]);

  const fetchActiveCodes = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingCodes(true);
      const { data, error } = await supabase
        .from('parent_codes')
        .select('id, code, created_at, expires_at')
        .eq('parent_user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActiveCodes(data || []);
    } catch (error: any) {
      console.error('Error fetching active codes:', error);
      toast.error('Failed to load active codes');
    } finally {
      setLoadingCodes(false);
    }
  };

  const generateCode = async () => {
    if (!user?.id) return;

    try {
      setGeneratingCode(true);
      
      // Call the database function to generate a unique code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_parent_code');

      if (codeError) throw codeError;

      // Create the code record (expires in 7 days by default)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data, error } = await supabase
        .from('parent_codes')
        .insert({
          parent_user_id: user.id,
          code: codeData,
          is_active: true,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Code generated successfully!');
      fetchActiveCodes();
    } catch (error: any) {
      console.error('Error generating code:', error);
      toast.error(error.message || 'Failed to generate code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyToClipboard = async (code: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeId(codeId);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

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

      {/* Link with Therapist */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <Link2 className="w-5 h-5 mr-2" />
            Link with Therapist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Generate a one-time code to share with your therapist. They can use this code along with your email to link your account.
            </p>
          </div>
          
          <Button 
            onClick={generateCode} 
            disabled={generatingCode}
            className="w-full md:w-auto"
          >
            {generatingCode ? "Generating..." : "Generate New Code"}
          </Button>

          <Separator />

          <div className="space-y-2">
            <Label>Active Codes</Label>
            {loadingCodes ? (
              <p className="text-sm text-muted-foreground">Loading codes...</p>
            ) : activeCodes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active codes. Generate one above to share with your therapist.</p>
            ) : (
              <div className="space-y-2">
                {activeCodes.map((codeItem) => {
                  const isExpired = codeItem.expires_at && new Date(codeItem.expires_at) < new Date();
                  return (
                    <div 
                      key={codeItem.id} 
                      className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <code className="text-lg font-mono font-bold text-blue-600">
                            {codeItem.code}
                          </code>
                          {isExpired && (
                            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                              Expired
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(codeItem.created_at).toLocaleDateString()}
                          {codeItem.expires_at && (
                            <> • Expires: {new Date(codeItem.expires_at).toLocaleDateString()}</>
                          )}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(codeItem.code, codeItem.id)}
                        className="ml-2"
                      >
                        {copiedCodeId === codeItem.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
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
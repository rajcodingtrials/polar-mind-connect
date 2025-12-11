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
import { Shield, LogOut, Upload, HelpCircle, Settings, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import UploadLessons from "@/components/therapist/UploadLessons";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useUserRole } from "@/hooks/useUserRole";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const TherapistMyProfile = () => {
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth();
  const { therapistProfile, updateTherapistProfile, createTherapistProfile, loading } = useTherapistAuth();
  const { preferences, updateSpeechDelayMode, updateAddMiniCelebration, updateCelebrationVideoId, updateUseAiTherapist } = useUserPreferences();
  const { role, loading: roleLoading } = useUserRole();
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
  const [lessonNameToDelete, setLessonNameToDelete] = useState("");
  const [questionTypeToDelete, setQuestionTypeToDelete] = useState("");
  const [isDeletingLesson, setIsDeletingLesson] = useState(false);
  const [isDeletingQuestionType, setIsDeletingQuestionType] = useState(false);
  const [showDeleteSuccessDialog, setShowDeleteSuccessDialog] = useState(false);
  const [deleteStats, setDeleteStats] = useState({
    lessons: 0,
    questions: 0,
    images: 0,
    videos: 0
  });

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

  const handleDeleteLesson = async () => {
    if (!lessonNameToDelete.trim()) {
      toast.error("Please enter a lesson name");
      return;
    }

    setIsDeletingLesson(true);
    try {
      // Find the lesson by name
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons_v2')
        .select('id, name, question_type')
        .ilike('name', lessonNameToDelete.trim())
        .maybeSingle();

      if (lessonError) {
        throw new Error(`Error finding lesson: ${lessonError.message}`);
      }

      if (!lessonData) {
        toast.error(`Lesson "${lessonNameToDelete}" not found`);
        setIsDeletingLesson(false);
        return;
      }

      const lessonId = lessonData.id;
      const questionType = lessonData.question_type;
      const lessonName = lessonData.name;

      // Count questions before deleting
      const { count: questionsCount } = await supabase
        .from('questions_v2')
        .select('*', { count: 'exact', head: true })
        .eq('lesson_id', lessonId);

      // Delete all questions for this lesson
      const { error: questionsError } = await supabase
        .from('questions_v2')
        .delete()
        .eq('lesson_id', lessonId);

      if (questionsError) {
        throw new Error(`Error deleting questions: ${questionsError.message}`);
      }

      // Delete the lesson from lessons_v2
      const { error: lessonDeleteError } = await supabase
        .from('lessons_v2')
        .delete()
        .eq('id', lessonId);

      if (lessonDeleteError) {
        throw new Error(`Error deleting lesson: ${lessonDeleteError.message}`);
      }

      // Delete the storage directory: question_type/lesson_name/
      const sanitizedQuestionType = questionType.replace(/[^a-zA-Z0-9.-]/g, '_');
      const sanitizedLessonName = lessonName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `${sanitizedQuestionType}/${sanitizedLessonName}/`;

      // Recursive function to delete all files in a directory and count images/videos
      let imagesCount = 0;
      let videosCount = 0;
      const deleteDirectoryRecursive = async (path: string): Promise<void> => {
        const { data: items, error: listError } = await supabase.storage
          .from('question-images-v2')
          .list(path, {
            limit: 1000,
            offset: 0
          });

        if (listError) {
          console.warn(`Error listing files in ${path}: ${listError.message}`);
          return;
        }

        if (!items || items.length === 0) {
          return;
        }

        const filePaths: string[] = [];
        const subdirectories: string[] = [];

        for (const item of items) {
          const itemPath = `${path}${item.name}`;
          if (item.id) {
            // It's a file - count images and videos
            const fileName = item.name.toLowerCase();
            if (fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)) {
              imagesCount++;
            } else if (fileName.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/)) {
              videosCount++;
            }
            filePaths.push(itemPath);
          } else {
            // It's a directory
            subdirectories.push(itemPath + '/');
          }
        }

        // Delete files in batches
        if (filePaths.length > 0) {
          const batchSize = 100;
          for (let i = 0; i < filePaths.length; i += batchSize) {
            const batch = filePaths.slice(i, i + batchSize);
            const { error: deleteError } = await supabase.storage
              .from('question-images-v2')
              .remove(batch);

            if (deleteError) {
              console.warn(`Error deleting batch of files: ${deleteError.message}`);
            }
          }
        }

        // Recursively delete subdirectories
        for (const subdir of subdirectories) {
          await deleteDirectoryRecursive(subdir);
        }
      };

      await deleteDirectoryRecursive(storagePath);

      // Show success dialog with statistics
      setDeleteStats({
        lessons: 1,
        questions: questionsCount || 0,
        images: imagesCount,
        videos: videosCount
      });
      setShowDeleteSuccessDialog(true);
      setLessonNameToDelete("");
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete lesson");
    } finally {
      setIsDeletingLesson(false);
    }
  };

  const handleDeleteQuestionType = async () => {
    if (!questionTypeToDelete.trim()) {
      toast.error("Please enter a question type name");
      return;
    }

    setIsDeletingQuestionType(true);
    try {
      // Find all lessons with this question type
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons_v2')
        .select('id, name, question_type')
        .eq('question_type', questionTypeToDelete.trim());

      if (lessonsError) {
        throw new Error(`Error finding lessons: ${lessonsError.message}`);
      }

      if (!lessonsData || lessonsData.length === 0) {
        toast.error(`No lessons found for question type "${questionTypeToDelete}"`);
        setIsDeletingQuestionType(false);
        return;
      }

      const lessonIds = lessonsData.map(lesson => lesson.id);
      const lessonsCount = lessonsData.length;

      // Count questions before deleting
      const { count: questionsCount } = await supabase
        .from('questions_v2')
        .select('*', { count: 'exact', head: true })
        .in('lesson_id', lessonIds);

      // Delete all questions for these lessons
      const { error: questionsError } = await supabase
        .from('questions_v2')
        .delete()
        .in('lesson_id', lessonIds);

      if (questionsError) {
        throw new Error(`Error deleting questions: ${questionsError.message}`);
      }

      // Delete all lessons with this question type
      const { error: lessonsDeleteError } = await supabase
        .from('lessons_v2')
        .delete()
        .eq('question_type', questionTypeToDelete.trim());

      if (lessonsDeleteError) {
        throw new Error(`Error deleting lessons: ${lessonsDeleteError.message}`);
      }

      // Delete the storage directory: question_type/
      const sanitizedQuestionType = questionTypeToDelete.trim().replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `${sanitizedQuestionType}/`;

      // Recursive function to delete all files in a directory and count images/videos
      let imagesCount = 0;
      let videosCount = 0;
      const deleteDirectoryRecursive = async (path: string): Promise<void> => {
        const { data: items, error: listError } = await supabase.storage
          .from('question-images-v2')
          .list(path, {
            limit: 1000,
            offset: 0
          });

        if (listError) {
          console.warn(`Error listing files in ${path}: ${listError.message}`);
          return;
        }

        if (!items || items.length === 0) {
          return;
        }

        const filePaths: string[] = [];
        const subdirectories: string[] = [];

        for (const item of items) {
          const itemPath = `${path}${item.name}`;
          if (item.id) {
            // It's a file - count images and videos
            const fileName = item.name.toLowerCase();
            if (fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)) {
              imagesCount++;
            } else if (fileName.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/)) {
              videosCount++;
            }
            filePaths.push(itemPath);
          } else {
            // It's a directory
            subdirectories.push(itemPath + '/');
          }
        }

        // Delete files in batches
        if (filePaths.length > 0) {
          const batchSize = 100;
          for (let i = 0; i < filePaths.length; i += batchSize) {
            const batch = filePaths.slice(i, i + batchSize);
            const { error: deleteError } = await supabase.storage
              .from('question-images-v2')
              .remove(batch);

            if (deleteError) {
              console.warn(`Error deleting batch of files: ${deleteError.message}`);
            }
          }
        }

        // Recursively delete subdirectories
        for (const subdir of subdirectories) {
          await deleteDirectoryRecursive(subdir);
        }
      };

      await deleteDirectoryRecursive(storagePath);

      // Show success dialog with statistics
      setDeleteStats({
        lessons: lessonsCount,
        questions: questionsCount || 0,
        images: imagesCount,
        videos: videosCount
      });
      setShowDeleteSuccessDialog(true);
      setQuestionTypeToDelete("");
    } catch (error) {
      console.error("Error deleting question type:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete question type");
    } finally {
      setIsDeletingQuestionType(false);
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
                therapistProfile={{
                  ...therapistProfile,
                  avatar_url: editedProfile?.avatar_url || therapistProfile?.avatar_url
                }} 
                onAvatarUpdate={(url) => {
                  // Update editedProfile state immediately
                  setEditedProfile(prev => prev ? {...prev, avatar_url: url} : null);
                  // Also update therapistProfile if it exists to keep them in sync
                  if (therapistProfile) {
                    // The ProfileHeader component already updates the database,
                    // so we just need to update local state for immediate UI update
                    // The merged profile above will handle the display
                  }
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

          {/* Delete Lessons Section - Only for therapist_admin or admin */}
          {!roleLoading && (role === 'therapist_admin' || role === 'admin') && (
            <Card className="bg-white border-red-600 shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center text-red-600">
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete Lessons
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="lesson-name-delete">Lesson Name</Label>
                  <Input
                    id="lesson-name-delete"
                    value={lessonNameToDelete}
                    onChange={(e) => setLessonNameToDelete(e.target.value)}
                    placeholder="Enter exact lesson name to delete"
                    disabled={isDeletingLesson || isDeletingQuestionType}
                  />
                  <p className="text-sm text-muted-foreground">
                    This will delete the lesson, all its questions, and the storage directory.
                  </p>
                  <Button
                    onClick={handleDeleteLesson}
                    disabled={isDeletingLesson || isDeletingQuestionType || !lessonNameToDelete.trim()}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeletingLesson ? "Deleting..." : "Delete Lesson"}
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="question-type-delete">Question Type Name</Label>
                  <Input
                    id="question-type-delete"
                    value={questionTypeToDelete}
                    onChange={(e) => setQuestionTypeToDelete(e.target.value)}
                    placeholder="Enter question type name to delete"
                    disabled={isDeletingLesson || isDeletingQuestionType}
                  />
                  <p className="text-sm text-muted-foreground">
                    This will delete all lessons of this question type, all their questions, and the storage directory.
                  </p>
                  <Button
                    onClick={handleDeleteQuestionType}
                    disabled={isDeletingLesson || isDeletingQuestionType || !questionTypeToDelete.trim()}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeletingQuestionType ? "Deleting..." : "Delete Question Type"}
                  </Button>
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

      {/* Delete Success Dialog */}
      <Dialog open={showDeleteSuccessDialog} onOpenChange={setShowDeleteSuccessDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              Deletion Successful
            </DialogTitle>
            <DialogDescription>
              The deletion operation completed successfully
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 font-medium mb-3">
                Successfully deleted the following items:
              </p>
              <div className="space-y-2 text-sm text-green-800">
                <div className="flex justify-between">
                  <span>Lessons:</span>
                  <span className="font-semibold">{deleteStats.lessons}</span>
                </div>
                <div className="flex justify-between">
                  <span>Questions:</span>
                  <span className="font-semibold">{deleteStats.questions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Images from storage:</span>
                  <span className="font-semibold">{deleteStats.images}</span>
                </div>
                <div className="flex justify-between">
                  <span>Videos from storage:</span>
                  <span className="font-semibold">{deleteStats.videos}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                setShowDeleteSuccessDialog(false);
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TherapistMyProfile;



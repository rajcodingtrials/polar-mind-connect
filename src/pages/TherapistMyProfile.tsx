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
import { Shield, LogOut, Upload, FolderOpen, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

const TherapistMyProfile = () => {
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth();
  const { therapistProfile, updateTherapistProfile, createTherapistProfile, loading } = useTherapistAuth();
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  
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
  const [directoryPath, setDirectoryPath] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState({
    step: 'idle' as 'idle' | 'verifying' | 'uploading',
    current: 0,
    total: 0,
    message: ''
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

  // Helper function to upload image to Supabase storage
  const uploadImageToStorage = async (file: File, lessonDir: string, imagePath: string): Promise<string | null> => {
    try {
      // Create a unique filename to avoid conflicts
      const timestamp = Date.now();
      const sanitizedPath = imagePath.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedPath}`;
      
      const { data, error } = await supabase.storage
        .from('question-images-v2')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error(`Error uploading image ${imagePath}:`, error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('question-images-v2')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error(`Error uploading image ${imagePath}:`, error);
      return null;
    }
  };

  // Helper function to find a file in the selected files by relative path
  const findFileByPath = (files: File[], relativePath: string): File | null => {
    return files.find(file => {
      // Handle both webkitRelativePath and name matching
      const filePath = (file as any).webkitRelativePath || file.name;
      return filePath.includes(relativePath) || filePath.endsWith(relativePath);
    }) || null;
  };

  // Valid question_type_enum values
  const validQuestionTypes = [
    'first_words',
    'question_time',
    'build_sentence',
    'lets_chat',
    'tap_and_play',
    'story_activity'
  ];

  // Verification function to check lessons before upload
  const verifyLessons = async (
    directoryMap: Map<string, { lessonFile: File; imageFiles: File[] }>,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ isValid: boolean; errors: string[] }> => {
    const verificationErrors: string[] = [];
    const entries = Array.from(directoryMap.entries());
    const totalEntries = entries.length;

    // Verify each directory
    for (let index = 0; index < entries.length; index++) {
      const [dirPath, { lessonFile, imageFiles }] = entries[index];
      try {
        const text = await lessonFile.text();
        const lessonData = JSON.parse(text);

        // Validate question_type
        let questionType = lessonData.question_type;
        
        // Handle mapping for common variations
        if (questionType === 'story_time') {
          questionType = 'story_activity';
        }

        if (!validQuestionTypes.includes(questionType)) {
          verificationErrors.push(`${dirPath}: Invalid question_type "${lessonData.question_type}". Valid types are: ${validQuestionTypes.join(', ')}`);
          if (onProgress) onProgress(index + 1, totalEntries);
          continue;
        }

        // Determine lesson name
        const lessonName = lessonData.lesson || lessonData.name || lessonData.lesson_name || dirPath.split('/').pop() || 'Untitled Lesson';

        // Verification 1: Check if a lesson with this name and question_type already exists
        const { data: existingLesson, error: checkError } = await supabase
          .from('lessons_v2' as any)
          .select('id, name, question_type')
          .eq('name', lessonName)
          .eq('question_type', questionType)
          .maybeSingle();

        if (checkError) {
          verificationErrors.push(`${dirPath}: Error checking for existing lesson - ${checkError.message}`);
          if (onProgress) onProgress(index + 1, totalEntries);
          continue;
        }

        if (existingLesson) {
          verificationErrors.push(`${dirPath}: Lesson "${lessonName}" with question_type "${questionType}" already exists in lessons_v2 table.`);
          if (onProgress) onProgress(index + 1, totalEntries);
          continue;
        }

        // Verification 2: Check that all referenced image files exist
        const questions = lessonData.questions || [];
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];
          
          // Check question_image
          if (question.question_image) {
            const imagePath = question.question_image;
            const imageFile = findFileByPath(imageFiles, imagePath);
            
            if (!imageFile) {
              // Try to find by filename only
              const fileName = imagePath.split('/').pop() || imagePath;
              const foundFile = imageFiles.find(f => f.name === fileName);
              if (!foundFile) {
                verificationErrors.push(`${dirPath}: Question ${i + 1} - Image file not found: "${imagePath}"`);
              }
            }
          }

          // Check choices_image
          if (question.choices_image) {
            let imagePaths: string[] = [];
            
            // Handle both array and comma-separated string
            if (Array.isArray(question.choices_image)) {
              imagePaths = question.choices_image;
            } else if (typeof question.choices_image === 'string') {
              imagePaths = question.choices_image.split(',').map(p => p.trim()).filter(p => p);
            }

            for (const imagePath of imagePaths) {
              const imageFile = findFileByPath(imageFiles, imagePath);
              
              if (!imageFile) {
                // Try to find by filename only
                const fileName = imagePath.split('/').pop() || imagePath;
                const foundFile = imageFiles.find(f => f.name === fileName);
                if (!foundFile) {
                  verificationErrors.push(`${dirPath}: Question ${i + 1} - Choices image file not found: "${imagePath}"`);
                }
              }
            }
          }
        }
      } catch (error: any) {
        verificationErrors.push(`${dirPath}: Error during verification - ${error?.message || String(error)}`);
      }
      
      // Update progress
      if (onProgress) {
        onProgress(index + 1, totalEntries);
      }
    }

    return {
      isValid: verificationErrors.length === 0,
      errors: verificationErrors
    };
  };

  const handleDirectoryUpload = async () => {
    if (!directoryPath.trim() && selectedFiles.length === 0) {
      uiToast({
        title: "Error",
        description: "Please select a directory or enter a directory path",
        variant: "destructive",
      });
      return;
    }

    if (selectedFiles.length === 0) {
      uiToast({
        title: "Error",
        description: "Please browse and select a directory with lesson files",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Group files by directory structure
      const directoryMap = new Map<string, { lessonFile: File; imageFiles: File[] }>();
      
      // Find all lesson.json files and group with their directory files
      for (const file of selectedFiles) {
        const filePath = (file as any).webkitRelativePath || file.name;
        const pathParts = filePath.split('/');
        
        // Find lesson.json files
        if (file.name === 'lesson.json' || filePath.endsWith('/lesson.json')) {
          // Get directory path (everything before lesson.json)
          const dirPath = pathParts.slice(0, -1).join('/');
          
          if (!directoryMap.has(dirPath)) {
            directoryMap.set(dirPath, { lessonFile: file, imageFiles: [] });
          } else {
            directoryMap.get(dirPath)!.lessonFile = file;
          }
        }
      }

      // Add image files to their respective directories
      for (const file of selectedFiles) {
        if (file.type.startsWith('image/')) {
          const filePath = (file as any).webkitRelativePath || file.name;
          const pathParts = filePath.split('/');
          const dirPath = pathParts.slice(0, -1).join('/');
          
          if (directoryMap.has(dirPath)) {
            directoryMap.get(dirPath)!.imageFiles.push(file);
          }
        }
      }

      if (directoryMap.size === 0) {
        uiToast({
          title: "Warning",
          description: "No lesson.json files found in the selected directory.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      // Set up progress tracking for verification
      setUploadProgress({
        step: 'verifying',
        current: 0,
        total: directoryMap.size,
        message: 'Verifying lessons...'
      });

      // Run verification before upload
      const verification = await verifyLessons(directoryMap, (current, total) => {
        setUploadProgress({
          step: 'verifying',
          current,
          total,
          message: `Verifying lesson ${current} of ${total}...`
        });
      });
      
      if (!verification.isValid) {
        // Show verification errors and stop
        setErrorMessages(verification.errors);
        setShowErrorDialog(true);
        setIsUploading(false);
        setUploadProgress({ step: 'idle', current: 0, total: 0, message: '' });
        return;
      }

      // Calculate total questions for progress tracking (only for valid lessons)
      let totalQuestions = 0;
      for (const { lessonFile } of directoryMap.values()) {
        try {
          const text = await lessonFile.text();
          const lessonData = JSON.parse(text);
          totalQuestions += (lessonData.questions || []).length;
        } catch (e) {
          // Ignore errors during counting
        }
      }

      // Verification passed - show success toast
      uiToast({
        title: "Verification Successful",
        description: `All ${directoryMap.size} lesson(s) passed verification. Starting upload...`,
      });

      // Set up progress tracking for upload
      setUploadProgress({
        step: 'uploading',
        current: 0,
        total: totalQuestions,
        message: 'Uploading questions...'
      });

      let successCount = 0;
      let errorCount = 0;
      const ignoredDirectories: string[] = [];
      const allErrors: string[] = [];

      // Process each directory with a lesson.json file
      for (const [dirPath, { lessonFile, imageFiles }] of directoryMap.entries()) {
        try {
          const text = await lessonFile.text();
          const lessonData = JSON.parse(text);

          // Validate question_type
          let questionType = lessonData.question_type;
          
          // Handle mapping for common variations
          if (questionType === 'story_time') {
            questionType = 'story_activity';
          }

          if (!validQuestionTypes.includes(questionType)) {
            const errorMsg = `${dirPath}: Invalid question_type "${lessonData.question_type}". Valid types are: ${validQuestionTypes.join(', ')}`;
            ignoredDirectories.push(errorMsg);
            allErrors.push(errorMsg);
            errorCount++;
            continue;
          }

          // Determine lesson name
          const lessonName = lessonData.lesson || lessonData.name || lessonData.lesson_name || dirPath.split('/').pop() || 'Untitled Lesson';

          // Create lesson record in lessons_v2
          const lessonRecord = {
            name: lessonName,
            description: lessonData.description || null,
            question_type: questionType,
            level: lessonData.level || lessonData.difficulty_level || 'beginner',
            is_verified: false,
            youtube_video_id: lessonData.youtube_video_id || null,
          };

          const { data: lessonInsertData, error: lessonError } = await supabase
            .from('lessons_v2' as any)
            .insert(lessonRecord as any)
            .select()
            .single();

          if (lessonError || !lessonInsertData) {
            const errorMsg = `${dirPath}: Failed to create lesson - ${lessonError?.message || 'Unknown error'}`;
            console.error(`Error creating lesson in ${dirPath}:`, lessonError);
            allErrors.push(errorMsg);
            errorCount++;
            continue;
          }

          const lessonId = (lessonInsertData as any)?.id;
          const questions = lessonData.questions || [];

          // Process each question
          for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            
            try {
              // Handle question_image upload
              let questionImageUrl: string | null = null;
              if (question.question_image) {
                const imagePath = question.question_image;
                const imageFile = findFileByPath(imageFiles, imagePath);
                
                if (imageFile) {
                  questionImageUrl = await uploadImageToStorage(imageFile, dirPath, imagePath);
                  if (!questionImageUrl) {
                    console.warn(`Failed to upload question_image: ${imagePath}`);
                  }
                } else {
                  // Try to find by filename only
                  const fileName = imagePath.split('/').pop() || imagePath;
                  const foundFile = imageFiles.find(f => f.name === fileName);
                  if (foundFile) {
                    questionImageUrl = await uploadImageToStorage(foundFile, dirPath, imagePath);
                  }
                }
              }

              // Handle choices_image upload
              let choicesImageUrls: string | null = null;
              if (question.choices_image) {
                let imagePaths: string[] = [];
                
                // Handle both array and comma-separated string
                if (Array.isArray(question.choices_image)) {
                  imagePaths = question.choices_image;
                } else if (typeof question.choices_image === 'string') {
                  imagePaths = question.choices_image.split(',').map(p => p.trim()).filter(p => p);
                }

                const uploadedUrls: string[] = [];
                
                for (const imagePath of imagePaths) {
                  const imageFile = findFileByPath(imageFiles, imagePath);
                  
                  if (imageFile) {
                    const url = await uploadImageToStorage(imageFile, dirPath, imagePath);
                    if (url) {
                      uploadedUrls.push(url);
                    }
                  } else {
                    // Try to find by filename only
                    const fileName = imagePath.split('/').pop() || imagePath;
                    const foundFile = imageFiles.find(f => f.name === fileName);
                    if (foundFile) {
                      const url = await uploadImageToStorage(foundFile, dirPath, imagePath);
                      if (url) {
                        uploadedUrls.push(url);
                      }
                    }
                  }
                }
                
                if (uploadedUrls.length > 0) {
                  choicesImageUrls = uploadedUrls.join(',');
                }
              }

              // Create question record
              const questionRecord = {
                question_text: question.question_text || question.question || '',
                question_speech: question.question_speech || null,
                description_text: question.description_text || question.description || question.question_description || null,
                answer: question.answer || '',
                answer_index: question.answer_index !== undefined ? question.answer_index : null,
                question_image: questionImageUrl,
                choices_text: question.choices_text || question.choices || null,
                choices_image: choicesImageUrls,
                question_type: questionType,
                lesson_id: lessonId,
                question_index: i,
                created_by: user?.id || null,
              };

              const { error: questionError } = await supabase
                .from('questions_v2' as any)
                .insert(questionRecord as any);

              if (questionError) {
                const errorMsg = `${dirPath}: Failed to create question ${i + 1} - ${questionError.message}`;
                console.error(`Error creating question ${i} in ${dirPath}:`, questionError);
                allErrors.push(errorMsg);
              }
              
              // Update progress after each question
              setUploadProgress(prev => ({
                step: 'uploading',
                current: prev.current + 1,
                total: prev.total,
                message: `Uploading question ${prev.current + 1} of ${prev.total}...`
              }));
            } catch (questionError: any) {
              const errorMsg = `${dirPath}: Error processing question ${i + 1} - ${questionError?.message || String(questionError)}`;
              console.error(`Error processing question ${i} in ${dirPath}:`, questionError);
              allErrors.push(errorMsg);
              
              // Update progress even on error
              setUploadProgress(prev => ({
                step: 'uploading',
                current: prev.current + 1,
                total: prev.total,
                message: `Uploading question ${prev.current + 1} of ${prev.total}...`
              }));
            }
          }

          successCount++;
        } catch (dirError: any) {
          const errorMsg = `${dirPath}: Error processing directory - ${dirError?.message || String(dirError)}`;
          console.error(`Error processing directory ${dirPath}:`, dirError);
          allErrors.push(errorMsg);
          errorCount++;
        }
      }

      // Show results
      if (successCount > 0 && allErrors.length === 0) {
        uiToast({
          title: "Success",
          description: `Successfully uploaded ${successCount} lesson(s)`,
        });
        setDirectoryPath("");
        setSelectedFiles([]);
      } else if (allErrors.length > 0) {
        // Show error dialog with all errors
        setErrorMessages(allErrors);
        setShowErrorDialog(true);
      } else {
        // No successes and no specific errors (shouldn't happen, but handle it)
        setErrorMessages(["No lessons were uploaded. Please check your directory structure and try again."]);
        setShowErrorDialog(true);
      }
    } catch (error: any) {
      console.error("Error uploading lessons:", error);
      const errorMsg = `Failed to upload lessons from directory: ${error?.message || String(error)}`;
      setErrorMessages([errorMsg]);
      setShowErrorDialog(true);
    } finally {
      setIsUploading(false);
      setUploadProgress({ step: 'idle', current: 0, total: 0, message: '' });
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
                <div className="space-y-2">
                  <Label htmlFor="directory-path">Directory Path</Label>
                  <div className="flex gap-2">
                    <Input
                      id="directory-path"
                      type="text"
                      placeholder="Enter directory path or search for folder..."
                      value={directoryPath}
                      onChange={(e) => setDirectoryPath(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.webkitdirectory = true;
                        input.onchange = (e: any) => {
                          if (e.target.files && e.target.files.length > 0) {
                            const files = Array.from(e.target.files) as File[];
                            const path = files[0].webkitRelativePath.split("/")[0];
                            setDirectoryPath(path || "");
                            setSelectedFiles(files);
                            uiToast({
                              title: "Directory Selected",
                              description: `Selected directory with ${files.length} file(s)`,
                            });
                          }
                        };
                        input.click();
                      }}
                      disabled={isUploading}
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Browse
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click Browse to select a folder containing lesson JSON files
                    {selectedFiles.length > 0 && (
                      <span className="block mt-1 text-green-600">
                        ✓ {selectedFiles.length} file(s) selected
                      </span>
                    )}
                  </p>
                </div>
                
                <Button
                  onClick={handleDirectoryUpload}
                  disabled={selectedFiles.length === 0 || isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      {uploadProgress.step === 'verifying' ? 'Verifying...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Lessons from Directory
                    </>
                  )}
                </Button>

                {/* Progress Bar */}
                {isUploading && uploadProgress.total > 0 && (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {uploadProgress.step === 'verifying' ? 'Verifying' : 'Uploading'}
                      </span>
                      <span className="text-gray-600">
                        {uploadProgress.current} of {uploadProgress.total}
                      </span>
                    </div>
                    <Progress 
                      value={(uploadProgress.current / uploadProgress.total) * 100} 
                      className="h-3"
                    />
                    <p className="text-xs text-gray-500 text-center">
                      {uploadProgress.message}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
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
      
      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Upload Errors
            </DialogTitle>
            <DialogDescription>
              The following errors occurred during the upload process:
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh] w-full rounded-md border p-4">
            <div className="space-y-2">
              {errorMessages.map((error, index) => (
                <div
                  key={index}
                  className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2"
                >
                  {error}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              Please fix the errors above and try again.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowErrorDialog(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TherapistMyProfile;


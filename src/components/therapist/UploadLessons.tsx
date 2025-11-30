import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FolderOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Constants } from '@/integrations/supabase/types';
import { getQuestionTypes, isValidQuestionType } from '@/utils/questionTypes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface UploadLessonsProps {
  userId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UploadLessons: React.FC<UploadLessonsProps> = ({ userId, open, onOpenChange }) => {
  const { toast: uiToast } = useToast();
  const [directoryPath, setDirectoryPath] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState({
    step: 'idle' as 'idle' | 'verifying' | 'uploading',
    current: 0,
    total: 0,
    message: ''
  });

  // Helper function to upload image to Supabase storage
  const uploadImageToStorage = async (file: File, imagePath: string, questionType: string, lessonName: string): Promise<string | null> => {
    try {
      // Sanitize question type and lesson name for filesystem safety
      const sanitizedQuestionType = questionType.replace(/[^a-zA-Z0-9.-]/g, '_');
      const sanitizedLessonName = lessonName.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      // Create a unique filename to avoid conflicts
      const timestamp = Date.now();
      const sanitizedPath = imagePath.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedPath}`;
      
      // Create prefix path: question_type/lesson_name/
      const prefixPath = `${sanitizedQuestionType}/${sanitizedLessonName}/`;
      const fullPath = `${prefixPath}${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('question-images-v2')
        .upload(fullPath, file, {
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
        .getPublicUrl(fullPath);

      return urlData.publicUrl;
    } catch (error) {
      console.error(`Error uploading image ${imagePath}:`, error);
      return null;
    }
  };

  // Helper function to upload video to Supabase storage
  const uploadVideoToStorage = async (file: File, videoPath: string, questionType: string, lessonName: string): Promise<string | null> => {
    try {
      // Sanitize question type and lesson name for filesystem safety
      const sanitizedQuestionType = questionType.replace(/[^a-zA-Z0-9.-]/g, '_');
      const sanitizedLessonName = lessonName.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      // Create a unique filename to avoid conflicts
      const timestamp = Date.now();
      const sanitizedPath = videoPath.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedPath}`;
      
      // Create prefix path: question_type/lesson_name/videos/
      const prefixPath = `${sanitizedQuestionType}/${sanitizedLessonName}/videos/`;
      const fullPath = `${prefixPath}${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('question-images-v2')
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error(`Error uploading video ${videoPath}:`, error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('question-images-v2')
        .getPublicUrl(fullPath);

      return urlData.publicUrl;
    } catch (error) {
      console.error(`Error uploading video ${videoPath}:`, error);
      return null;
    }
  };

  // Helper function to find a file in the selected files by relative path
  // dirPath is the directory path context to ensure we only match files from the correct directory
  const findFileByPath = (files: File[], relativePath: string, dirPath: string): File | null => {
    // Normalize paths: remove leading/trailing slashes, normalize separators, and decode URL encoding
    // This handles filenames with spaces and other special characters
    const normalizePath = (path: string) => {
      try {
        // Decode URL-encoded characters (e.g., %20 -> space, handles filenames with spaces)
        let decoded = decodeURIComponent(path);
        // Normalize path separators (Windows to Unix)
        decoded = decoded.replace(/\\/g, '/');
        // Remove leading/trailing slashes
        decoded = decoded.replace(/^\/+|\/+$/g, '');
        return decoded;
      } catch (e) {
        // If decoding fails (path might not be URL-encoded), just normalize separators
        // This preserves spaces and other characters as-is
        return path.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
      }
    };
    
    const normalizedDirPath = normalizePath(dirPath);
    const normalizedRelativePath = normalizePath(relativePath);
    
    // Try exact match first
    for (const file of files) {
      const filePath = (file as any).webkitRelativePath || file.name;
      const normalizedFilePath = normalizePath(filePath);
      
      // Check if file path exactly matches the relative path (within the directory context)
      if (normalizedFilePath === normalizedRelativePath) {
        return file;
      }
      
      // Check if file path ends with the relative path (more precise than includes)
      // This handles cases where the relativePath might be a subpath
      if (normalizedFilePath.endsWith(normalizedRelativePath)) {
        // Ensure it's within the correct directory context
        if (normalizedDirPath && normalizedFilePath.startsWith(normalizedDirPath)) {
          return file;
        }
        // If no directory context, still match if it ends correctly
        if (!normalizedDirPath) {
          return file;
        }
      }
      
      // Check if file is in the directory and path matches
      if (normalizedDirPath && normalizedFilePath.startsWith(normalizedDirPath + '/')) {
        const relativePart = normalizedFilePath.substring(normalizedDirPath.length + 1);
        if (relativePart === normalizedRelativePath || relativePart.endsWith('/' + normalizedRelativePath)) {
          return file;
        }
      }
    }
    
    // Fallback: try to match by filename only, but only within the directory context
    // This handles cases where the path structure might differ but the filename matches
    const fileName = normalizedRelativePath.split('/').pop() || normalizedRelativePath;
    if (fileName !== normalizedRelativePath) { // Only if it was a path, not just a filename
      for (const file of files) {
        const filePath = (file as any).webkitRelativePath || file.name;
        const normalizedFilePath = normalizePath(filePath);
        
        // Only match if filename matches AND it's in the correct directory
        // Compare the actual file.name (which preserves spaces) with the extracted fileName
        if (file.name === fileName) {
          if (normalizedDirPath && normalizedFilePath.startsWith(normalizedDirPath)) {
            return file;
          }
          // If no directory context, match by name (but this is less safe)
          if (!normalizedDirPath) {
            return file;
          }
        }
      }
    }
    
    return null;
  };

  // Valid question_type_enum values - fetched from database enum via types
  const validQuestionTypes = getQuestionTypes();

  // Verification function to check lessons before upload
  const verifyLessons = async (
    directoryMap: Map<string, { lessonFile: File; imageFiles: File[]; videoFiles: File[] }>,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ isValid: boolean; errors: string[] }> => {
    const verificationErrors: string[] = [];
    const entries = Array.from(directoryMap.entries());
    const totalEntries = entries.length;

    // Verify each directory
    for (let index = 0; index < entries.length; index++) {
      const [dirPath, { lessonFile, imageFiles, videoFiles }] = entries[index];
      try {
        const text = await lessonFile.text();
        const lessonData = JSON.parse(text);

        // Validate question_type
        let questionType = lessonData.question_type;
        
        // Handle mapping for common variations
        if (questionType === 'story_time') {
          questionType = 'story_activity';
        }

        // Use type guard for validation
        if (!isValidQuestionType(questionType)) {
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
            const imageFile = findFileByPath(imageFiles, imagePath, dirPath);
            
            if (!imageFile) {
              verificationErrors.push(`${dirPath}: Question ${i + 1} - Image file not found: "${imagePath}"`);
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
              const imageFile = findFileByPath(imageFiles, imagePath, dirPath);
              
              if (!imageFile) {
                verificationErrors.push(`${dirPath}: Question ${i + 1} - Choices image file not found: "${imagePath}"`);
              }
            }
          }

          // Check question_video
          if (question.question_video) {
            const videoPath = question.question_video;
            const videoFile = findFileByPath(videoFiles, videoPath, dirPath);
            
            if (!videoFile) {
              verificationErrors.push(`${dirPath}: Question ${i + 1} - Video file not found for question_video: "${videoPath}"`);
            }
          }

          // Check video_after_answer
          if (question.video_after_answer) {
            const videoPath = question.video_after_answer;
            const videoFile = findFileByPath(videoFiles, videoPath, dirPath);
            
            if (!videoFile) {
              verificationErrors.push(`${dirPath}: Question ${i + 1} - Video file not found for video_after_answer: "${videoPath}"`);
            }
          }

          // Check image_after_answer
          if (question.image_after_answer) {
            const imagePath = question.image_after_answer;
            const imageFile = findFileByPath(imageFiles, imagePath, dirPath);
            
            if (!imageFile) {
              verificationErrors.push(`${dirPath}: Question ${i + 1} - Image file not found for image_after_answer: "${imagePath}"`);
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
      const directoryMap = new Map<string, { lessonFile: File; imageFiles: File[]; videoFiles: File[] }>();
      
      // Find all lesson.json files and group with their directory files
      for (const file of selectedFiles) {
        const filePath = (file as any).webkitRelativePath || file.name;
        const pathParts = filePath.split('/');
        
        // Find lesson.json files
        if (file.name === 'lesson.json' || filePath.endsWith('/lesson.json')) {
          // Get directory path (everything before lesson.json)
          const dirPath = pathParts.slice(0, -1).join('/');
          
          if (!directoryMap.has(dirPath)) {
            directoryMap.set(dirPath, { lessonFile: file, imageFiles: [], videoFiles: [] });
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

      // Add video files to their respective directories
      for (const file of selectedFiles) {
        if (file.type.startsWith('video/')) {
          const filePath = (file as any).webkitRelativePath || file.name;
          const pathParts = filePath.split('/');
          const dirPath = pathParts.slice(0, -1).join('/');
          
          if (directoryMap.has(dirPath)) {
            directoryMap.get(dirPath)!.videoFiles.push(file);
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
      for (const [dirPath, { lessonFile, imageFiles, videoFiles }] of directoryMap.entries()) {
        try {
          const text = await lessonFile.text();
          const lessonData = JSON.parse(text);

          // Validate question_type
          let questionType = lessonData.question_type;
          
          // Handle mapping for common variations
          if (questionType === 'story_time') {
            questionType = 'story_activity';
          }

          // Use type guard for validation
          if (!isValidQuestionType(questionType)) {
            const errorMsg = `${dirPath}: Invalid question_type "${lessonData.question_type}". Valid types are: ${validQuestionTypes.join(', ')}`;
            ignoredDirectories.push(errorMsg);
            allErrors.push(errorMsg);
            errorCount++;
            continue;
          }

          // Determine lesson name
          const lessonName = lessonData.lesson || lessonData.name || lessonData.lesson_name || dirPath.split('/').pop() || 'Untitled Lesson';
          
          // Extract lesson text from lesson.json (this will be saved in the lesson column for all questions)
          const lessonText = lessonData.lesson || null;

          // Create lesson record in lessons_v2
          const lessonRecord = {
            name: lessonName,
            description: lessonData.description || null,
            question_type: questionType,
            level: lessonData.level || lessonData.difficulty_level || 'beginner',
            is_verified: false,
            youtube_video_id: lessonData.youtube_video_id || null,
            add_mini_celebration: lessonData.add_mini_celebration !== undefined ? lessonData.add_mini_celebration : true,
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
                const imageFile = findFileByPath(imageFiles, imagePath, dirPath);
                
                if (imageFile) {
                  questionImageUrl = await uploadImageToStorage(imageFile, imagePath, questionType, lessonName);
                  if (!questionImageUrl) {
                    console.warn(`Failed to upload question_image: ${imagePath}`);
                  }
                } else {
                  console.warn(`Could not find image file for path: ${imagePath} in directory: ${dirPath}`);
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
                  const imageFile = findFileByPath(imageFiles, imagePath, dirPath);
                  
                  if (imageFile) {
                    const url = await uploadImageToStorage(imageFile, imagePath, questionType, lessonName);
                    if (url) {
                      uploadedUrls.push(url);
                    }
                  } else {
                    console.warn(`Could not find choices image file for path: ${imagePath} in directory: ${dirPath}`);
                  }
                }
                
                if (uploadedUrls.length > 0) {
                  choicesImageUrls = uploadedUrls.join(',');
                }
              }

              // Handle question_video upload
              let questionVideoBeforeUrl: string = '';
              if (question.question_video) {
                const videoPath = question.question_video;
                const videoFile = findFileByPath(videoFiles, videoPath, dirPath);
                
                if (videoFile) {
                  const uploadedUrl = await uploadVideoToStorage(videoFile, videoPath, questionType, lessonName);
                  if (uploadedUrl) {
                    questionVideoBeforeUrl = uploadedUrl;
                  } else {
                    console.warn(`Failed to upload question_video: ${videoPath}`);
                  }
                } else {
                  console.warn(`Could not find video file for path: ${videoPath} in directory: ${dirPath}`);
                }
              }

              // Handle video_after_answer upload
              let questionVideoAfterUrl: string = '';
              if (question.video_after_answer) {
                const videoPath = question.video_after_answer;
                const videoFile = findFileByPath(videoFiles, videoPath, dirPath);
                
                if (videoFile) {
                  const uploadedUrl = await uploadVideoToStorage(videoFile, videoPath, questionType, lessonName);
                  if (uploadedUrl) {
                    questionVideoAfterUrl = uploadedUrl;
                  } else {
                    console.warn(`Failed to upload video_after_answer: ${videoPath}`);
                  }
                } else {
                  console.warn(`Could not find video file for path: ${videoPath} in directory: ${dirPath}`);
                }
              }

              // Handle image_after_answer upload
              let questionImageAfterUrl: string = '';
              if (question.image_after_answer) {
                const imagePath = question.image_after_answer;
                const imageFile = findFileByPath(imageFiles, imagePath, dirPath);
                
                if (imageFile) {
                  const uploadedUrl = await uploadImageToStorage(imageFile, imagePath, questionType, lessonName);
                  if (uploadedUrl) {
                    questionImageAfterUrl = uploadedUrl;
                  } else {
                    console.warn(`Failed to upload image_after_answer: ${imagePath}`);
                  }
                } else {
                  console.warn(`Could not find image file for path: ${imagePath} in directory: ${dirPath}`);
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
                question_video: questionVideoBeforeUrl,
                video_after_answer: questionVideoAfterUrl,
                image_after_answer: questionImageAfterUrl,
                speech_after_answer: question.speech_after_answer || '',
                question_type: questionType,
                lesson_id: lessonId,
                lesson: lessonText,
                question_index: i,
                created_by: userId || null,
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
        setSuccessCount(successCount);
        setShowSuccessDialog(true);
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Lessons
            </DialogTitle>
            <DialogDescription>
              Select a directory containing lesson JSON files to upload
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              Upload Successful
            </DialogTitle>
            <DialogDescription>
              Your lessons have been uploaded successfully
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 font-medium">
                Successfully uploaded {successCount} lesson(s)
              </p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> Your lessons will appear in the lesson plan only after an admin reviews and approves them. Please wait for the review process to complete.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                setShowSuccessDialog(false);
                onOpenChange(false);
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </>
  );
};

export default UploadLessons;


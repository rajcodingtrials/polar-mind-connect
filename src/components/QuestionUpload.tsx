
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, Image, Trash2, Tag, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { getQuestionTypeLabel, initializeQuestionTypesCache, type QuestionType } from '@/utils/questionTypes';
import { useQuestionTypes } from '@/hooks/useQuestionTypes';

interface Lesson {
  id: string;
  name: string;
  description: string | null;
  question_type: QuestionType;
  difficulty_level: string;
  is_active: boolean;
}

interface Question {
  id: string;
  question: string;
  answer: string;
  imageName?: string;
  images?: string[];
  correctImageIndex?: number;
  questionType?: string;
  // Story activity fields
  scene_image?: string;
  scene_narration?: string;
  sequence_number?: number;
  is_scene?: boolean;
}

interface QuestionUploadProps {
  onQuestionsUploaded?: (questions: Question[], images: File[], questionType: string) => void;
  clearTrigger?: boolean;
}

const QuestionUpload = ({ onQuestionsUploaded, clearTrigger }: QuestionUploadProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType>('question_time');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [isNewLesson, setIsNewLesson] = useState(false);
  const [enableLessonMode, setEnableLessonMode] = useState(false);
  
  // New lesson fields
  const [newLessonName, setNewLessonName] = useState('');
  const [newLessonDescription, setNewLessonDescription] = useState('');
  const [newLessonDifficulty, setNewLessonDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  
  const { toast } = useToast();

  // Load question types from database
  const { questionTypes: questionTypesData } = useQuestionTypes();

  // Initialize cache on mount
  useEffect(() => {
    initializeQuestionTypesCache();
  }, []);

  // Clear all form state
  const clearForm = () => {
    setQuestions([]);
    setImages([]);
    setSelectedQuestionType('question_time');
    setLessons([]);
    setSelectedLesson('');
    setIsNewLesson(false);
    setEnableLessonMode(false);
    setNewLessonName('');
    setNewLessonDescription('');
    setNewLessonDifficulty('beginner');
  };

  // Effect to clear form when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      clearForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearTrigger]);

  const questionTypes = questionTypesData.map((qt) => ({
    value: qt.name as QuestionType,
    label: qt.name === 'story_activity' 
      ? 'Story Activity (5 Scenes + 4 Questions)' 
      : qt.display_string
  }));

  const difficultyLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  // Fetch lessons when activity type changes
  useEffect(() => {
    if (selectedQuestionType && enableLessonMode) {
      fetchLessons(selectedQuestionType);
    } else {
      setLessons([]);
      setSelectedLesson('');
    }
  }, [selectedQuestionType, enableLessonMode]);

  // Reset lesson selection when switching to new lesson
  useEffect(() => {
    if (isNewLesson) {
      setSelectedLesson('new');
    }
  }, [isNewLesson]);





  const fetchLessons = async (activityType: QuestionType) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('question_type', activityType)
        .eq('is_active', true)
        .order('name');

      if (error) {
        // Table doesn't exist yet - this is expected before migration
        setLessons([]);
        return;
      }

      setLessons(data || []);
    } catch (error) {
      // Table doesn't exist yet - this is expected before migration
      setLessons([]);
    }
  };

  const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        if (Array.isArray(jsonData)) {
          const formattedQuestions = jsonData.map((item, index) => ({
            id: `q_${index}`,
            question: item.question || '',
            answer: item.answer || '',
            imageName: item.imageName || item.image || '',
            images: item.images || undefined,
            correctImageIndex: item.correctImageIndex ?? undefined,
            questionType: item.questionType || selectedQuestionType,
            // Story activity fields
            scene_image: item.scene_image || item.sceneImage,
            scene_narration: item.scene_narration || item.sceneNarration,
            sequence_number: item.sequence_number ?? item.sequenceNumber ?? (index + 1),
            is_scene: item.is_scene ?? item.isScene ?? false
          }));
          
          // Validate story_activity questions
          if (selectedQuestionType === 'story_activity') {
            if (formattedQuestions.length !== 9) {
              toast({
                title: "Invalid Story Format",
                description: `Story Activity must have exactly 9 entries (5 scenes + 4 questions). You provided ${formattedQuestions.length} entries.`,
                variant: "destructive",
              });
              return;
            }

            const sequences = formattedQuestions.map(q => q.sequence_number).sort((a, b) => (a || 0) - (b || 0));
            const expectedSequences = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            if (JSON.stringify(sequences) !== JSON.stringify(expectedSequences)) {
              toast({
                title: "Invalid Sequence Numbers",
                description: "Story must have sequence_numbers from 1 to 9 with no gaps or duplicates",
                variant: "destructive",
              });
              return;
            }

            const oddEntries = formattedQuestions.filter(q => q.sequence_number && q.sequence_number % 2 === 1);
            const evenEntries = formattedQuestions.filter(q => q.sequence_number && q.sequence_number % 2 === 0);

            if (oddEntries.length !== 5 || oddEntries.some(q => !q.is_scene)) {
              toast({
                title: "Invalid Story Structure",
                description: "Sequence numbers 1,3,5,7,9 must be scenes with is_scene: true",
                variant: "destructive",
              });
              return;
            }

            if (evenEntries.length !== 4 || evenEntries.some(q => q.is_scene)) {
              toast({
                title: "Invalid Story Structure",
                description: "Sequence numbers 2,4,6,8 must be questions with is_scene: false",
                variant: "destructive",
              });
              return;
            }

            const invalidScenes = oddEntries.filter(q => !q.scene_image || !q.scene_narration);
            if (invalidScenes.length > 0) {
              toast({
                title: "Invalid Scene Data",
                description: "All scenes (1,3,5,7,9) must have scene_image and scene_narration fields",
                variant: "destructive",
              });
              return;
            }

            const invalidQuestions = evenEntries.filter(q => 
              !q.images || 
              q.images.length !== 2 || 
              q.correctImageIndex === undefined ||
              q.correctImageIndex < 0 ||
              q.correctImageIndex > 1
            );
            if (invalidQuestions.length > 0) {
              toast({
                title: "Invalid Question Data",
                description: "All questions (2,4,6,8) must have exactly 2 images and correctImageIndex (0 or 1)",
                variant: "destructive",
              });
              return;
            }
          }
          
          // Validate tap_and_play questions
          if (selectedQuestionType === 'tap_and_play') {
            const invalidQuestions = formattedQuestions.filter(q => 
              !q.images || !Array.isArray(q.images) || q.images.length !== 2 || q.correctImageIndex === undefined
            );
            
            if (invalidQuestions.length > 0) {
              toast({
                title: "Invalid Tap and Play Questions",
                description: `${invalidQuestions.length} questions are missing required fields for Tap and Play (images array with 2 items and correctImageIndex)`,
                variant: "destructive",
              });
              return;
            }
          }
          
          setQuestions(formattedQuestions);
          toast({
            title: "Questions loaded",
            description: `Loaded ${formattedQuestions.length} questions from JSON file`,
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Invalid JSON file format",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(prev => [...prev, ...files]);
    toast({
      title: "Images uploaded",
      description: `Added ${files.length} images`,
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (questions.length === 0) {
      toast({
        title: "Error",
        description: "Please upload a questions JSON file first",
        variant: "destructive",
      });
      return;
    }

    if (!selectedQuestionType) {
      toast({
        title: "Error",
        description: "Please select a question type",
        variant: "destructive",
      });
      return;
    }

    // If lesson mode is enabled, validate lesson selection
    if (enableLessonMode) {
      if (!selectedLesson) {
        toast({
          title: "Error",
          description: "Please select a lesson or create a new one",
          variant: "destructive",
        });
        return;
      }

      if (isNewLesson && !newLessonName.trim()) {
        toast({
          title: "Error",
          description: "Please enter a lesson name",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      let lessonId: string | null = null;

      // If creating a new lesson
      if (enableLessonMode && isNewLesson) {
        try {
          const { data: newLesson, error: lessonError } = await supabase
            .from('lessons')
            .insert({
              name: newLessonName.trim(),
              description: newLessonDescription.trim() || null,
              question_type: selectedQuestionType,
              difficulty_level: newLessonDifficulty,
              is_active: true
            })
            .select()
            .single();

          if (lessonError) {
            toast({
              title: "Info",
              description: "Lesson creation failed (database table may not exist). Questions will be uploaded without lesson assignment.",
            });
            // Continue without lesson assignment
          } else {
            lessonId = newLesson.id;
            toast({
              title: "Success",
              description: `Created new lesson: ${newLessonName}`,
            });
          }
        } catch (error) {
          toast({
            title: "Info",
            description: "Lesson creation failed (database table may not exist). Questions will be uploaded without lesson assignment.",
          });
        }
      } else if (enableLessonMode && selectedLesson !== 'new') {
        // Using existing lesson
        lessonId = selectedLesson;
      }

      // Upload images first
      const imageUploadPromises = images.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('question-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          throw uploadError;
        }

        return { originalName: file.name, storageName: fileName };
      });

      const uploadedImages = await Promise.all(imageUploadPromises);
      
      // Create a mapping from original names to storage names
      const imageNameMap = uploadedImages.reduce((acc, img) => {
        acc[img.originalName] = img.storageName;
        return acc;
      }, {} as Record<string, string>);

      // Prepare questions with lesson_id and new tap_and_play/story_activity fields
      const questionsToInsert = questions.map(q => ({
        question: q.question,
        answer: q.answer,
        image_name: q.imageName ? imageNameMap[q.imageName] : null,
        images: q.images ? q.images.map(img => imageNameMap[img] || img) : null,
        correct_image_index: q.correctImageIndex ?? null,
        question_type: selectedQuestionType,
        lesson_id: lessonId,
        // Story activity fields
        scene_image: q.scene_image ? imageNameMap[q.scene_image] || q.scene_image : null,
        scene_narration: q.scene_narration || null,
        sequence_number: q.sequence_number || 0,
        is_scene: q.is_scene || false
      }));

      // Insert questions with lesson assignment
      const { error: dbError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (dbError) {
        console.error('Error saving questions:', dbError);
        throw dbError;
      }

      // Show success message
      if (lessonId) {
        toast({
          title: "Success",
          description: `Uploaded ${questions.length} questions and ${images.length} images with lesson assignment!`,
        });
      } else {
        toast({
          title: "Success",
          description: `Uploaded ${questions.length} questions and ${images.length} images to Supabase`,
        });
      }

      // Reset lesson fields if creating new lesson
      if (isNewLesson) {
        setNewLessonName('');
        setNewLessonDescription('');
        setNewLessonDifficulty('beginner');
        setIsNewLesson(false);
        setSelectedLesson('');
      }
      // Clear all form state after successful upload
      clearForm();
    } catch (error) {
      console.error('Error in lesson handling:', error);
      // Fall back to original upload without lesson assignment
      try {
        // Upload images first
        const imageUploadPromises = images.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('question-images')
            .upload(fileName, file);

          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw uploadError;
          }

          return { originalName: file.name, storageName: fileName };
        });

        const uploadedImages = await Promise.all(imageUploadPromises);
        
        // Create a mapping from original names to storage names
        const imageNameMap = uploadedImages.reduce((acc, img) => {
          acc[img.originalName] = img.storageName;
          return acc;
        }, {} as Record<string, string>);

        // Prepare questions without lesson_id but with new tap_and_play fields
        const questionsToInsert = questions.map(q => ({
          question: q.question,
          answer: q.answer,
          image_name: q.imageName ? imageNameMap[q.imageName] : null,
          images: q.images ? q.images.map(img => imageNameMap[img] || img) : null, // Map image names to storage names
          correct_image_index: q.correctImageIndex ?? null, // Include correct image index for tap_and_play
          question_type: selectedQuestionType,
          lesson_id: null // No lesson assignment
        }));

        // Insert questions
        const { error: dbError } = await supabase
          .from('questions')
          .insert(questionsToInsert);

        if (dbError) {
          console.error('Error saving questions:', dbError);
          throw dbError;
        }

        toast({
          title: "Success",
          description: `Uploaded ${questions.length} questions and ${images.length} images (lesson assignment failed)`,
        });
      } catch (fallbackError) {
        console.error('Fallback upload failed:', fallbackError);
        toast({
          title: "Error",
          description: "Failed to upload questions and images",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Questions & Images
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* JSON File Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            <FileText className="w-4 h-4 inline mr-1" />
            Questions JSON File
          </label>
          <Input
            type="file"
            accept=".json"
            onChange={handleJsonUpload}
            className="cursor-pointer"
          />
          <p className="text-xs text-gray-600">
            <strong>For regular activities:</strong> {`[{"question": "What is this?", "answer": "apple", "imageName": "apple.jpg"}]`}<br/>
            <strong>For Tap and Play:</strong> {`[{"question": "Which one is a cat?", "answer": "cat", "images": ["cat.jpg", "dog.jpg"], "correctImageIndex": 0}]`}
          </p>
        </div>

        {/* Images Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            <Image className="w-4 h-4 inline mr-1" />
            Images
          </label>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="cursor-pointer"
          />
        </div>

        {/* Question Type Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            <Tag className="w-4 h-4 inline mr-1" />
            Question Type
          </label>
          <Select value={selectedQuestionType} onValueChange={(value) => setSelectedQuestionType(value as QuestionType)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select question type" />
            </SelectTrigger>
            <SelectContent>
              {questionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lesson Mode Toggle */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="lesson-mode"
              checked={enableLessonMode}
              onChange={(e) => setEnableLessonMode(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="lesson-mode" className="text-sm font-medium flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Organize by Lessons
            </Label>
          </div>
          <p className="text-xs text-gray-600">
            Enable to organize questions into specific lessons within the activity type
          </p>
          

        </div>

        {/* Lesson Selection */}
        {enableLessonMode && selectedQuestionType && (
          <div className="space-y-2">
            <Label htmlFor="lesson">Lesson</Label>
            <Select 
              value={selectedLesson} 
              onValueChange={(value) => {
                setSelectedLesson(value);
                if (value === 'new') {
                  setIsNewLesson(true);
                } else {
                  setIsNewLesson(false);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select lesson or create new" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">
                  + Create New Lesson
                </SelectItem>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.name} ({lesson.difficulty_level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Info message when no lessons exist */}
            {lessons.length === 0 && (
              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                No existing lessons found. You can create a new lesson or run the database migration first.
              </p>
            )}
          </div>
        )}

        {/* New Lesson Fields */}
        {enableLessonMode && isNewLesson && selectedQuestionType && (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium text-gray-900">New Lesson Details</h4>
            
            <div className="space-y-2">
              <Label htmlFor="lesson-name">Lesson Name *</Label>
              <Input
                id="lesson-name"
                value={newLessonName}
                onChange={(e) => setNewLessonName(e.target.value)}
                placeholder="Enter lesson name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-description">Description</Label>
              <Textarea
                id="lesson-description"
                value={newLessonDescription}
                onChange={(e) => setNewLessonDescription(e.target.value)}
                placeholder="Enter lesson description (optional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={newLessonDifficulty} onValueChange={(value) => setNewLessonDifficulty(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficultyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Loaded Questions Preview */}
        {questions.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Loaded Questions ({questions.length})</h3>
            <div className="max-h-32 overflow-y-auto space-y-2 bg-gray-50 p-3 rounded-lg">
              {questions.slice(0, 5).map((q, index) => (
                <div key={q.id} className="text-sm p-2 bg-white rounded border">
                  <div className="font-medium">Q: {q.question}</div>
                  <div className="text-gray-600">A: {q.answer}</div>
                  {q.questionType && (
                    <div className="text-xs text-gray-500 mt-1">
                      Type: {questionTypes.find(t => t.value === q.questionType)?.label}
                    </div>
                  )}
                </div>
              ))}
              {questions.length > 5 && (
                <p className="text-xs text-gray-500 text-center py-2">
                  ...and {questions.length - 5} more questions
                </p>
              )}
            </div>
          </div>
        )}

        {/* Uploaded Images Preview */}
        {images.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Uploaded Images ({images.length})</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <div className="bg-white border p-2 rounded text-xs flex items-center gap-2 min-w-0">
                      <Image className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate max-w-24">{img.name}</span>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-1 -right-1 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="w-2 h-2" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={questions.length === 0 || !selectedQuestionType}
          >
            Upload Questions & Images
          </Button>
        </div>

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <strong>Note:</strong> Uploaded questions and images will be stored in Supabase and 
          made available for all speech therapy sessions.
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionUpload;

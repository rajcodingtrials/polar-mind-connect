import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import QuestionUpload from '../components/QuestionUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUserRole } from '../hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Question {
  id: string;
  question: string;
  answer: string;
  imageName?: string;
}

const Admin = () => {
  const { role, loading } = useUserRole();
  const [defaultChatMode, setDefaultChatMode] = useState('free');
  const { toast } = useToast();

  useEffect(() => {
    const savedMode = localStorage.getItem('defaultChatMode');
    if (savedMode) {
      setDefaultChatMode(savedMode);
    }
  }, []);

  const handleQuestionsUploaded = async (questions: Question[], images: File[]) => {
    try {
      // First, upload images to Supabase storage
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

      // Then, save questions to database with updated image names
      const questionsToInsert = questions.map(q => ({
        question: q.question,
        answer: q.answer,
        image_name: q.imageName ? imageNameMap[q.imageName] : null
      }));

      const { error: dbError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (dbError) {
        console.error('Error saving questions:', dbError);
        throw dbError;
      }

      toast({
        title: "Success",
        description: `Uploaded ${questions.length} questions and ${images.length} images to Supabase`,
      });

      console.log('Successfully uploaded to Supabase:', questions.length, 'questions,', images.length, 'images');
    } catch (error) {
      console.error('Error uploading to Supabase:', error);
      toast({
        title: "Error",
        description: "Failed to upload questions and images to Supabase",
        variant: "destructive",
      });
    }
  };

  const handleDefaultModeChange = (isStructured: boolean) => {
    const mode = isStructured ? 'structured' : 'free';
    setDefaultChatMode(mode);
    localStorage.setItem('defaultChatMode', mode);
    console.log('Default chat mode changed to:', mode);
  };

  const clearStoredData = async () => {
    try {
      // Clear questions from database
      const { error: dbError } = await supabase
        .from('questions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (dbError) {
        console.error('Error clearing questions:', dbError);
      }

      // Clear images from storage
      const { data: files } = await supabase.storage
        .from('question-images')
        .list();

      if (files && files.length > 0) {
        const filePaths = files.map(file => file.name);
        const { error: storageError } = await supabase.storage
          .from('question-images')
          .remove(filePaths);

        if (storageError) {
          console.error('Error clearing images:', storageError);
        }
      }

      // Clear localStorage
      localStorage.removeItem('adminQuestions');
      localStorage.removeItem('adminImages');
      localStorage.removeItem('defaultChatMode');
      setDefaultChatMode('free');
      
      toast({
        title: "Success",
        description: "Cleared all stored data from Supabase and localStorage",
      });

      console.log('Cleared all stored data from Supabase and localStorage');
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Error",
        description: "Failed to clear some data",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading...</span>
          </div>
        </main>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600">
                You don't have permission to access this page.
              </p>
              <p className="text-center text-sm text-gray-500 mt-2">
                Your role: {role || 'No role assigned'}
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage questions, images, and chat settings</p>
          </div>

          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Chat Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="default-mode">Default Chat Mode</Label>
                  <p className="text-sm text-gray-600">
                    Choose whether new chats start in structured Q&A mode or free chat mode
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="default-mode" className="text-sm">Free Chat</Label>
                  <Switch
                    id="default-mode"
                    checked={defaultChatMode === 'structured'}
                    onCheckedChange={handleDefaultModeChange}
                  />
                  <Label htmlFor="default-mode" className="text-sm">Q&A Mode</Label>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={clearStoredData}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Clear All Stored Data
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  This will remove all uploaded questions and images from Supabase
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upload Section */}
          <QuestionUpload onQuestionsUploaded={handleQuestionsUploaded} />
        </div>
      </main>
    </div>
  );
};

export default Admin;


import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import QuestionUpload from '../components/QuestionUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUserRole } from '../hooks/useUserRole';
import { Loader2 } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  answer: string;
  imageName?: string;
}

const Admin = () => {
  const { role, loading } = useUserRole();
  const [defaultChatMode, setDefaultChatMode] = useState('free');

  useEffect(() => {
    const savedMode = localStorage.getItem('defaultChatMode');
    if (savedMode) {
      setDefaultChatMode(savedMode);
    }
  }, []);

  const handleQuestionsUploaded = async (questions: Question[], images: File[]) => {
    // Store questions in localStorage
    localStorage.setItem('adminQuestions', JSON.stringify(questions));
    
    // Convert images to base64 and store in localStorage
    const imagePromises = images.map(async (file) => {
      return new Promise<{name: string, data: string, type: string}>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1]; // Remove data:image/...;base64, prefix
          resolve({
            name: file.name,
            data: base64,
            type: file.type
          });
        };
        reader.readAsDataURL(file);
      });
    });

    try {
      const imageData = await Promise.all(imagePromises);
      localStorage.setItem('adminImages', JSON.stringify(imageData));
      console.log('Admin uploaded questions:', questions.length, 'Images:', images.length);
    } catch (error) {
      console.error('Error storing images:', error);
    }
  };

  const handleDefaultModeChange = (isStructured: boolean) => {
    const mode = isStructured ? 'structured' : 'free';
    setDefaultChatMode(mode);
    localStorage.setItem('defaultChatMode', mode);
    console.log('Default chat mode changed to:', mode);
  };

  const clearStoredData = () => {
    localStorage.removeItem('adminQuestions');
    localStorage.removeItem('adminImages');
    localStorage.removeItem('defaultChatMode');
    setDefaultChatMode('free');
    console.log('Cleared all stored admin data');
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
                  This will remove all uploaded questions and images
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

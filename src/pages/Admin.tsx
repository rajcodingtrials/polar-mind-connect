
import React, { useState } from 'react';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuestionUpload from '../components/QuestionUpload';
import { useUserProfile } from '../hooks/useUserProfile';
import { useUserRole } from '../hooks/useUserRole';
import { Upload, Settings, MessageCircle, FileQuestion, AlertTriangle } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  answer: string;
  imageName?: string;
}

const Admin = () => {
  const { profile } = useUserProfile();
  const { role, loading: roleLoading, isAdmin } = useUserRole();
  const [showUpload, setShowUpload] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [defaultChatMode, setDefaultChatMode] = useState<'structured' | 'free'>('free');

  // Show loading while checking role
  if (roleLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking permissions...</p>
          </div>
        </main>
      </div>
    );
  }

  // Check if user has admin role
  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="max-w-md mx-auto bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                You don't have permission to access this page. Admin privileges are required.
              </p>
              {role && (
                <p className="text-sm text-red-600 mt-2">
                  Current role: {role}
                </p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const handleQuestionsUploaded = (uploadedQuestions: Question[], uploadedImages: File[]) => {
    setQuestions(uploadedQuestions);
    setImages(uploadedImages);
    setShowUpload(false);
    console.log('Admin uploaded questions:', uploadedQuestions.length, 'Images:', uploadedImages.length);
    
    // Save to localStorage for now (in production, save to database)
    localStorage.setItem('adminQuestions', JSON.stringify(uploadedQuestions));
    localStorage.setItem('adminImages', JSON.stringify(uploadedImages.map(img => img.name)));
  };

  const toggleDefaultChatMode = () => {
    const newMode = defaultChatMode === 'structured' ? 'free' : 'structured';
    setDefaultChatMode(newMode);
    localStorage.setItem('defaultChatMode', newMode);
    console.log('Default chat mode changed to:', newMode);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto">
          {/* Admin Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-center mb-2">
              Admin Panel
            </h1>
            <p className="text-center text-gray-600">
              Manage questions, images, and chat settings
            </p>
            <p className="text-center text-sm text-green-600 mt-1">
              Welcome, {profile?.name} (Role: {role})
            </p>
          </div>

          {/* Admin Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Question Management */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Question Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setShowUpload(!showUpload)} 
                      variant={showUpload ? "secondary" : "default"}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {showUpload ? 'Hide Upload' : 'Upload Questions'}
                    </Button>
                  </div>
                  
                  {questions.length > 0 && (
                    <div className="text-sm text-green-600 flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      {questions.length} questions loaded, {images.length} images
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Upload JSON files with questions and corresponding images for the Q&A mode.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Settings */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Chat Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Default Chat Mode</h3>
                      <p className="text-sm text-gray-600">
                        Current: {defaultChatMode === 'structured' ? 'Q&A Mode' : 'Free Chat'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleDefaultChatMode}
                      className="flex items-center gap-2"
                    >
                      {defaultChatMode === 'structured' ? 
                        <MessageCircle className="w-4 h-4" /> : 
                        <FileQuestion className="w-4 h-4" />
                      }
                      Switch to {defaultChatMode === 'structured' ? 'Free Chat' : 'Q&A Mode'}
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Set the default mode when users start chatting with Laura.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upload Interface */}
          {showUpload && (
            <div className="flex justify-center mb-8">
              <QuestionUpload onQuestionsUploaded={handleQuestionsUploaded} />
            </div>
          )}

          {/* Current Questions Preview */}
          {questions.length > 0 && (
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Current Questions ({questions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {questions.map((q, index) => (
                    <div key={q.id} className="text-sm p-3 bg-white rounded border">
                      <div className="font-medium text-gray-700">
                        Q{index + 1}: {q.question}
                      </div>
                      <div className="text-gray-600">
                        Answer: {q.answer}
                      </div>
                      {q.imageName && (
                        <div className="text-xs text-blue-600">
                          Image: {q.imageName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import OpenAIChat from '../components/OpenAIChat';
import { useUserProfile } from '../hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  question: string;
  answer: string;
  imageName?: string;
}

const OpenAIChatPage = () => {
  const { profile } = useUserProfile();
  const [showChat, setShowChat] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [imageUrls, setImageUrls] = useState<{[key: string]: string}>({});
  const [useStructuredMode, setUseStructuredMode] = useState(false);
  const [chatKey, setChatKey] = useState(0);

  // Load questions and images from Supabase
  useEffect(() => {
    const loadQuestionsAndImages = async () => {
      try {
        // Load questions from Supabase
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .order('created_at', { ascending: false });

        if (questionsError) {
          console.error('Error loading questions:', questionsError);
          return;
        }

        if (questionsData && questionsData.length > 0) {
          const formattedQuestions = questionsData.map(q => ({
            id: q.id,
            question: q.question,
            answer: q.answer,
            imageName: q.image_name
          }));
          
          setQuestions(formattedQuestions);
          console.log('Loaded questions from Supabase:', formattedQuestions.length);

          // Load image URLs for questions that have images
          const imageUrlMap: {[key: string]: string} = {};
          
          for (const question of formattedQuestions) {
            if (question.imageName) {
              const { data } = supabase.storage
                .from('question-images')
                .getPublicUrl(question.imageName);
              
              if (data?.publicUrl) {
                imageUrlMap[question.imageName] = data.publicUrl;
                console.log(`Loaded image URL for ${question.imageName}:`, data.publicUrl);
              }
            }
          }
          
          setImageUrls(imageUrlMap);
          console.log('Loaded image URLs:', Object.keys(imageUrlMap).length);
        }
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
      }
    };

    loadQuestionsAndImages();

    // Also check localStorage for default mode
    const defaultMode = localStorage.getItem('defaultChatMode');
    if (defaultMode) {
      setUseStructuredMode(defaultMode === 'structured');
    }
  }, []);

  // Listen for storage changes (when admin uploads new content)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminQuestions' && e.newValue) {
        setQuestions(JSON.parse(e.newValue));
      }
      if (e.key === 'adminImages' && e.newValue) {
        try {
          const imageData = JSON.parse(e.newValue);
          const files = imageData.map((item: any) => {
            const byteCharacters = atob(item.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            return new File([byteArray], item.name, { type: item.type });
          });
          setImages(files);
          console.log('Updated images from storage event:', files.length);
        } catch (error) {
          console.error('Error processing updated images:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLauraClick = () => {
    setShowChat(true);
  };

  const handleLawrenceClick = () => {
    // Placeholder for Lawrence functionality
    console.log('Lawrence clicked - functionality to be implemented');
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setChatKey(prev => prev + 1); // Reset chat when closing
  };

  const toggleChatMode = () => {
    console.log('Toggling chat mode from', useStructuredMode, 'to', !useStructuredMode);
    setUseStructuredMode(!useStructuredMode);
    setChatKey(prev => prev + 1); // Force chat component to re-render with new mode
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-center mb-6">
              Welcome, {profile?.name || 'User'}!
            </h1>
          </div>

          {/* Learning Progress Section */}
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Your Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Hope your vacation went great. Let's start from where you left off last week. You have made a great job learning about making effective conversations.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Your Therapists Section */}
            <Card className="lg:col-span-2 bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Your Therapists
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    className="flex items-center space-x-4 cursor-pointer hover:bg-blue-100 p-3 rounded-lg transition-colors"
                    onClick={handleLauraClick}
                  >
                    <Avatar className="h-16 w-16">
                      <AvatarImage 
                        src="/lovable-uploads/Laura.png" 
                        alt="Laura" 
                      />
                      <AvatarFallback className="bg-blue-500 text-white">L</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-800">Laura</h3>
                      <p className="text-gray-600 text-sm">Practiced conversations</p>
                      {questions.length > 0 && (
                        <p className="text-xs text-green-600">{questions.length} questions from Supabase</p>
                      )}
                      {Object.keys(imageUrls).length > 0 && (
                        <p className="text-xs text-blue-600">{Object.keys(imageUrls).length} images loaded</p>
                      )}
                    </div>
                  </div>
                  <div 
                    className="flex items-center space-x-4 cursor-pointer hover:bg-blue-100 p-3 rounded-lg transition-colors"
                    onClick={handleLawrenceClick}
                  >
                    <Avatar className="h-16 w-16">
                      <AvatarImage 
                        src="/lovable-uploads/Lawrence.png" 
                        alt="Lawrence" 
                      />
                      <AvatarFallback className="bg-blue-500 text-white">L</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-800">Lawrence</h3>
                      <p className="text-gray-600 text-sm">Worked on questions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Badges Section */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Your Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-4">
                  <div className="text-center">
                    <img 
                      src="/lovable-uploads/Badge1.png" 
                      alt="Achievement 1" 
                      className="h-16 w-16 mx-auto mb-2"
                    />
                    <p className="text-sm text-gray-600">Achievement 1</p>
                  </div>
                  <div className="text-center">
                    <img 
                      src="/lovable-uploads/Badge2.png" 
                      alt="Achievement 2" 
                      className="h-16 w-16 mx-auto mb-2"
                    />
                    <p className="text-sm text-gray-600">Achievement 2</p>
                  </div>
                  <div className="text-center">
                    <img 
                      src="/lovable-uploads/Badge3.png" 
                      alt="Achievement 3" 
                      className="h-16 w-16 mx-auto mb-2"
                    />
                    <p className="text-sm text-gray-600">Achievement 3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface - only show when Laura is clicked */}
          {showChat && (
            <div className="flex justify-center">
              <OpenAIChat 
                key={chatKey}
                onClose={handleCloseChat}
                questions={questions}
                imageUrls={imageUrls}
                useStructuredMode={useStructuredMode}
                onToggleMode={toggleChatMode}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OpenAIChatPage;

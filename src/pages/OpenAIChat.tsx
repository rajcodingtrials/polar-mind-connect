
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import OpenAIChat from '../components/OpenAIChat';
import { useUserProfile } from '../hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, MessageCircle, Building, Heart } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type QuestionType = Database['public']['Enums']['question_type_enum'];

interface Question {
  id: string;
  question: string;
  answer: string;
  imageName?: string;
  questionType?: QuestionType;
}

const OpenAIChatPage = () => {
  const { profile } = useUserProfile();
  const [showChat, setShowChat] = useState(false);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [imageUrls, setImageUrls] = useState<{[key: string]: string}>({});
  const [useStructuredMode, setUseStructuredMode] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType | null>(null);
  const [chatKey, setChatKey] = useState(0);

  const questionTypes = [
    { 
      value: 'first_words' as QuestionType, 
      label: 'First Words', 
      description: 'Practice basic first words and sounds', 
      color: 'bg-blue-400',
      icon: BookOpen
    },
    { 
      value: 'question_time' as QuestionType, 
      label: 'Question Time', 
      description: 'Answer questions about pictures', 
      color: 'bg-green-500',
      icon: MessageCircle
    },
    { 
      value: 'build_sentence' as QuestionType, 
      label: 'Build a Sentence', 
      description: 'Learn to construct sentences', 
      color: 'bg-purple-600',
      icon: Building
    },
    { 
      value: 'lets_chat' as QuestionType, 
      label: 'Lets Chat', 
      description: 'Free conversation practice', 
      color: 'bg-red-500',
      icon: Heart
    }
  ];

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
            imageName: q.image_name,
            questionType: q.question_type
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
          const urlMap: {[key: string]: string} = {};
          
          imageData.forEach((item: any) => {
            // Create object URL from base64 data
            const byteCharacters = atob(item.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: item.type });
            urlMap[item.name] = URL.createObjectURL(blob);
          });
          
          setImageUrls(urlMap);
          console.log('Updated image URLs from storage event:', Object.keys(urlMap).length);
        } catch (error) {
          console.error('Error processing updated images:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLauraClick = () => {
    setShowQuestionTypes(true);
  };

  const handleQuestionTypeSelect = (questionType: QuestionType) => {
    setSelectedQuestionType(questionType);
    setUseStructuredMode(true);
    setShowQuestionTypes(false);
    setShowChat(true);
    setChatKey(prev => prev + 1); // Reset chat when starting new session
  };

  const handleLawrenceClick = () => {
    // Placeholder for Lawrence functionality
    console.log('Lawrence clicked - functionality to be implemented');
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setShowQuestionTypes(false);
    setSelectedQuestionType(null);
    setChatKey(prev => prev + 1); // Reset chat when closing
  };

  const toggleChatMode = () => {
    console.log('Toggling chat mode from', useStructuredMode, 'to', !useStructuredMode);
    setUseStructuredMode(!useStructuredMode);
    setChatKey(prev => prev + 1); // Force chat component to re-render with new mode
  };

  // Filter questions by selected type
  const filteredQuestions = selectedQuestionType 
    ? questions.filter(q => q.questionType === selectedQuestionType)
    : questions;

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

          {/* Your Therapists Section */}
          <Card className="mb-8 bg-blue-50 border-blue-200">
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

          {/* Question Type Selection - redesigned to match screenshot */}
          {showQuestionTypes && (
            <div className="mb-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Choose Your Learning Activity with Laura
                </h2>
                <p className="text-gray-600">Select the type of questions you'd like to practice today</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {questionTypes.map((type) => {
                  const questionsOfType = questions.filter(q => q.questionType === type.value).length;
                  const IconComponent = type.icon;
                  
                  return (
                    <div
                      key={type.value}
                      className={`${type.color} rounded-2xl p-6 text-black cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 min-h-[180px] flex flex-col justify-between`}
                      onClick={() => handleQuestionTypeSelect(type.value)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="bg-white rounded-full p-3 mb-4">
                          <IconComponent className="w-6 h-6 text-gray-700" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">{type.label}</h3>
                        <p className="text-sm opacity-90 leading-relaxed">{type.description}</p>
                      </div>
                      
                      {questionsOfType > 0 && type.value !== 'first_words' && type.value !== 'lets_chat' && (
                        <div className="mt-4 text-center">
                          <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-medium">
                            {questionsOfType} questions available
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowQuestionTypes(false)}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  ← Back to Therapists
                </button>
              </div>
            </div>
          )}

          {/* Chat Interface - only show when question type is selected */}
          {showChat && selectedQuestionType && (
            <div className="flex justify-center">
              <OpenAIChat 
                key={chatKey}
                onClose={handleCloseChat}
                questions={filteredQuestions}
                imageUrls={imageUrls}
                useStructuredMode={useStructuredMode}
                onToggleMode={toggleChatMode}
                selectedQuestionType={selectedQuestionType}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OpenAIChatPage;

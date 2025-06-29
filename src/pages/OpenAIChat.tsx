
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
import ProgressCharacter from '../components/ProgressCharacter';
import CartoonCharacterUploader from '../components/CartoonCharacterUploader';

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
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const questionTypes = [
    { 
      value: 'first_words' as QuestionType, 
      label: 'First Words', 
      description: 'Practice basic first words and sounds', 
      color: 'bg-blue-100 hover:bg-blue-200 border-blue-200',
      textColor: 'text-blue-800',
      icon: BookOpen
    },
    { 
      value: 'question_time' as QuestionType, 
      label: 'Question Time', 
      description: 'Answer questions about pictures', 
      color: 'bg-amber-100 hover:bg-amber-200 border-amber-200',
      textColor: 'text-amber-800',
      icon: MessageCircle
    },
    { 
      value: 'build_sentence' as QuestionType, 
      label: 'Build a Sentence', 
      description: 'Learn to construct sentences', 
      color: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-200',
      textColor: 'text-emerald-800',
      icon: Building
    },
    { 
      value: 'lets_chat' as QuestionType, 
      label: 'Lets Chat', 
      description: 'Free conversation practice', 
      color: 'bg-orange-100 hover:bg-orange-200 border-orange-200',
      textColor: 'text-orange-800',
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
          console.log('Questions by type:', formattedQuestions.reduce((acc, q) => {
            acc[q.questionType || 'unknown'] = (acc[q.questionType || 'unknown'] || 0) + 1;
            return acc;
          }, {} as Record<string, number>));

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
    console.log('Laura clicked - showing question types');
    setShowQuestionTypes(true);
  };

  const handleQuestionTypeSelect = (questionType: QuestionType) => {
    setSelectedQuestionType(questionType);
    setUseStructuredMode(true);
    setShowQuestionTypes(false);
    setShowChat(true);
    setCorrectAnswers(0);
    setChatKey(prev => prev + 1);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setShowQuestionTypes(false);
    setSelectedQuestionType(null);
    setCorrectAnswers(0);
    setChatKey(prev => prev + 1);
  };

  const toggleChatMode = () => {
    console.log('Toggling chat mode from', useStructuredMode, 'to', !useStructuredMode);
    setUseStructuredMode(!useStructuredMode);
    setCorrectAnswers(0);
    setChatKey(prev => prev + 1);
  };

  const handleCorrectAnswer = () => {
    setCorrectAnswers(prev => prev + 1);
  };

  const handleLawrenceClick = () => {
    console.log('Lawrence clicked - functionality to be implemented');
  };

  // Filter questions by selected type - fixed logic
  const filteredQuestions = selectedQuestionType 
    ? questions.filter(q => {
        const matches = q.questionType === selectedQuestionType;
        console.log(`Filtering question ${q.id}: type='${q.questionType}', selected='${selectedQuestionType}', matches=${matches}`);
        return matches;
      })
    : questions;

  console.log('Filtered questions for', selectedQuestionType, ':', filteredQuestions.length);
  console.log('Available questions:', questions.map(q => ({ id: q.id, type: q.questionType, imageName: q.imageName })));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section - only show when not in chat */}
          {!showChat && !showQuestionTypes && (
            <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-center mb-6 text-black">
                  Welcome, {profile?.name || 'User'}! 🌈
                </h1>
              </div>

              {/* Cartoon Character Uploader */}
              <CartoonCharacterUploader />

              {/* Learning Progress Section */}
              <Card className="mb-8 bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-black flex items-center gap-2">
                    📚 Your Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Hope your vacation went great! Let's start from where you left off last week. You have made a great job learning about making effective conversations. 🎯
                  </p>
                </CardContent>
              </Card>

              {/* Your Therapists Section */}
              <Card className="mb-8 bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-black flex items-center gap-2">
                    👩‍⚕️ Your Therapists
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div 
                      className="flex items-center space-x-4 cursor-pointer hover:bg-gray-100 p-4 rounded-xl transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md"
                      onClick={handleLauraClick}
                    >
                      <Avatar className="h-16 w-16 border-4 border-gray-200">
                        <AvatarImage 
                          src="/lovable-uploads/Laura.png" 
                          alt="Laura" 
                        />
                        <AvatarFallback className="bg-gray-200 text-gray-700">L</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-black text-lg">Laura 💫</h3>
                        <p className="text-gray-600 text-sm">Practiced conversations</p>
                        {questions.length > 0 && (
                          <p className="text-xs text-emerald-600">✅ {questions.length} questions ready</p>
                        )}
                        {Object.keys(imageUrls).length > 0 && (
                          <p className="text-xs text-blue-600">🖼️ {Object.keys(imageUrls).length} images loaded</p>
                        )}
                      </div>
                    </div>
                    <div 
                      className="flex items-center space-x-4 cursor-pointer hover:bg-gray-100 p-4 rounded-xl transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md"
                      onClick={handleLawrenceClick}
                    >
                      <Avatar className="h-16 w-16 border-4 border-gray-200">
                        <AvatarImage 
                          src="/lovable-uploads/Lawrence.png" 
                          alt="Lawrence" 
                        />
                        <AvatarFallback className="bg-gray-200 text-gray-700">L</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-black text-lg">Lawrence 🌟</h3>
                        <p className="text-gray-600 text-sm">Worked on questions</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Question Type Selection */}
          {showQuestionTypes && (
            <div className="mb-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-black mb-4">
                  🎨 Choose Your Learning Adventure with Laura! 🎨
                </h2>
                <p className="text-gray-600 text-lg">Select the type of questions you'd like to practice today</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {questionTypes.map((type) => {
                  const questionsOfType = questions.filter(q => q.questionType === type.value).length;
                  const IconComponent = type.icon;
                  
                  return (
                    <div
                      key={type.value}
                      className={`${type.color} ${type.textColor} rounded-3xl p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 min-h-[200px] flex flex-col justify-between border-3 hover:border-white`}
                      onClick={() => handleQuestionTypeSelect(type.value)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="bg-white rounded-full p-4 mb-4 shadow-lg">
                          <IconComponent className={`w-8 h-8 ${type.textColor}`} />
                        </div>
                        <h3 className="font-bold text-xl mb-3">{type.label}</h3>
                        <p className="text-sm opacity-90 leading-relaxed">{type.description}</p>
                      </div>
                      
                      {questionsOfType > 0 ? (
                        <div className="mt-4 text-center">
                          <span className="bg-white bg-opacity-90 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                            🎯 {questionsOfType} questions ready!
                          </span>
                        </div>
                      ) : (
                        <div className="mt-4 text-center">
                          <span className="bg-white bg-opacity-60 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                            ✨ AI-generated content
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
                  className="text-gray-600 hover:text-gray-800 text-lg font-medium bg-white px-6 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  ← Back to Therapists
                </button>
              </div>
            </div>
          )}

          {/* Chat Interface with side-by-side layout */}
          {showChat && selectedQuestionType && (
            <div className="flex flex-col lg:flex-row gap-6 h-full">
              {/* Chat Interface positioned on the left side */}
              <div className="flex-1 w-full lg:w-auto">
                <OpenAIChat 
                  key={chatKey}
                  onClose={handleCloseChat}
                  questions={filteredQuestions}
                  imageUrls={imageUrls}
                  useStructuredMode={useStructuredMode}
                  onToggleMode={toggleChatMode}
                  selectedQuestionType={selectedQuestionType}
                  onCorrectAnswer={handleCorrectAnswer}
                />
              </div>
              
              {/* Progress Character positioned on the right side */}
              <div className="w-full lg:w-80 flex-shrink-0">
                <ProgressCharacter 
                  correctAnswers={correctAnswers}
                  totalQuestions={filteredQuestions.length}
                  questionType={selectedQuestionType}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OpenAIChatPage;

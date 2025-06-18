
import React from 'react';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import OpenAIChat from '../components/OpenAIChat';
import { useUserProfile } from '../hooks/useUserProfile';

const OpenAIChatPage = () => {
  const { profile } = useUserProfile();

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
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage 
                        src="/lovable-uploads/Amy.png" 
                        alt="Amy" 
                      />
                      <AvatarFallback className="bg-blue-500 text-white">A</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-800">Amy</h3>
                      <p className="text-gray-600 text-sm">Practiced conversations</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
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
                <div className="grid grid-cols-1 gap-4">
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

          {/* Chat Interface */}
          <div className="flex justify-center">
            <OpenAIChat />
          </div>
        </div>
      </main>
    </div>
  );
};

export default OpenAIChatPage;

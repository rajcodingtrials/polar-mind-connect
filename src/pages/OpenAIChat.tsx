
import React from 'react';
import Header from '../components/Header';
import OpenAIChat from '../components/OpenAIChat';

const OpenAIChatPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Meet Laura - Your Speech Therapist</h1>
            <p className="text-muted-foreground">
              Chat with Laura using text or voice to improve your speech and communication skills
            </p>
          </div>
          <OpenAIChat />
        </div>
      </main>
    </div>
  );
};

export default OpenAIChatPage;


import React from 'react';
import Header from '../components/Header';
import OpenAIChat from '../components/OpenAIChat';

const OpenAITest = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">OpenAI Integration Test</h1>
            <p className="text-muted-foreground">
              Test your OpenAI connection with this chat interface
            </p>
          </div>
          <OpenAIChat />
        </div>
      </main>
    </div>
  );
};

export default OpenAITest;

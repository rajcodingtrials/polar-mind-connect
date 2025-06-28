
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Message } from './types';

interface ChatMessageProps {
  message: Message;
  index: number;
}

const ChatMessage = ({ message, index }: ChatMessageProps) => {
  return (
    <div key={index}>
      <div
        className={`flex ${
          message.role === 'user' ? 'justify-end' : 'justify-start'
        }`}
      >
        <div
          className={`max-w-[85%] rounded-xl p-4 shadow-sm ${
            message.role === 'user'
              ? 'bg-gradient-to-br from-blue-200 to-blue-300 text-blue-900 border border-blue-300'
              : 'bg-white border border-blue-200 text-blue-900'
          }`}
        >
          {message.role === 'assistant' && (
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-6 w-6">
                <AvatarImage 
                  src="/lovable-uploads/Laura.png" 
                  alt="Laura" 
                />
                <AvatarFallback className="bg-blue-200 text-blue-800 text-xs font-semibold">L</AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold text-blue-700">Laura:</span>
            </div>
          )}
          {message.imageUrl && (
            <div className="mb-4 flex justify-center items-center p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-100 shadow-inner">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-xl blur-sm"></div>
                <img 
                  src={message.imageUrl} 
                  alt="Question image" 
                  className="relative max-w-4xl max-h-[500px] object-contain rounded-xl shadow-2xl border-4 border-white ring-2 ring-blue-200/50"
                  onLoad={() => console.log('Image loaded successfully:', message.imageUrl)}
                  onError={(e) => console.error('Image failed to load:', message.imageUrl, e)}
                />
              </div>
            </div>
          )}
          <div className="leading-relaxed whitespace-pre-wrap font-sans text-lg">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;


import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, Shield, Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI therapy companion. I'm here to listen and support you with empathy and understanding. How are you feeling today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getTherapeuticResponse(inputMessage),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getTherapeuticResponse = (userInput: string): string => {
    const responses = [
      "I hear you, and I want you to know that your feelings are completely valid. Can you tell me more about what's been on your mind?",
      "Thank you for sharing that with me. It takes courage to open up about difficult experiences. How has this been affecting your daily life?",
      "I'm here to support you through this. What you're experiencing sounds challenging. Have you noticed any patterns in when these feelings tend to arise?",
      "Your feelings matter, and I'm grateful you're trusting me with them. What would feel most supportive for you right now?",
      "That sounds really difficult to navigate. You're not alone in feeling this way. What coping strategies have you tried in the past?",
      "I can understand why that would be overwhelming. Sometimes it helps to break things down into smaller, manageable pieces. What's one small thing that might help you feel a bit better today?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-therapy-50 via-white to-calm-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link to="/" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-therapy rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-calm-900 font-playfair">Therapy Session</h1>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-therapy-100 text-therapy-700">
              <Shield className="w-3 h-3 mr-1" />
              Confidential
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              AI Therapist Online
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <Heart className="w-3 h-3 mr-1" />
              Safe Space
            </Badge>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="h-[600px] flex flex-col border-therapy-200">
          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={message.sender === 'user' ? 'bg-therapy-500 text-white' : 'bg-calm-200 text-calm-700'}>
                      {message.sender === 'user' ? 'U' : 'AI'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.sender === 'user' 
                      ? 'bg-gradient-therapy text-white' 
                      : 'bg-calm-100 text-calm-800'
                  }`}>
                    <p className="leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.sender === 'user' 
                        ? 'text-therapy-100' 
                        : 'text-calm-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-calm-200 text-calm-700">AI</AvatarFallback>
                  </Avatar>
                  <div className="bg-calm-100 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-calm-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-calm-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-calm-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          
          {/* Input */}
          <div className="p-4 border-t border-therapy-200">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your mind..."
                className="flex-1 border-therapy-300 focus:border-therapy-500"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-therapy hover:opacity-90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-calm-500 mt-2 text-center">
              This is a supportive AI companion. In crisis situations, please contact 988 or emergency services.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Chat;

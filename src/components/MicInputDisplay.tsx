import React from 'react';
import { Mic, X, Clock, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MicInputDisplayProps {
  micInput: string;
  onClear?: () => void;
  onEdit?: () => void;
  timestamp?: Date;
  isProcessing?: boolean;
}

const MicInputDisplay = ({ 
  micInput, 
  onClear, 
  onEdit, 
  timestamp, 
  isProcessing = false 
}: MicInputDisplayProps) => {
  if (!micInput && !isProcessing) return null;

  const formatTimestamp = (date?: Date) => {
    if (!date) return 'Just now';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 30) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="mt-4 animate-fade-in">
      <div className="relative max-w-2xl mx-auto">
        {/* Speech bubble container */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                <Mic className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Voice Input</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTimestamp(timestamp)}
              </div>
            </div>
            {onClear && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Content */}
          <div className="relative">
            {isProcessing ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm">Processing your voice...</span>
              </div>
            ) : (
              <>
                {/* Speech bubble tail */}
                <div className="absolute -left-2 top-0 w-3 h-3 bg-gradient-to-br from-primary/5 to-primary/10 border-l border-b border-primary/20 rotate-45"></div>
                
                {/* Transcribed text */}
                <div className="relative bg-background/50 rounded-xl p-3 border border-primary/10">
                  <p className="text-foreground leading-relaxed">
                    "{micInput}"
                  </p>
                  
                  {/* Word count indicator */}
                  {micInput.split(' ').length > 10 && (
                    <div className="mt-2 pt-2 border-t border-primary/10">
                      <span className="text-xs text-muted-foreground">
                        {micInput.split(' ').length} words
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Action buttons */}
          {!isProcessing && micInput && (
            <div className="flex justify-end gap-2 mt-3">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="text-xs h-7"
                >
                  Edit
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 gap-1"
                onClick={() => {
                  // Optional: Add text-to-speech functionality
                  if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(micInput);
                    speechSynthesis.speak(utterance);
                  }
                }}
              >
                <Volume2 className="h-3 w-3" />
                Play
              </Button>
            </div>
          )}
        </div>

        {/* Confidence indicator (optional) */}
        {!isProcessing && micInput && (
          <div className="mt-2 flex justify-center">
            <div className="bg-primary/10 rounded-full px-2 py-1">
              <span className="text-xs text-primary font-medium">✓ Transcribed</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MicInputDisplay;
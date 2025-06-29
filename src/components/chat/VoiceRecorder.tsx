
import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  isRecording: boolean;
  isProcessing: boolean;
  loading: boolean;
  onVoiceRecording: () => void;
}

const VoiceRecorder = ({ isRecording, isProcessing, loading, onVoiceRecording }: VoiceRecorderProps) => {
  const isDisabled = loading || isProcessing;

  return (
    <>
      <div className="flex items-center justify-center space-x-4 bg-gradient-to-r from-blue-100 to-blue-150 border border-blue-200 rounded-lg p-4">
        <span className="text-blue-800 font-semibold text-lg">
          {isRecording ? "Recording... Tap to stop" : "Tap microphone to answer"}
        </span>
        <button
          onClick={onVoiceRecording}
          disabled={isDisabled}
          className={`w-12 h-12 rounded-full text-white shadow-lg transition-all duration-300 border-2 flex items-center justify-center ${
            isRecording 
              ? "bg-red-500 hover:bg-red-600 animate-pulse scale-110 border-red-300" 
              : isDisabled
              ? "bg-gray-400 cursor-not-allowed border-gray-300"
              : "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-105 border-blue-300"
          }`}
          title={
            isDisabled 
              ? "Please wait..." 
              : isRecording 
              ? "Tap to stop recording" 
              : "Tap to start recording"
          }
        >
          {isProcessing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>
      </div>
      
      {isProcessing && (
        <div className="text-center text-sm text-blue-700 bg-blue-100 p-2 rounded-lg border border-blue-200 animate-pulse">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing your voice...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceRecorder;

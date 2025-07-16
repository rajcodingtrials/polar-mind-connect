import React from 'react';
import { Mic } from 'lucide-react';

interface AnimatedMicButtonProps {
  isRecording: boolean;
  onClick: () => void;
  audioLevel: number; // 0 to 1
  label?: string;
}

const AnimatedMicButton: React.FC<AnimatedMicButtonProps> = ({ isRecording, onClick, audioLevel, label }) => {
  // Calculate stroke dasharray for the circular meter
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, audioLevel * 2); // Amplify for visual effect
  const dash = progress * circumference;

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onClick}
        className={`relative flex items-center justify-center w-36 h-36 rounded-full shadow-xl transition-all duration-200 focus:outline-none
          ${isRecording
            ? 'bg-gradient-to-br from-rose-200 to-pink-200 shadow-rose-200/60'
            : 'bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-blue-400/60'}
          hover:scale-105 active:scale-95
        `}
        style={{ boxShadow: isRecording ? '0 0 32px 4px #fca5a5' : '0 0 24px 2px #818cf8' }}
      >
        {/* SVG Circular Volume Meter */}
        <svg className="absolute top-0 left-0" width={144} height={144}>
          <circle
            cx={72}
            cy={72}
            r={radius}
            fill="none"
            stroke="#e0e7ff"
            strokeWidth={10}
          />
          <circle
            cx={72}
            cy={72}
            r={radius}
            fill="none"
            stroke={isRecording ? '#f87171' : '#38bdf8'}
            strokeWidth={10}
            strokeDasharray={`${dash},${circumference - dash}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.1s linear' }}
          />
        </svg>
        {/* Mic Icon */}
        <Mic className="relative z-10 text-white" size={64} />
      </button>
      {label && (
        <div className="mt-4 text-center">
          <span className="block text-lg font-semibold text-blue-700 drop-shadow-sm">
            {label}
          </span>
        </div>
      )}
    </div>
  );
};

export default AnimatedMicButton; 
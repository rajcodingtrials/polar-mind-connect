// Global audio manager to prevent TTS overlap
let globalAudioElement: HTMLAudioElement | null = null;
let isGlobalAudioPlaying = false;
let isProcessingTTS = false; // Prevent multiple simultaneous TTS calls

// Utility function to aggressively stop all audio playback across the application
export const stopAllAudio = () => {
  try {
    console.log('🛑 Stopping all audio playback...');
    
    // Stop global audio
    if (globalAudioElement) {
      globalAudioElement.pause();
      globalAudioElement.currentTime = 0;
      globalAudioElement = null;
      isGlobalAudioPlaying = false;
    }
    
    // Stop all HTML audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    
    // Stop all video elements (in case they have audio)
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach(video => {
      if (!video.paused) {
        video.pause();
        video.currentTime = 0;
      }
    });
    
    // Revoke any object URLs that might be playing
    // This is a more aggressive cleanup approach
    if (typeof window !== 'undefined' && window.URL && window.URL.revokeObjectURL) {
      // We can't enumerate existing object URLs, but this function will be called
      // when components unmount to clean up their specific URLs
      console.log('🧹 Audio cleanup utility called');
    }
    
    console.log('✅ Audio cleanup completed');
  } catch (error) {
    console.error('❌ Error during audio cleanup:', error);
  }
};

// Global TTS player that ensures only one TTS plays at a time
export const playGlobalTTS = async (base64Audio: string, componentName: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    try {
      console.log(`🔊 [${componentName}] Requesting to play TTS...`);

      // Allow question TTS to override other TTS (but not vice versa)
      if (isProcessingTTS && componentName !== 'SingleQuestionView') {
        console.log(`⏳ [${componentName}] Another TTS is being processed, waiting...`);
        resolve();
        return;
      }

      // If SingleQuestionView is requesting TTS, always allow it
      if (componentName === 'SingleQuestionView') {
        console.log(`🎯 [${componentName}] Question TTS requested - overriding any existing TTS`);
      }

      isProcessingTTS = true;

      // Always stop any currently playing audio, regardless of state
      if (globalAudioElement) {
        console.log(`🛑 [${componentName}] Stopping previous TTS...`);
        globalAudioElement.pause();
        globalAudioElement.currentTime = 0;
        globalAudioElement = null;
        isGlobalAudioPlaying = false;
      }

      // Also stop any other audio elements that might be playing
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        if (!audio.paused) {
          console.log(`🛑 [${componentName}] Stopping other audio element...`);
          audio.pause();
          audio.currentTime = 0;
        }
      });

      // Convert base64 to blob
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);

      globalAudioElement = new Audio(audioUrl);
      isGlobalAudioPlaying = true;

      console.log(`🎵 [${componentName}] Starting TTS playback...`);

      globalAudioElement.onended = () => {
        console.log(`✅ [${componentName}] TTS finished playing`);
        isGlobalAudioPlaying = false;
        isProcessingTTS = false;
        if (globalAudioElement) {
          URL.revokeObjectURL(audioUrl);
          globalAudioElement = null;
        }
        resolve(); // Only resolve when playback ends
      };

      globalAudioElement.onerror = (e) => {
        console.error(`❌ [${componentName}] TTS playback error`, e);
        isGlobalAudioPlaying = false;
        isProcessingTTS = false;
        if (globalAudioElement) {
          URL.revokeObjectURL(audioUrl);
          globalAudioElement = null;
        }
        reject(e); // Reject on error
      };

      globalAudioElement.play().catch((e) => {
        globalAudioElement.onerror?.(e);
      });

    } catch (error) {
      console.error(`❌ [${componentName}] Error playing TTS:`, error);
      isGlobalAudioPlaying = false;
      isProcessingTTS = false;
      if (globalAudioElement) {
        globalAudioElement = null;
      }
      reject(error);
    }
  });
};

// Check if global audio is currently playing
export const getGlobalAudioPlayingStatus = (): boolean => {
  return isGlobalAudioPlaying;
};

// Stop global audio
export const stopGlobalAudio = (): void => {
  if (globalAudioElement) {
    console.log('🛑 Stopping global audio...');
    globalAudioElement.pause();
    globalAudioElement.currentTime = 0;
    globalAudioElement = null;
    isGlobalAudioPlaying = false;
    isProcessingTTS = false;
  }
};

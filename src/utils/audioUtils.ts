
// Utility function to aggressively stop all audio playback across the application
export const stopAllAudio = () => {
  try {
    console.log('🛑 Stopping all audio playback...');
    
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

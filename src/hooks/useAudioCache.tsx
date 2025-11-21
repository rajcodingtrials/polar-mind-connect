import { useState, useCallback } from 'react';

interface CacheEntry {
  audioContent: string;
  timestamp: number;
}

// In-memory cache for audio responses
const audioCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Generate cache key from TTS parameters
const getCacheKey = (text: string, voice: string, speed: number): string => {
  return `${text.substring(0, 100)}_${voice}_${speed}`;
};

export const useAudioCache = () => {
  const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0 });

  const getCachedAudio = useCallback((text: string, voice: string, speed: number): string | null => {
    const key = getCacheKey(text, voice, speed);
    const entry = audioCache.get(key);
    
    if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
      setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
      console.log('🎵 Audio cache HIT:', { key: key.substring(0, 50) });
      return entry.audioContent;
    }
    
    setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
    console.log('❌ Audio cache MISS:', { key: key.substring(0, 50) });
    return null;
  }, []);

  const setCachedAudio = useCallback((text: string, voice: string, speed: number, audioContent: string) => {
    const key = getCacheKey(text, voice, speed);
    audioCache.set(key, {
      audioContent,
      timestamp: Date.now()
    });
    console.log('💾 Audio cached:', { key: key.substring(0, 50), size: audioCache.size });
  }, []);

  const clearCache = useCallback(() => {
    audioCache.clear();
    setCacheStats({ hits: 0, misses: 0 });
    console.log('🧹 Audio cache cleared');
  }, []);

  return {
    getCachedAudio,
    setCachedAudio,
    clearCache,
    cacheStats,
    cacheSize: audioCache.size
  };
};

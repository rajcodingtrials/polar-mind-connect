import { useEffect, useState } from 'react';

interface PreloadStatus {
  loading: boolean;
  loaded: number;
  total: number;
}

export const useImagePreloader = (imageUrls: string[]): PreloadStatus => {
  const [status, setStatus] = useState<PreloadStatus>({
    loading: true,
    loaded: 0,
    total: imageUrls.length,
  });

  useEffect(() => {
    if (!imageUrls.length) {
      setStatus({ loading: false, loaded: 0, total: 0 });
      return;
    }

    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    const handleImageLoad = () => {
      loadedCount++;
      setStatus({
        loading: loadedCount < imageUrls.length,
        loaded: loadedCount,
        total: imageUrls.length,
      });
    };

    // Preload all images
    imageUrls.forEach((url) => {
      if (!url) return;
      
      const img = new Image();
      img.onload = handleImageLoad;
      img.onerror = handleImageLoad; // Count errors as "loaded" to prevent hanging
      img.src = url;
      images.push(img);
    });

    // Cleanup
    return () => {
      images.forEach(img => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [imageUrls]);

  return status;
};

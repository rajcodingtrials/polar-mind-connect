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
    const totalImages = imageUrls.length;
    const images: HTMLImageElement[] = [];

    const handleImageLoad = () => {
      loadedCount++;
      
      // Only update state when ALL images are loaded to prevent excessive re-renders
      if (loadedCount === totalImages) {
        setStatus({
          loading: false,
          loaded: loadedCount,
          total: totalImages,
        });
        console.log(`✅ All ${totalImages} images preloaded`);
      }
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

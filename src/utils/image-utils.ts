/**
 * Image utility functions for optimization and responsive images
 */

export interface ImageSrcSet {
  src: string;
  srcSet?: string;
  sizes?: string;
}

/**
 * Generate responsive image srcset for better performance
 */
export function generateImageSrcSet(
  basePath: string,
  fileName: string,
  widths: number[] = [400, 800, 1200]
): ImageSrcSet {
  const baseSrc = `${basePath}/${fileName}`;
  
  // Check if custom image exists
  const customImage = localStorage.getItem(`custom_image_${fileName.replace(/\D/g, '')}`);
  if (customImage) {
    return { src: customImage };
  }

  // For now, return base image
  // In production, you'd want to serve multiple sizes via CDN
  return {
    src: baseSrc,
    srcSet: widths.map(w => `${baseSrc}?w=${w} ${w}w`).join(', '),
    sizes: '(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px'
  };
}

/**
 * Check if WebP is supported
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * Get optimized image URL (WebP if supported, fallback to original)
 */
export async function getOptimizedImageUrl(originalUrl: string): Promise<string> {
  const webpSupported = await supportsWebP();
  if (webpSupported && originalUrl.includes('images/positions/')) {
    // In production, serve WebP versions
    // For now, return original
    return originalUrl;
  }
  return originalUrl;
}

/**
 * Preload image for better UX
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}


'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

export function usePageTransition() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<'1' | '2'>('1');

  const navigateWithTransition = useCallback((href: string) => {
    setIsTransitioning(true);
    // Alternar entre videos
    setCurrentVideo(prev => prev === '1' ? '2' : '1');

    // Esperar a que el video termine antes de navegar (duración aprox 1 segundo)
    setTimeout(() => {
      router.push(href);
      setIsTransitioning(false);
    }, 1000);
  }, [router]);

  return {
    isTransitioning,
    currentVideo,
    navigateWithTransition,
  };
}

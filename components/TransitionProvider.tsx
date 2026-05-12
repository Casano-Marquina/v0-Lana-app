'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { PageTransition } from './PageTransition';

interface TransitionContextType {
  isTransitioning: boolean;
  currentVideo: '1' | '2';
  startTransition: (callback?: () => void) => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<'1' | '2'>('1');

  const startTransition = useCallback((callback?: () => void) => {
    setIsTransitioning(true);
    setCurrentVideo(prev => prev === '1' ? '2' : '1');

    setTimeout(() => {
      setIsTransitioning(false);
      if (callback) callback();
    }, 1100);
  }, []);

  return (
    <TransitionContext.Provider value={{ isTransitioning, currentVideo, startTransition }}>
      <PageTransition isActive={isTransitioning} videoNumber={currentVideo} />
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransition debe ser usado dentro de TransitionProvider');
  }
  return context;
}

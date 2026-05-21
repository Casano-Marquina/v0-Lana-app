'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type LayoutMode = 'mobile' | 'desktop' | 'auto';

interface LayoutContextType {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  isMobileLayout: boolean;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('auto');
  const [isMobileLayout, setIsMobileLayout] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('layoutMode') as LayoutMode || 'auto';
    setLayoutMode(saved);
    setMounted(true);
  }, []);

  // Determine if should use mobile layout
  useEffect(() => {
    if (!mounted) return;

    const checkWidth = () => {
      const isSmallScreen = window.innerWidth < 1024; // lg breakpoint

      if (layoutMode === 'mobile') {
        setIsMobileLayout(true);
      } else if (layoutMode === 'desktop') {
        setIsMobileLayout(false);
      } else {
        // auto: mobile on small screens, desktop on large
        setIsMobileLayout(isSmallScreen);
      }
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, [layoutMode, mounted]);

  const handleSetLayoutMode = (mode: LayoutMode) => {
    setLayoutMode(mode);
    localStorage.setItem('layoutMode', mode);
  };

  return (
    <LayoutContext.Provider
      value={{
        layoutMode,
        setLayoutMode: handleSetLayoutMode,
        isMobileLayout,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within LayoutProvider');
  }
  return context;
}

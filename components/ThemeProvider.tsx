'use client';

import { useEffect } from 'react';
import { getPreferences } from '@/lib/db';

export function ThemeProvider() {
  useEffect(() => {
    const applyTheme = async () => {
      try {
        const prefs = await getPreferences();
        
        // Apply theme
        if (prefs.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Apply color mode
        const colorMode = prefs.colorMode || 'default';
        ['color-default', 'color-serenidad', 'color-naturaleza', 'color-deepfocus'].forEach(cls => {
          document.documentElement.classList.remove(cls);
        });
        document.documentElement.classList.add('color-' + colorMode);
      } catch (error) {
        console.log('[v0] Theme provider error:', error);
      }
    };
    
    applyTheme();
  }, []);
  
  return null;
}

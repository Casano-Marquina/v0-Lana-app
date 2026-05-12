'use client';

import { useEffect, useState } from 'react';

interface PageTransitionProps {
  isActive: boolean;
  videoNumber: '1' | '2';
}

export function PageTransition({ isActive, videoNumber }: PageTransitionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Overlay oscuro */}
      {isActive && (
        <div className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm pointer-events-none" />
      )}

      {/* Video de transición fullscreen */}
      <div
        className={`fixed inset-0 z-[9999] transition-opacity duration-300 ${
          isActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <video
          key={`transition-${videoNumber}`}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          onEnded={() => {
            // Cuando el video termina, se quita automáticamente
          }}
        >
          <source src={`/videos/transition-${videoNumber}.mp4`} type="video/mp4" />
        </video>
      </div>
    </>
  );
}

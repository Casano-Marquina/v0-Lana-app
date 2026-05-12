'use client';

import { useEffect, useState } from 'react';

export function SoftBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-50 bg-background overflow-hidden pointer-events-none">
      {/* Blob suave 1 - Verde */}
      <div
        className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-200 to-emerald-100 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{ animation: 'float 8s ease-in-out infinite' }}
      />

      {/* Blob suave 2 - Azul */}
      <div
        className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-br from-blue-200 to-cyan-100 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{ animation: 'float 10s ease-in-out infinite 2s' }}
      />

      {/* Blob suave 3 - Rosa */}
      <div
        className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-br from-pink-200 to-rose-100 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{ animation: 'float 12s ease-in-out infinite 4s' }}
      />

      {/* CSS para animación de flotación */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(30px);
          }
        }
      `}</style>
    </div>
  );
}

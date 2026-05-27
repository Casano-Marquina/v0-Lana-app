'use client';

import { Lana } from './Lana';

type RealmType = 'personal' | 'academic' | 'relational';

interface LanaAdviceProps {
  realm?: RealmType;
  message?: string;
  className?: string;
}

export function LanaAdvice({ realm = 'personal', message, className = '' }: LanaAdviceProps) {
  return (
    <div className={`space-y-4 text-center ${className}`}>
      {/* Lana Image - Floating animation */}
      <div className="flex justify-center animate-float">
        <Lana realm={realm} size="md" />
      </div>

      {/* Message - Cozy speech bubble */}
      {message && (
        <div className="space-y-3 cozy-card rounded-2xl p-4">
          <p className="text-gray-700 dark:text-gray-200 italic leading-relaxed text-sm">
            &ldquo;{message}&rdquo;
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <span>·</span>
            <span>LANA</span>
            <span>·</span>
          </div>
        </div>
      )}
    </div>
  );
}

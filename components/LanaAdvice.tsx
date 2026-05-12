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
    <div className={`bg-card border border-border rounded-2xl p-6 shadow-md ${className}`}>
      <div className="space-y-4 text-center">
        {/* Lana Image */}
        <div className="flex justify-center">
          <Lana realm={realm} size="md" />
        </div>

        {/* Message */}
        {message && (
          <div className="space-y-3">
            <p className="text-foreground italic leading-relaxed text-sm md:text-base">
              "{message}"
            </p>
            <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground font-medium">
              <span>·</span>
              <span>LANA</span>
              <span>·</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

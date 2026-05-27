'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Play, RotateCcw, X } from 'lucide-react';

type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

const BREATH_CYCLE = {
  inhale: 4000,  // 4 seconds
  hold: 2000,    // 2 seconds  
  exhale: 4000,  // 4 seconds
};

const TOTAL_CYCLE = BREATH_CYCLE.inhale + BREATH_CYCLE.hold + BREATH_CYCLE.exhale; // 10 seconds
const TOTAL_DURATION = 60000; // 60 seconds

const phaseMessages: Record<BreathPhase, string> = {
  idle: 'Preparate para respirar...',
  inhale: 'Inhala...',
  hold: 'Manten...',
  exhale: 'Exhala...',
};

const completionMessages = [
  'Gracias por regalarte este minuto. Tu pecho ya esta mas ligero.',
  'Lo hiciste increible. Tu cuerpo te lo agradece.',
  'Un minuto de calma puede cambiar todo tu dia.',
  'Respirar es el mejor regalo que puedes darte.',
  'Tu mente ahora esta mas clara. Sigue asi.',
  'Cada respiro consciente es un acto de amor propio.',
];

interface LanaBreathProps {
  userName?: string;
  onClose?: () => void;
  className?: string;
}

export function LanaBreath({ userName = 'amigo/a', onClose, className }: LanaBreathProps) {
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_DURATION);
  const [isComplete, setIsComplete] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');

  // Main timer countdown
  useEffect(() => {
    if (!isRunning || isComplete) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          setIsRunning(false);
          setIsComplete(true);
          const randomMsg = completionMessages[Math.floor(Math.random() * completionMessages.length)];
          setCompletionMessage(randomMsg.replace('amigo/a', userName));
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isComplete, userName]);

  // Breath cycle logic
  useEffect(() => {
    if (!isRunning || isComplete) {
      setPhase('idle');
      return;
    }

    let cycleTimeout: NodeJS.Timeout;
    
    const runCycle = () => {
      // Inhale
      setPhase('inhale');
      
      cycleTimeout = setTimeout(() => {
        // Hold
        setPhase('hold');
        
        cycleTimeout = setTimeout(() => {
          // Exhale
          setPhase('exhale');
          
          cycleTimeout = setTimeout(() => {
            // Start next cycle if still running
            if (isRunning && !isComplete) {
              runCycle();
            }
          }, BREATH_CYCLE.exhale);
        }, BREATH_CYCLE.hold);
      }, BREATH_CYCLE.inhale);
    };

    runCycle();

    return () => clearTimeout(cycleTimeout);
  }, [isRunning, isComplete]);

  const handleStart = useCallback(() => {
    setIsRunning(true);
    setIsComplete(false);
    setTimeLeft(TOTAL_DURATION);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsComplete(false);
    setPhase('idle');
    setTimeLeft(TOTAL_DURATION);
  }, []);

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center',
      'bg-gradient-to-br from-green-50 via-blue-50 to-purple-50',
      'dark:from-slate-900 dark:via-slate-800 dark:to-slate-900',
      className
    )}>
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-colors"
        >
          <X className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>
      )}

      <div className="flex flex-col items-center gap-8 p-8 max-w-md mx-auto text-center">
        {!isComplete ? (
          <>
            {/* Timer display */}
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {isRunning ? `Tiempo restante: ${formatTime(timeLeft)}` : 'Ejercicio de respiracion - 1 minuto'}
            </div>

            {/* Breath circle with Lana */}
            <div className="relative flex items-center justify-center">
              {/* Animated circle */}
              <div
                className={cn(
                  'absolute rounded-full transition-all ease-in-out',
                  'bg-gradient-to-br from-green-200/60 via-blue-200/60 to-purple-200/60',
                  'dark:from-green-800/40 dark:via-blue-800/40 dark:to-purple-800/40',
                  'border-2 border-white/30 dark:border-white/10',
                  phase === 'idle' && 'w-40 h-40 duration-500',
                  phase === 'inhale' && 'w-72 h-72 duration-[4000ms]',
                  phase === 'hold' && 'w-72 h-72 duration-[2000ms]',
                  phase === 'exhale' && 'w-40 h-40 duration-[4000ms]',
                )}
              />

              {/* Inner glow circle */}
              <div
                className={cn(
                  'absolute rounded-full transition-all ease-in-out',
                  'bg-gradient-to-br from-white/40 to-transparent',
                  phase === 'idle' && 'w-32 h-32 duration-500',
                  phase === 'inhale' && 'w-56 h-56 duration-[4000ms]',
                  phase === 'hold' && 'w-56 h-56 duration-[2000ms]',
                  phase === 'exhale' && 'w-32 h-32 duration-[4000ms]',
                )}
              />

              {/* Lana sleeping image */}
              <div className="relative z-10 w-28 h-28">
                <Image
                  src="/images/lana-sleeping.png"
                  alt="Lana descansando"
                  fill
                  className="object-contain drop-shadow-lg"
                  priority
                />
              </div>
            </div>

            {/* Phase instruction */}
            <div className={cn(
              'text-2xl font-light tracking-wide transition-all duration-500',
              phase === 'inhale' && 'text-green-600 dark:text-green-400',
              phase === 'hold' && 'text-blue-600 dark:text-blue-400',
              phase === 'exhale' && 'text-purple-600 dark:text-purple-400',
              phase === 'idle' && 'text-slate-500 dark:text-slate-400',
            )}>
              {phaseMessages[phase]}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-4">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className={cn(
                    'flex items-center gap-2 px-8 py-4 rounded-full',
                    'bg-gradient-to-r from-green-500 to-blue-500',
                    'hover:from-green-600 hover:to-blue-600',
                    'text-white font-semibold text-lg',
                    'shadow-lg hover:shadow-xl transition-all',
                    'hover:scale-105 active:scale-95'
                  )}
                >
                  <Play className="w-5 h-5" />
                  Comenzar
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className={cn(
                    'flex items-center gap-2 px-6 py-3 rounded-full',
                    'bg-slate-200 dark:bg-slate-700',
                    'hover:bg-slate-300 dark:hover:bg-slate-600',
                    'text-slate-700 dark:text-slate-200 font-medium',
                    'transition-all'
                  )}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reiniciar
                </button>
              )}
            </div>

            {/* Breathing tip */}
            {!isRunning && (
              <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
                Encuentra una posicion comoda. Lana te guiara durante 60 segundos de respiracion consciente.
              </p>
            )}
          </>
        ) : (
          /* Completion screen */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center gap-6">
            {/* Lana happy */}
            <div className="relative w-32 h-32">
              <Image
                src="/images/lana-verde.png"
                alt="Lana feliz"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>

            {/* Completion message */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl px-8 py-6 shadow-xl max-w-sm">
              <p className="text-lg font-medium text-slate-700 dark:text-slate-200 leading-relaxed italic">
                &ldquo;{completionMessage}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-1 mt-4">
                <div className="h-1 w-1 rounded-full bg-green-400" />
                <p className="text-xs uppercase tracking-wider font-bold text-green-600 dark:text-green-400">
                  Lana - Tu Centro
                </p>
                <div className="h-1 w-1 rounded-full bg-green-400" />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={handleReset}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-full',
                  'bg-gradient-to-r from-green-500 to-blue-500',
                  'hover:from-green-600 hover:to-blue-600',
                  'text-white font-semibold',
                  'shadow-lg hover:shadow-xl transition-all',
                  'hover:scale-105 active:scale-95'
                )}
              >
                <RotateCcw className="w-4 h-4" />
                Otra vez
              </button>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className={cn(
                    'px-6 py-3 rounded-full',
                    'bg-slate-200 dark:bg-slate-700',
                    'hover:bg-slate-300 dark:hover:bg-slate-600',
                    'text-slate-700 dark:text-slate-200 font-medium',
                    'transition-all'
                  )}
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

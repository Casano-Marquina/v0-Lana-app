'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type Realm = 'personal' | 'academic' | 'relational';

interface LanaProps {
  realm?: Realm;
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
  customMessage?: string;
  className?: string;
  onClick?: () => void;
}

const realmConfig = {
  personal: {
    image: '/images/lana-green.png',
    tone: 'amigable',
    name: 'Tu Centro',
  },
  academic: {
    image: '/images/lana-blue.png',
    tone: 'profesional',
    name: 'Tu Futuro',
  },
  relational: {
    image: '/images/lana-pink.png',
    tone: 'empatico',
    name: 'Tu Corazon',
  },
};

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-24 h-24',
  lg: 'w-40 h-40',
};

const motivationalMessages = {
  personal: [
    'Cada pequeno paso cuenta, sigue adelante!',
    'Tu bienestar es tu prioridad, lo estas haciendo genial!',
    'Hoy es un buen dia para cuidar de ti!',
    'Recuerda: descansar tambien es productivo!',
    'Tu equilibrio personal es tu superpoder!',
  ],
  academic: [
    'El conocimiento es tu mejor inversion!',
    'Cada tarea completada te acerca a tus metas!',
    'Tu esfuerzo de hoy es tu exito de manana!',
    'La disciplina vence al talento, sigue asi!',
    'Estas construyendo tu futuro, paso a paso!',
  ],
  relational: [
    'Las conexiones humanas nos hacen mas fuertes!',
    'Cuidar tus relaciones es cuidar tu corazon!',
    'Un mensaje, una llamada... pequenos gestos, gran impacto!',
    'Las personas que amas merecen tu tiempo!',
    'Tu presencia es un regalo para quienes te rodean!',
  ],
};

const completionMessages = [
  'Excelente trabajo! Lana esta orgullosa de ti!',
  'Tarea completada! Eres increible!',
  'Lo lograste! Sigue brillando!',
  'Otro logro mas! Tu esfuerzo vale la pena!',
  'Fantastico! Cada tarea cuenta!',
];

export function Lana({ 
  realm = 'personal', 
  size = 'md', 
  showMessage = false,
  customMessage,
  className = '',
  onClick,
}: LanaProps) {
  const [message, setMessage] = useState('');
  const config = realmConfig[realm];

  useEffect(() => {
    if (showMessage && !customMessage) {
      const messages = motivationalMessages[realm];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setMessage(randomMessage);
    } else if (customMessage) {
      setMessage(customMessage);
    }
  }, [realm, showMessage, customMessage]);

  return (
    <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${className}`}>
      {/* Lana Real Image */}
      <div 
        className={`relative ${sizeClasses[size]} hover:scale-105 transition-transform duration-300 ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <Image
          src={config.image}
          alt={`Lana - Modo ${realm}`}
          fill
          priority
          quality={95}
          className="object-contain drop-shadow-lg"
        />
      </div>
      
      {/* Mensaje con estilo mejorado */}
      {(showMessage || customMessage) && message && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-border/50 rounded-2xl px-5 py-3 max-w-xs text-center shadow-xl shadow-black/5">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed italic">&ldquo;{message}&rdquo;</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Lana - {config.name}</p>
            <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>
        </div>
      )}
    </div>
  );
}

export function LanaCompletionToast({ realm = 'personal' }: { realm?: Realm }) {
  const message = completionMessages[Math.floor(Math.random() * completionMessages.length)];
  
  return (
    <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-border/50 rounded-2xl px-4 py-3 shadow-xl shadow-black/5">
      <Lana realm={realm} size="sm" />
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 italic">&ldquo;{message}&rdquo;</p>
        <div className="flex items-center gap-1 mt-1">
          <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Lana</p>
          <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
      </div>
    </div>
  );
}

export function getRandomMotivation(realm: Realm): string {
  const messages = motivationalMessages[realm];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getCompletionMessage(): string {
  return completionMessages[Math.floor(Math.random() * completionMessages.length)];
}

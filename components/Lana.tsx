'use client';

import { useState, useEffect } from 'react';

type Realm = 'personal' | 'academic' | 'relational';

interface LanaProps {
  realm?: Realm;
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
  customMessage?: string;
  className?: string;
}

const realmConfig = {
  personal: {
    hatColor: '#22C55E', // Verde
    tone: 'amigable',
    name: 'Tu Centro',
  },
  academic: {
    hatColor: '#3B82F6', // Azul
    tone: 'profesional',
    name: 'Tu Futuro',
  },
  relational: {
    hatColor: '#EC4899', // Rosa
    tone: 'empatico',
    name: 'Tu Corazon',
  },
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
  className = ''
}: LanaProps) {
  const [message, setMessage] = useState('');
  const config = realmConfig[realm];
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-40 h-40',
  };

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
      {/* Lana SVG con hover y animaciones */}
      <div className={`relative ${sizeClasses[size]} hover:scale-105 transition-transform duration-300`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          {/* Cuerpo con animacion de "respiracion" suave */}
          <g className="animate-[pulse_4s_infinite_ease-in-out]">
            <ellipse cx="50" cy="65" rx="30" ry="25" fill="#F5F5DC" />
            <circle cx="35" cy="55" r="8" fill="#FFFEF0" />
            <circle cx="50" cy="50" r="9" fill="#FFFEF0" />
            <circle cx="65" cy="55" r="8" fill="#FFFEF0" />
            <circle cx="30" cy="68" r="7" fill="#FFFEF0" />
            <circle cx="70" cy="68" r="7" fill="#FFFEF0" />
            <circle cx="45" cy="75" r="8" fill="#FFFEF0" />
            <circle cx="55" cy="75" r="8" fill="#FFFEF0" />
          </g>
          
          {/* Cabeza */}
          <ellipse cx="50" cy="35" rx="18" ry="16" fill="#F5F5DC" />
          
          {/* Orejas */}
          <ellipse cx="30" cy="32" rx="6" ry="4" fill="#DEB887" transform="rotate(-20 30 32)" />
          <ellipse cx="70" cy="32" rx="6" ry="4" fill="#DEB887" transform="rotate(20 70 32)" />
          
          {/* Cara */}
          <ellipse cx="50" cy="38" rx="10" ry="8" fill="#FFF8DC" />
          
          {/* Ojos */}
          <circle cx="44" cy="33" r="3" fill="#2D2D2D" />
          <circle cx="56" cy="33" r="3" fill="#2D2D2D" />
          <circle cx="45" cy="32" r="1" fill="#FFFFFF" />
          <circle cx="57" cy="32" r="1" fill="#FFFFFF" />
          
          {/* Nariz */}
          <ellipse cx="50" cy="40" rx="3" ry="2" fill="#DEB887" />
          
          {/* Sonrisa */}
          <path d="M 45 44 Q 50 48 55 44" stroke="#8B7355" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          
          {/* Mejillas rosadas */}
          <circle cx="38" cy="38" r="3" fill="#FFB6C1" opacity="0.5" />
          <circle cx="62" cy="38" r="3" fill="#FFB6C1" opacity="0.5" />
          
          {/* Gorrita con transiciones de color suaves */}
          <g className="transition-colors duration-700 ease-in-out">
            <path 
              d="M 32 28 Q 35 15 50 12 Q 65 15 68 28 L 32 28 Z" 
              fill={config.hatColor} 
              className="transition-all duration-700"
            />
            <ellipse cx="50" cy="28" rx="20" ry="4" fill={config.hatColor} className="transition-all duration-700" />
            <circle cx="50" cy="10" r="4" fill={config.hatColor} className="transition-all duration-700" />
          </g>
          
          {/* Patas */}
          <rect x="38" y="85" width="6" height="10" rx="3" fill="#8B7355" />
          <rect x="56" y="85" width="6" height="10" rx="3" fill="#8B7355" />
        </svg>
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

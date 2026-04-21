// Realm (Ámbito) Configuration - Personal, Academic, Relational

import { Heart, Zap, BookOpen } from 'lucide-react';

export type RealmType = 'personal' | 'academic' | 'relational';

export interface RealmConfig {
  id: RealmType;
  name: string;
  subtitle: string;
  color: {
    light: string;
    main: string;
    dark: string;
  };
  textColor: string;
  icon: React.ReactNode;
  emoji: string;
  description: string;
}

export const REALMS: Record<RealmType, RealmConfig> = {
  personal: {
    id: 'personal',
    name: 'Tu Centro',
    subtitle: 'Prioridad Personal',
    color: {
      light: '#DBEAFE',
      main: '#3B82F6',
      dark: '#1E40AF',
    },
    textColor: '#1E3A8A',
    icon: <Zap className="w-5 h-5" />,
    emoji: '⭐',
    description: 'Tareas personales, salud, tiempo para ti',
  },
  academic: {
    id: 'academic',
    name: 'Tu Futuro',
    subtitle: 'Prioridad Académica/Técnica',
    color: {
      light: '#F3E8FF',
      main: '#8B5CF6',
      dark: '#6D28D9',
    },
    textColor: '#4C1D95',
    icon: <BookOpen className="w-5 h-5" />,
    emoji: '🎓',
    description: 'Estudios, trabajo, desarrollo profesional',
  },
  relational: {
    id: 'relational',
    name: 'Tu Corazón',
    subtitle: 'Prioridad Relacional',
    color: {
      light: '#FBECF3',
      main: '#EC4899',
      dark: '#BE185D',
    },
    textColor: '#831843',
    icon: <Heart className="w-5 h-5" />,
    emoji: '❤️',
    description: 'Familia, amigos, relaciones importantes',
  },
};

export const REALM_COLORS = {
  personal: '#3B82F6',
  academic: '#8B5CF6',
  relational: '#EC4899',
} as const;

export const REALM_BG_COLORS = {
  personal: '#DBEAFE',
  academic: '#F3E8FF',
  relational: '#FBECF3',
} as const;

export function getRealmConfig(realm: RealmType): RealmConfig {
  return REALMS[realm];
}

export function getRealmColor(realm: RealmType): string {
  return REALM_COLORS[realm];
}

export function getRealmBgColor(realm: RealmType): string {
  return REALM_BG_COLORS[realm];
}

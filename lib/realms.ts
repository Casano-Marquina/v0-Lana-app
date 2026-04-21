// Realm (Ámbito) Configuration - Personal, Academic, Relational

export type RealmType = 'personal' | 'academic' | 'relational';
export type IconType = 'zap' | 'book-open' | 'heart';

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
  iconType: IconType;
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
    iconType: 'zap',
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
    iconType: 'book-open',
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
    iconType: 'heart',
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

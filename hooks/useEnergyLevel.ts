'use client';

import { useState, useEffect, useCallback } from 'react';

export type EnergyLevel = 'low' | 'medium' | 'high' | null;

interface EnergyState {
  level: EnergyLevel;
  date: string;
}

const STORAGE_KEY = 'lana-energy-checkin';

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function useEnergyLevel() {
  const [energyLevel, setEnergyLevelState] = useState<EnergyLevel>(null);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load energy level from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const state: EnergyState = JSON.parse(stored);
        const today = getTodayDateString();
        
        if (state.date === today && state.level) {
          setEnergyLevelState(state.level);
          setHasCheckedInToday(true);
        } else {
          // Different day, reset
          setHasCheckedInToday(false);
          setEnergyLevelState(null);
        }
      } catch {
        setHasCheckedInToday(false);
      }
    }
    setIsLoading(false);
  }, []);

  const setEnergyLevel = useCallback((level: EnergyLevel) => {
    const state: EnergyState = {
      level,
      date: getTodayDateString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setEnergyLevelState(level);
    setHasCheckedInToday(true);
  }, []);

  const resetCheckIn = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setEnergyLevelState(null);
    setHasCheckedInToday(false);
  }, []);

  return {
    energyLevel,
    hasCheckedInToday,
    isLoading,
    setEnergyLevel,
    resetCheckIn,
  };
}

// Mensajes de Lana segun el nivel de energia
export const energyMessages = {
  low: {
    greeting: 'Esta bien estar cansada/o. Hoy tejemos despacio.',
    explanation: 'Lana se encarga de proteger tus pendientes pesados para manana. Solo haremos lo esencial para que estes tranquila/o.',
    hatColor: '#22C55E', // Verde - modo relajado
  },
  medium: {
    greeting: 'Genial! Es un buen dia para avanzar con ritmo constante.',
    explanation: 'Ni muy rapido, ni muy lento. Vamos a tejer juntos!',
    hatColor: '#22C55E', // Verde - modo normal
  },
  high: {
    greeting: 'Esa es la actitud! Hoy es dia de conquistar metas.',
    explanation: 'Lana se puso su gorra azul de enfoque total. Desbloqueemos esos logros!',
    hatColor: '#3B82F6', // Azul - modo enfocado
  },
};

// Funcion para filtrar y ordenar tareas segun nivel de energia
export function filterTasksByEnergy<T extends { 
  realm: 'personal' | 'academic' | 'relational'; 
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}>(tasks: T[], energyLevel: EnergyLevel): T[] {
  if (!energyLevel || energyLevel === 'medium') {
    // Energia media: mostrar todas las tareas equilibradas
    return tasks;
  }

  if (energyLevel === 'low') {
    // Energia baja: priorizar personal y relacional, ocultar academicas pesadas
    return tasks.filter(task => {
      if (task.completed) return true;
      // Ocultar tareas academicas de alta prioridad (pesadas)
      if (task.realm === 'academic' && task.priority === 'high') {
        return false;
      }
      return true;
    }).sort((a, b) => {
      // Priorizar personal y relacional
      const order = { personal: 0, relational: 1, academic: 2 };
      return order[a.realm] - order[b.realm];
    });
  }

  if (energyLevel === 'high') {
    // Energia alta: priorizar academicas, dejar personal/relacional para el final
    return tasks.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      // Priorizar academico, luego por prioridad
      const realmOrder = { academic: 0, personal: 1, relational: 2 };
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      
      if (a.realm !== b.realm) {
        return realmOrder[a.realm] - realmOrder[b.realm];
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  return tasks;
}

// Verificar si una tarea es "pesada" para advertir al usuario con energia baja
export function isHeavyTask(task: { realm: string; priority: string }): boolean {
  return task.realm === 'academic' && task.priority === 'high';
}

'use client';

import { Task } from '@/lib/db';

// Hierarchy levels with Lana's narrative
export const HIERARCHY_CONFIG = {
  1: {
    label: 'Lana no lo suelta',
    description: 'Tarea critica, hay que hacerla hoy',
    color: 'border-red-400',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-100 text-red-700',
    icon: '🧶',
    lanaMessage: 'Esta tarea es importante, vamos juntas a conquistarla!',
  },
  2: {
    label: 'Podemos soltar un poco el hilo',
    description: 'Importante pero flexible',
    color: 'border-amber-400',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    badgeColor: 'bg-amber-100 text-amber-700',
    icon: '🪢',
    lanaMessage: 'Hay espacio para respirar, pero no la perdamos de vista.',
  },
  3: {
    label: 'Para otro ovillo',
    description: 'Se puede mover facilmente',
    color: 'border-green-400',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-100 text-green-700',
    icon: '🌿',
    lanaMessage: 'Tranquila, esta puede esperar sin presion.',
  },
} as const;

// Messages for postponing tasks
export const POSTPONE_MESSAGES = [
  "Esta bien, el hilo no se rompe, solo lo estiramos para manana.",
  "A veces soltar es avanzar. Esta tarea esperara por ti.",
  "Tu bienestar importa mas. La retomamos cuando estes lista.",
  "Lana guarda este ovillo con cuidado para despues.",
  "No es rendirse, es ser amable contigo misma.",
];

// Get random postpone message
export function getPostponeMessage(): string {
  return POSTPONE_MESSAGES[Math.floor(Math.random() * POSTPONE_MESSAGES.length)];
}

// Reorder tasks by hierarchy (1 first, then 2, then 3)
export function reorderTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // First by hierarchy
    const hierarchyA = a.hierarchy || 2;
    const hierarchyB = b.hierarchy || 2;
    if (hierarchyA !== hierarchyB) {
      return hierarchyA - hierarchyB;
    }
    // Then by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

// Filter tasks based on energy level
export function filterTasksByEnergyAndHierarchy(
  tasks: Task[],
  energyLevel: 'low' | 'medium' | 'high' | null
): { visible: Task[]; hidden: Task[]; suggestion: string | null } {
  if (!energyLevel || energyLevel === 'high') {
    return {
      visible: reorderTasks(tasks),
      hidden: [],
      suggestion: null,
    };
  }

  if (energyLevel === 'low') {
    // Hide heavy tasks (hierarchy 1 with high priority)
    const hidden = tasks.filter(
      (t) => t.hierarchy === 1 && t.priority === 'high' && !t.completed
    );
    const visible = tasks.filter(
      (t) => !(t.hierarchy === 1 && t.priority === 'high' && !t.completed)
    );

    return {
      visible: reorderTasks(visible),
      hidden,
      suggestion:
        hidden.length > 0
          ? `Lana oculto ${hidden.length} tarea(s) pesada(s) para proteger tu energia. Hoy enfocate en las tareas nivel 3 para mantener el ritmo sin agotarte.`
          : null,
    };
  }

  // Medium energy - show all but suggest prioritizing
  return {
    visible: reorderTasks(tasks),
    hidden: [],
    suggestion:
      'Energia media detectada. Considera empezar con tareas de nivel 2 o 3 para calentar motores.',
  };
}

// Check if a task is "heavy" (should be hidden on low energy)
export function isHeavyTask(task: Task): boolean {
  return task.hierarchy === 1 && task.priority === 'high';
}

// Postpone a task (move from hierarchy 1 to 2)
export function postponeTask(task: Task): Task {
  if (task.hierarchy === 1) {
    return { ...task, hierarchy: 2, updatedAt: new Date().toISOString() };
  }
  if (task.hierarchy === 2) {
    return { ...task, hierarchy: 3, updatedAt: new Date().toISOString() };
  }
  return task;
}

// Escalate a task (move up in hierarchy)
export function escalateTask(task: Task): Task {
  if (task.hierarchy === 3) {
    return { ...task, hierarchy: 2, updatedAt: new Date().toISOString() };
  }
  if (task.hierarchy === 2) {
    return { ...task, hierarchy: 1, updatedAt: new Date().toISOString() };
  }
  return task;
}

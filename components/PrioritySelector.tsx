'use client';

import { cn } from '@/lib/utils';

type Priority = 'high' | 'medium' | 'low';

interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
}

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  const priorities: { value: Priority; label: string; color: string; icon: string }[] = [
    {
      value: 'high',
      label: 'Alta',
      color: 'bg-red-100 border-red-300 text-red-700',
      icon: '🔴',
    },
    {
      value: 'medium',
      label: 'Media',
      color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
      icon: '🟡',
    },
    {
      value: 'low',
      label: 'Baja',
      color: 'bg-green-100 border-green-300 text-green-700',
      icon: '🟢',
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700">Prioridad</label>
      <div className="flex gap-2">
        {priorities.map((priority) => (
          <button
            key={priority.value}
            type="button"
            onClick={() => onChange(priority.value)}
            className={cn(
              'flex-1 py-2 px-3 rounded-lg border-2 transition-all font-medium text-sm flex items-center justify-center gap-2',
              value === priority.value ? priority.color + ' border-current' : 'border-gray-200 bg-gray-50'
            )}
          >
            <span>{priority.icon}</span>
            {priority.label}
          </button>
        ))}
      </div>
    </div>
  );
}

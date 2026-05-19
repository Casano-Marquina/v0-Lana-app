'use client';

import { cn } from '@/lib/utils';
import { HIERARCHY_CONFIG } from '@/lib/taskHierarchy';

interface HierarchySelectorProps {
  value: 1 | 2 | 3;
  onChange: (value: 1 | 2 | 3) => void;
}

export function HierarchySelector({ value, onChange }: HierarchySelectorProps) {
  const hierarchyLevels = [
    { level: 1 as const, ...HIERARCHY_CONFIG[1] },
    { level: 2 as const, ...HIERARCHY_CONFIG[2] },
    { level: 3 as const, ...HIERARCHY_CONFIG[3] },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-card-foreground">
        Nivel de compromiso
      </label>
      <p className="text-xs text-muted-foreground mb-3">
        ¿Que tan urgente es esta tarea para Lana?
      </p>
      <div className="grid grid-cols-1 gap-2">
        {hierarchyLevels.map((h) => (
          <button
            key={h.level}
            type="button"
            onClick={() => onChange(h.level)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
              value === h.level
                ? `${h.bgColor} ${h.color} ring-2 ring-offset-2`
                : 'border-border bg-card hover:bg-secondary'
            )}
          >
            <span className="text-2xl">{h.icon}</span>
            <div className="flex-1">
              <div className={cn(
                'font-semibold text-sm',
                value === h.level ? h.textColor : 'text-card-foreground'
              )}>
                {h.label}
              </div>
              <div className={cn(
                'text-xs',
                value === h.level ? h.textColor : 'text-muted-foreground'
              )}>
                {h.description}
              </div>
            </div>
            {value === h.level && (
              <div className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center',
                h.level === 1 ? 'bg-red-500' : h.level === 2 ? 'bg-amber-500' : 'bg-green-500'
              )}>
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

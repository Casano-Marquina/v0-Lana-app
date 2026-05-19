'use client';

import { useState } from 'react';
import { Task } from '@/lib/db';
import { REALMS } from '@/lib/realms';
import { formatDate } from '@/lib/db';
import { cn } from '@/lib/utils';
import { Check, Trash2, Clock, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { HIERARCHY_CONFIG, getPostponeMessage } from '@/lib/taskHierarchy';
import { Lana } from './Lana';

interface TaskCardProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onPostpone?: (task: Task) => void;
  onEscalate?: (task: Task) => void;
  isCompact?: boolean;
  showHierarchyControls?: boolean;
}

export function TaskCard({
  task,
  onToggle,
  onDelete,
  onEdit,
  onPostpone,
  onEscalate,
  isCompact = false,
  showHierarchyControls = true,
}: TaskCardProps) {
  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [postponeMessage, setPostponeMessage] = useState('');
  
  const realm = REALMS[task.realm];
  const today = formatDate(new Date());
  const isOverdue = task.dueDate < today && !task.completed;
  const hierarchy = task.hierarchy || 2;
  const hierarchyConfig = HIERARCHY_CONFIG[hierarchy as 1 | 2 | 3];

  const handlePostpone = () => {
    setPostponeMessage(getPostponeMessage());
    setShowPostponeModal(true);
  };

  const confirmPostpone = () => {
    if (onPostpone) {
      onPostpone(task);
    }
    setTimeout(() => setShowPostponeModal(false), 2000);
  };

  return (
    <>
      <div
        className={cn(
          'rounded-xl border-l-4 transition-all duration-300 bg-card hover:shadow-lg cursor-pointer group relative overflow-hidden',
          task.completed && 'opacity-60',
          isCompact ? 'py-2 px-3' : 'p-4',
          // Hierarchy-based styling
          hierarchy === 1 && !task.completed && 'border-l-red-500 ring-1 ring-red-200 shadow-red-100/50',
          hierarchy === 2 && !task.completed && 'border-l-amber-500',
          hierarchy === 3 && !task.completed && 'border-l-green-500',
          // Animation for critical tasks
          hierarchy === 1 && !task.completed && 'animate-pulse-subtle'
        )}
        style={{ 
          borderLeftColor: hierarchy === 1 ? undefined : realm.color.main,
        }}
        onClick={() => onEdit(task)}
      >
        {/* Hierarchy indicator badge */}
        {!task.completed && (
          <div className={cn(
            'absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium',
            hierarchyConfig.badgeColor
          )}>
            {hierarchyConfig.icon} {hierarchy === 1 ? 'Critica' : hierarchy === 2 ? 'Flexible' : 'Postergable'}
          </div>
        )}

        <div className="flex items-start gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task);
            }}
            className={cn(
              'mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center',
              task.completed
                ? 'bg-green-500 border-green-500'
                : hierarchy === 1
                  ? 'border-red-500 bg-red-50 hover:bg-red-100'
                  : isOverdue
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
            )}
          >
            {task.completed && <Check className="w-4 h-4 text-white" />}
          </button>

          <div className="flex-1 min-w-0 pr-16">
            <h3
              className={cn(
                'font-semibold text-sm',
                task.completed
                  ? 'line-through text-muted-foreground'
                  : hierarchy === 1
                    ? 'text-red-700'
                    : isOverdue
                      ? 'text-red-600'
                      : 'text-card-foreground'
              )}
            >
              {task.title}
            </h3>

            {task.description && !isCompact && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
            )}

            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>
                  {task.dueDate === today ? 'Hoy' : task.dueDate}
                  {task.dueTime && ` a las ${task.dueTime}`}
                </span>
              </div>
              
              {/* Priority indicator */}
              <div className="flex items-center gap-1">
                {task.priority === 'high' && (
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500" title="Alta prioridad" />
                )}
                {task.priority === 'medium' && (
                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-500" title="Prioridad media" />
                )}
                {task.priority === 'low' && (
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500" title="Baja prioridad" />
                )}
              </div>
            </div>

            {task.reminderEnabled && (
              <div className="mt-1 text-xs text-blue-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                Recordatorio a las {task.reminderTime}
              </div>
            )}

            {/* Hierarchy controls */}
            {showHierarchyControls && !task.completed && (
              <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                {hierarchy > 1 && onEscalate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEscalate(task);
                    }}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                    title="Subir prioridad"
                  >
                    <ChevronUp className="w-3 h-3" />
                    Urgente
                  </button>
                )}
                {hierarchy < 3 && onPostpone && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePostpone();
                    }}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                    title="Postergar"
                  >
                    <ChevronDown className="w-3 h-3" />
                    Postergar
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Postpone Modal with Lana validation */}
      {showPostponeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <Lana realm="personal" size="md" className="mx-auto" />
              
              <div className="mt-4 space-y-3">
                <h3 className="text-lg font-bold text-card-foreground">
                  Soltar el hilo...
                </h3>
                <p className="text-muted-foreground italic">
                  &quot;{postponeMessage}&quot;
                </p>
                <p className="text-sm text-muted-foreground">
                  - Lana
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPostponeModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-card-foreground hover:bg-secondary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmPostpone}
                  className="flex-1 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Postergar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

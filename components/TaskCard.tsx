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
          'cozy-card border-l-4 transition-all duration-300 hover:shadow-lg cursor-pointer group relative overflow-hidden',
          task.completed && 'opacity-50',
          isCompact ? 'py-2 px-3 rounded-lg' : 'p-4 rounded-2xl',
          // Hierarchy-based styling
          hierarchy === 1 && !task.completed && 'border-l-red-500 ring-1 ring-red-200/40 shadow-red-100/20 animate-pulse-subtle',
          hierarchy === 2 && !task.completed && 'border-l-amber-500 ring-1 ring-amber-200/40',
          hierarchy === 3 && !task.completed && 'border-l-green-500 ring-1 ring-green-200/40'
        )}
        style={{ 
          borderLeftColor: hierarchy === 1 && !task.completed ? '#ef4444' : hierarchy === 2 && !task.completed ? '#f59e0b' : hierarchy === 3 && !task.completed ? '#22c55e' : realm.color.main,
        }}
        onClick={() => onEdit(task)}
      >
        {/* Hierarchy indicator badge - Cozy style */}
        {!task.completed && (
          <div className={cn(
            'absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm soft-button',
            hierarchyConfig.badgeColor
          )}>
            {hierarchyConfig.icon} {hierarchy === 1 ? 'Crítica' : hierarchy === 2 ? 'Flexible' : 'Postergable'}
          </div>
        )}

        <div className="flex items-start gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task);
            }}
            className={cn(
              'mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center soft-button',
              task.completed
                ? 'bg-green-500 border-green-500'
                : hierarchy === 1
                  ? 'border-red-500 bg-red-50/50 hover:bg-red-100/50'
                  : isOverdue
                    ? 'border-red-500 bg-red-50/50'
                    : 'border-gray-300/60 hover:border-gray-400'
            )}
          >
            {task.completed && <Check className="w-4 h-4 text-white" />}
          </button>

          <div className="flex-1 min-w-0 pr-16">
            <h3
              className={cn(
                'font-semibold text-sm',
                task.completed
                  ? 'line-through text-gray-400 dark:text-gray-600'
                  : hierarchy === 1
                    ? 'text-red-700 dark:text-red-400'
                    : isOverdue
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-800 dark:text-white'
              )}
            >
              {task.title}
            </h3>

            {task.description && !isCompact && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
            )}

            <div className="flex items-center gap-3 mt-2 text-xs">
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>
                  {task.dueDate === today ? 'Hoy' : task.dueDate}
                  {task.dueTime && ` a las ${task.dueTime}`}
                </span>
              </div>
              
              {/* Priority indicator - Subtle dots */}
              <div className="flex items-center gap-1">
                {task.priority === 'high' && (
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500" title="Alta prioridad" />
                )}
                {task.priority === 'medium' && (
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500" title="Prioridad media" />
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
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg soft-button bg-amber-100/70 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200/70 transition-colors"
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
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg soft-button bg-green-100/70 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200/70 transition-colors"
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
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Postpone Modal with Lana validation - Glassmorphic */}
      {showPostponeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center glass-card/50 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="glass-card rounded-3xl shadow-2xl max-w-sm w-full mx-4 p-6 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-4">
              <Lana realm="personal" size="md" className="mx-auto animate-float" />
              
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Soltar el hilo...
                </h3>
                <p className="text-gray-600 dark:text-gray-300 italic">
                  &quot;{postponeMessage}&quot;
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  - Lana
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPostponeModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl soft-button text-gray-700 dark:text-gray-200 hover:scale-105 transition-transform"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmPostpone}
                  className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white hover:shadow-lg hover:scale-105 transition-all font-semibold flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Postergar
                </button>
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

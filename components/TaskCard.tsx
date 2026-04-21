'use client';

import { Task } from '@/lib/db';
import { REALMS } from '@/lib/realms';
import { formatDate } from '@/lib/db';
import { cn } from '@/lib/utils';
import { Check, Trash2, Clock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  isCompact?: boolean;
}

export function TaskCard({
  task,
  onToggle,
  onDelete,
  onEdit,
  isCompact = false,
}: TaskCardProps) {
  const realm = REALMS[task.realm];
  const today = formatDate(new Date());
  const isOverdue = task.dueDate < today && !task.completed;

  return (
    <div
      className={cn(
        'rounded-lg border-l-4 p-3 transition-all duration-200 bg-white hover:shadow-md cursor-pointer group',
        task.completed && 'opacity-60',
        isCompact ? 'py-2' : 'p-4'
      )}
      style={{ borderLeftColor: realm.color.main }}
      onClick={() => onEdit(task)}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task);
          }}
          className={cn(
            'mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center',
            task.completed
              ? 'bg-green-500 border-green-500'
              : isOverdue
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
          )}
        >
          {task.completed && <Check className="w-3 h-3 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                'font-semibold text-sm',
                task.completed
                  ? 'line-through text-gray-500'
                  : isOverdue
                    ? 'text-red-600'
                    : 'text-gray-900'
              )}
            >
              {task.title}
            </h3>
            <div className="flex-shrink-0">
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

          {task.description && !isCompact && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            <span>
              {task.dueDate === today ? 'Hoy' : task.dueDate}
              {task.dueTime && ` a las ${task.dueTime}`}
            </span>
          </div>

          {task.reminderEnabled && (
            <div className="mt-1 text-xs text-blue-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Recordatorio a las {task.reminderTime}
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

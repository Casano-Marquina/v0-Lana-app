'use client';

import { useEffect, useState } from 'react';
import { Task } from '@/lib/db';
import { REALMS } from '@/lib/realms';
import { Bell, X, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReminderModalProps {
  task: Task | null;
  onDismiss: () => void;
  onComplete: () => void;
  onSnooze: () => void;
}

export function ReminderModal({ task, onDismiss, onComplete, onSnooze }: ReminderModalProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (task) {
      setAnimate(true);
      // Auto-dismiss after 30 seconds
      const timer = setTimeout(onDismiss, 30000);
      return () => clearTimeout(timer);
    }
  }, [task, onDismiss]);

  if (!task) return null;

  const realm = REALMS[task.realm];

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300',
      animate ? 'bg-black bg-opacity-50' : 'bg-black bg-opacity-0 pointer-events-none'
    )}>
      <div
        className={cn(
          'bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300',
          animate ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        )}
      >
        {/* Header */}
        <div
          className="p-6 text-white rounded-t-xl flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${realm.color.main}, ${realm.color.dark})` }}
        >
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 animate-bounce" />
            <div>
              <div className="text-sm opacity-90">Recordatorio</div>
              <div className="font-semibold">{realm.name}</div>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-gray-600 mt-2">{task.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>
              {task.dueTime ? `${task.dueTime}` : 'Sin hora específica'}
            </span>
          </div>

          {task.priority === 'high' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-sm font-medium text-red-700">🔴 Prioridad Alta</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onSnooze}
            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Posponer
          </button>
          <button
            onClick={onComplete}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Completar
          </button>
        </div>
      </div>
    </div>
  );
}

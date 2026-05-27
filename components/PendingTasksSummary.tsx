'use client';

import { Task } from '@/lib/db';
import { REALMS } from '@/lib/realms';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingTasksSummaryProps {
  tasks: Task[];
  className?: string;
}

export function PendingTasksSummary({ tasks, className = '' }: PendingTasksSummaryProps) {
  const pendingTasks = tasks.filter(t => !t.completed);
  const tasksByRealm = pendingTasks.reduce((acc, task) => {
    if (!acc[task.realm]) {
      acc[task.realm] = [];
    }
    acc[task.realm].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
          {pendingTasks.length} pendiente{pendingTasks.length !== 1 ? 's' : ''}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Distribuido en tus ambitos de vida
        </p>
      </div>

      {pendingTasks.length === 0 ? (
        <div className="text-center py-8 cozy-card rounded-2xl">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-70" />
          <p className="text-gray-600 dark:text-gray-300">
            No hay tareas pendientes. Excelente!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(REALMS).map(([realmId, realm]) => {
            const realmTasks = tasksByRealm[realmId] || [];
            if (realmTasks.length === 0) return null;
            const realmClass = realmId === 'personal' ? 'realm-personal' : realmId === 'academic' ? 'realm-academic' : 'realm-relational';

            return (
              <div key={realmId} className={cn('cozy-card rounded-xl p-4 space-y-2', realmClass)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-lg shadow-sm"
                      style={{ backgroundColor: realm.color.main }}
                    />
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {realm.name}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-800 dark:text-white">
                    {realmTasks.length}
                  </span>
                </div>
                <div className="space-y-1 pl-6">
                  {realmTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2 truncate"
                    >
                      <Circle className="w-2 h-2 mt-1.5 flex-shrink-0" />
                      <span className="truncate">{task.title}</span>
                    </div>
                  ))}
                  {realmTasks.length > 3 && (
                    <p className="text-xs font-medium pl-4" style={{ color: realm.color.main }}>
                      +{realmTasks.length - 3} mas
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

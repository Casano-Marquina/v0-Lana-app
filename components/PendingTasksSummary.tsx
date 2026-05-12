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
    <div className={cn('bg-card border border-border rounded-2xl p-6 shadow-md', className)}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground mb-1">
            {pendingTasks.length} pendiente{pendingTasks.length !== 1 ? 's' : ''}
          </h2>
          <p className="text-sm text-muted-foreground">
            Distribuido en tus ámbitos de vida
          </p>
        </div>

        {pendingTasks.length === 0 ? (
          <div className="text-center py-8">
            <Circle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No hay tareas pendientes. Excelente!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(REALMS).map(([realmId, realm]) => {
              const realmTasks = tasksByRealm[realmId] || [];
              if (realmTasks.length === 0) return null;

              return (
                <div key={realmId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: realm.color.main }}
                      />
                      <span className="font-medium text-foreground">
                        {realm.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {realmTasks.length}
                    </span>
                  </div>
                  <div className="space-y-1 pl-5">
                    {realmTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="text-sm text-muted-foreground flex items-start gap-2 truncate hover:text-foreground transition-colors"
                      >
                        <Circle className="w-3 h-3 mt-1 flex-shrink-0" />
                        <span className="truncate">{task.title}</span>
                      </div>
                    ))}
                    {realmTasks.length > 3 && (
                      <p className="text-xs text-accent pl-5 font-medium">
                        +{realmTasks.length - 3} más
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pendingTasks.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Haz clic en cualquier ámbito para ver más detalles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getTasksByRealm,
  updateTask,
  deleteTask,
  Task,
  formatDate,
  getBackground,
} from '@/lib/db';
import { REALMS, RealmType } from '@/lib/realms';
import { TaskCard } from '@/components/TaskCard';
import { TaskDetailPanel } from '@/components/TaskDetailPanel';
import { EnergyBadge, HeavyTaskWarning } from '@/components/EnergyCheckIn';
import { useEnergyLevel } from '@/hooks/useEnergyLevel';
import { filterTasksByEnergyAndHierarchy, postponeTask, escalateTask } from '@/lib/taskHierarchy';
import { MobileHeader } from '@/components/MobileHeader';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Lana } from '@/components/Lana';

export default function RealmPage() {
  const params = useParams();
  const router = useRouter();
  const realmId = params.realmId as string;
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [backgroundValue, setBackgroundValue] = useState<string>('#ffffff');
  const [backgroundType, setBackgroundType] = useState<'color' | 'image'>('color');
  const [loading, setLoading] = useState(true);
  const [heavyTaskWarning, setHeavyTaskWarning] = useState<Task | null>(null);
  const { energyLevel } = useEnergyLevel();

  const realm = REALMS[realmId as RealmType];

  useEffect(() => {
    if (!realm) {
      router.push('/');
      return;
    }

    const loadData = async () => {
      try {
        const realmTasks = await getTasksByRealm(realmId as RealmType);
        setTasks(realmTasks);

        const bgData = await getBackground(realmId as RealmType);
        if (bgData) {
          console.log('[v0] Background loaded:', bgData);
          setBackgroundValue(bgData.value);
          setBackgroundType(bgData.type);
        } else {
          console.log('[v0] No background found for realm:', realmId);
          setBackgroundValue(realm.color.light);
          setBackgroundType('color');
        }
      } catch (error) {
        console.error('[v0] Error loading realm data:', error);
        setBackgroundValue(realm.color.light);
        setBackgroundType('color');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [realmId, realm, router]);

  const handleToggle = async (task: Task) => {
    const updated = { ...task, completed: !task.completed };
    await updateTask(updated);
    setTasks(tasks.map(t => (t.id === task.id ? updated : t)));
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handlePostpone = async (task: Task) => {
    const postponed = postponeTask(task);
    await updateTask(postponed);
    setTasks(tasks.map(t => t.id === task.id ? postponed : t));
  };

  const handleEscalate = async (task: Task) => {
    const escalated = escalateTask(task);
    await updateTask(escalated);
    setTasks(tasks.map(t => t.id === task.id ? escalated : t));
  };

  // Filter tasks based on energy level and hierarchy
  const { visible: filteredTasks, hidden: hiddenTasks, suggestion } = filterTasksByEnergyAndHierarchy(tasks, energyLevel);
  const pendingTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  // Check if there are hidden tasks due to low energy
  const hiddenTasksCount = hiddenTasks.length;

  const backgroundStyle: React.CSSProperties = {
    backgroundImage: backgroundType === 'image' ? `url(${backgroundValue})` : undefined,
    backgroundColor: backgroundType === 'color' ? backgroundValue : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  const isImageBackground = backgroundType === 'image';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!realm) {
    return null;
  }

  return (
    <div className="min-h-screen" style={backgroundStyle}>
      {/* Heavy Task Warning Modal */}
      {heavyTaskWarning && (
        <HeavyTaskWarning
          onProceed={() => {
            setSelectedTask(heavyTaskWarning);
            setHeavyTaskWarning(null);
          }}
          onCancel={() => setHeavyTaskWarning(null)}
        />
      )}

      {/* Overlay oscuro si hay fondo de imagen */}
      {isImageBackground && (
        <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
      )}

      {/* Header - Mobile optimized */}
      <MobileHeader
        title={realm.name}
        subtitle={realm.subtitle}
        energyLevel={energyLevel}
        showLana={true}
      />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-3 py-4 space-y-3 pb-24">
        {/* Quick Stats - Compact */}
        <div className="grid grid-cols-3 gap-2">
          <div className="cozy-card rounded-xl p-3 text-center">
            <div className="text-2xl font-bold" style={{ color: realm.color.main }}>
              {pendingTasks.length}
            </div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">Pendientes</div>
          </div>
          <div className="cozy-card rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {completedTasks.length}
            </div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">Completadas</div>
          </div>
          <div className="cozy-card rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {tasks.length}
            </div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">Total</div>
          </div>
        </div>

        {/* Energy suggestion - Compact */}
        {suggestion && (
          <div className="cozy-card rounded-xl p-3 flex items-start gap-2 bg-blue-100/50 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/50">
            <Lana realm="academic" size="sm" className="flex-shrink-0" />
            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">{suggestion}</p>
          </div>
        )}

        {/* Energy Level Notice */}
        {energyLevel === 'low' && hiddenTasksCount > 0 && (
          <div className="cozy-card rounded-xl p-3 flex items-start gap-2 bg-amber-100/50 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/50">
            <Lana realm="personal" size="sm" className="flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                Lana protege {hiddenTasksCount} tarea(s) pesada(s)
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-0.5">
                Energía baja hoy - solo lo esencial
              </p>
            </div>
          </div>
        )}

        {/* Tasks */}
        {tasks.length === 0 ? (
          <div className="text-center cozy-card rounded-2xl p-8">
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
              ¡Sin tareas!
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Todas completadas - ¡muy bien!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 px-2">
                  Pendientes ({pendingTasks.length})
                </h3>
                <div className="space-y-2">
                  {pendingTasks.map(task => (
                    <div key={task.id} className="rounded-lg overflow-hidden">
                      <TaskCard
                        task={task}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onEdit={(t) => setSelectedTask(t)}
                        onPostpone={handlePostpone}
                        onEscalate={handleEscalate}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 px-2 opacity-60">
                  Completadas ({completedTasks.length})
                </h3>
                <div className="space-y-1 opacity-60">
                  {completedTasks.map(task => (
                    <div key={task.id} className="rounded-lg overflow-hidden">
                      <TaskCard
                        task={task}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onEdit={(t) => setSelectedTask(t)}
                        showHierarchyControls={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

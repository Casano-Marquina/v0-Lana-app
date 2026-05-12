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
import { useEnergyLevel, filterTasksByEnergy, isHeavyTask, energyMessages } from '@/hooks/useEnergyLevel';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
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

  // Filter tasks based on energy level
  const filteredTasks = filterTasksByEnergy(tasks, energyLevel);
  const pendingTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  // Check if there are hidden tasks due to low energy
  const hiddenTasksCount = tasks.length - filteredTasks.length;

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

      {/* Header */}
      <div className={cn(
        'sticky top-0 z-40',
        isImageBackground ? 'bg-card/90 backdrop-blur-sm' : 'bg-card'
      )}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Lana realm={realmId as RealmType} size="sm" />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: realm.color.main }}>
                {realm.name}
              </h1>
              <p className="text-sm text-muted-foreground">{realm.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {energyLevel && <EnergyBadge level={energyLevel} />}
            <Link
              href={`/create?realm=${realmId}`}
              className={cn(
                'text-white rounded-lg p-2 transition-all shadow-sm hover:shadow-md'
              )}
              style={{ backgroundColor: realm.color.main }}
              title="Nueva tarea"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        'relative z-10 max-w-4xl mx-auto px-4 py-8'
      )}>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className={cn(
            'p-4 rounded-lg backdrop-blur-sm',
            isImageBackground ? 'bg-white/80' : 'bg-gray-50'
          )}>
            <div className="text-2xl font-bold" style={{ color: realm.color.main }}>
              {pendingTasks.length}
            </div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
          <div className={cn(
            'p-4 rounded-lg backdrop-blur-sm',
            isImageBackground ? 'bg-white/80' : 'bg-green-50'
          )}>
            <div className="text-2xl font-bold text-green-600">
              {completedTasks.length}
            </div>
            <div className="text-sm text-gray-600">Completadas</div>
          </div>
          <div className={cn(
            'p-4 rounded-lg backdrop-blur-sm',
            isImageBackground ? 'bg-white/80' : 'bg-gray-50'
          )}>
            <div className="text-2xl font-bold text-gray-600">
              {tasks.length}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>

        {/* Energy Level Notice */}
        {energyLevel === 'low' && hiddenTasksCount > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Lana realm="personal" size="sm" />
            <div>
              <p className="text-amber-800 font-medium">
                Lana esta protegiendo {hiddenTasksCount} tarea(s) pesada(s) para ti
              </p>
              <p className="text-amber-700 text-sm mt-1">
                Marcaste energia baja hoy. Las tareas academicas de alta prioridad estan ocultas para que puedas descansar.
              </p>
            </div>
          </div>
        )}

        {/* Tasks */}
        {tasks.length === 0 ? (
          <div className={cn(
            'text-center py-12 rounded-lg',
            isImageBackground ? 'bg-white/80' : 'bg-gray-50'
          )}>
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              ¡Sin tareas!
            </h3>
            <p className="text-gray-600 mb-6">
              Todas las tareas de este ámbito están completadas
            </p>
            <Link
              href={`/create?realm=${realmId}`}
              className="inline-block px-6 py-2 text-white rounded-lg transition-all"
              style={{ backgroundColor: realm.color.main }}
            >
              Crear Nueva Tarea
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTasks.length > 0 && (
              <div>
                <h3 className={cn(
                  'text-lg font-semibold mb-3 px-2',
                  isImageBackground ? 'text-white' : 'text-gray-900'
                )}>
                  Pendientes ({pendingTasks.length})
                </h3>
                <div className="space-y-2">
                  {pendingTasks.map(task => (
                    <div
                      key={task.id}
                      className={cn(
                        'rounded-lg overflow-hidden',
                        isImageBackground && 'backdrop-blur-sm'
                      )}
                    >
                      <TaskCard
                        task={task}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div className="mt-8">
                <h3 className={cn(
                  'text-lg font-semibold mb-3 px-2 opacity-60',
                  isImageBackground ? 'text-white' : 'text-gray-900'
                )}>
                  Completadas ({completedTasks.length})
                </h3>
                <div className="space-y-2 opacity-60">
                  {completedTasks.map(task => (
                    <div
                      key={task.id}
                      className={cn(
                        'rounded-lg overflow-hidden',
                        isImageBackground && 'backdrop-blur-sm'
                      )}
                    >
                      <TaskCard
                        task={task}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
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

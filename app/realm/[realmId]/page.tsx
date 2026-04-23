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
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RealmPage() {
  const params = useParams();
  const router = useRouter();
  const realmId = params.realmId as string;
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [loading, setLoading] = useState(true);

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
        if (bgData?.image) {
          setBackgroundImage(bgData.image);
        }
        if (bgData?.color) {
          setBackgroundColor(bgData.color);
        }
      } catch (error) {
        console.error('[v0] Error loading realm data:', error);
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

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const backgroundStyle: React.CSSProperties = {
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundColor: !backgroundImage ? backgroundColor : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

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
      {/* Overlay oscuro si hay fondo de imagen */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
      )}

      {/* Header */}
      <div className={cn(
        'sticky top-0 z-40',
        backgroundImage ? 'bg-white/90 backdrop-blur-sm' : 'bg-white'
      )}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: realm.color.main }}>
                {realm.name}
              </h1>
              <p className="text-sm text-gray-600">{realm.description}</p>
            </div>
          </div>

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

      {/* Content */}
      <div className={cn(
        'relative z-10 max-w-4xl mx-auto px-4 py-8',
        backgroundImage && 'backdrop-blur-0'
      )}>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className={cn(
            'p-4 rounded-lg backdrop-blur-sm',
            backgroundImage ? 'bg-white/80' : 'bg-gray-50'
          )}>
            <div className="text-2xl font-bold" style={{ color: realm.color.main }}>
              {pendingTasks.length}
            </div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
          <div className={cn(
            'p-4 rounded-lg backdrop-blur-sm',
            backgroundImage ? 'bg-white/80' : 'bg-green-50'
          )}>
            <div className="text-2xl font-bold text-green-600">
              {completedTasks.length}
            </div>
            <div className="text-sm text-gray-600">Completadas</div>
          </div>
          <div className={cn(
            'p-4 rounded-lg backdrop-blur-sm',
            backgroundImage ? 'bg-white/80' : 'bg-gray-50'
          )}>
            <div className="text-2xl font-bold text-gray-600">
              {tasks.length}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>

        {/* Tasks */}
        {tasks.length === 0 ? (
          <div className={cn(
            'text-center py-12 rounded-lg',
            backgroundImage ? 'bg-white/80' : 'bg-gray-50'
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
                  backgroundImage ? 'text-white' : 'text-gray-900'
                )}>
                  Pendientes ({pendingTasks.length})
                </h3>
                <div className="space-y-2">
                  {pendingTasks.map(task => (
                    <div
                      key={task.id}
                      className={cn(
                        'rounded-lg overflow-hidden',
                        backgroundImage && 'backdrop-blur-sm'
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
                  backgroundImage ? 'text-white' : 'text-gray-900'
                )}>
                  Completadas ({completedTasks.length})
                </h3>
                <div className="space-y-2 opacity-60">
                  {completedTasks.map(task => (
                    <div
                      key={task.id}
                      className={cn(
                        'rounded-lg overflow-hidden',
                        backgroundImage && 'backdrop-blur-sm'
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

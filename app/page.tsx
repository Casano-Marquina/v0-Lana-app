'use client';

import { useEffect, useState } from 'react';
import {
  getAllTasks,
  getTasksByRealm,
  Task,
  getBackground,
} from '@/lib/db';
import { REALMS, RealmType } from '@/lib/realms';
import { ReminderModal } from '@/components/ReminderModal';
import { useReminders } from '@/hooks/useReminders';
import Link from 'next/link';
import { Plus, Settings, Palette, Calendar, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [realmStats, setRealmStats] = useState<Record<RealmType, { pending: number; completed: number; total: number }>>({
    personal: { pending: 0, completed: 0, total: 0 },
    academic: { pending: 0, completed: 0, total: 0 },
    relational: { pending: 0, completed: 0, total: 0 },
  });
  const [realmBackgrounds, setRealmBackgrounds] = useState<Record<RealmType, { image?: string; color?: string }>>({
    personal: {},
    academic: {},
    relational: {},
  });
  const [loading, setLoading] = useState(true);
  const { reminderTask, onDismissReminder, onSnoozeReminder, onCompleteReminder } = useReminders();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const allTasks = await getAllTasks();
      setTasks(allTasks);

      // Calculate stats for each realm
      const newStats = { ...realmStats };
      const newBgs = { ...realmBackgrounds };

      for (const realm of Object.values(REALMS)) {
        const realmTasks = allTasks.filter((t) => t.realm === realm.id);
        newStats[realm.id as RealmType] = {
          pending: realmTasks.filter((t) => !t.completed).length,
          completed: realmTasks.filter((t) => t.completed).length,
          total: realmTasks.length,
        };

        // Get background for realm
        const bg = await getBackground(realm.id as RealmType);
        newBgs[realm.id as RealmType] = bg || {};
      }

      setRealmStats(newStats);
      setRealmBackgrounds(newBgs);
    } catch (error) {
      console.error('[v0] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const realmList = Object.values(REALMS) as typeof REALMS[keyof typeof REALMS][];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <ReminderModal
        task={reminderTask}
        onDismiss={onDismissReminder}
        onSnooze={onSnoozeReminder}
        onComplete={onCompleteReminder}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Mi Agenda
            </h1>
            <p className="text-xs text-gray-500">Tus prioridades de vida</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/weekly"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Ver semana"
            >
              <Calendar className="w-5 h-5 text-green-600" />
            </Link>
            <Link
              href="/backgrounds"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Personalizar fondos"
            >
              <Palette className="w-5 h-5 text-purple-600" />
            </Link>
            <Link
              href="/settings"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Configuración"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </Link>
            <Link
              href="/create"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg p-2 transition-all shadow-sm hover:shadow-md"
              title="Nueva tarea"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Global Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-blue-600">{pendingCount}</div>
                <div className="text-sm text-gray-600">Pendientes</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-green-600">{completedCount}</div>
                <div className="text-sm text-gray-600">Completadas</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-purple-600">{tasks.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>

            {/* Realm Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {realmList.map((realm) => {
                const stats = realmStats[realm.id as RealmType];
                const bg = realmBackgrounds[realm.id as RealmType];
                const backgroundStyle: React.CSSProperties = {
                  backgroundImage: bg?.image ? `url(${bg.image})` : undefined,
                  backgroundColor: !bg?.image ? (bg?.color || realm.color.light) : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                };

                return (
                  <Link
                    key={realm.id}
                    href={`/realm/${realm.id}`}
                    className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
                  >
                    {/* Background */}
                    <div
                      className="absolute inset-0"
                      style={backgroundStyle}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-black/20 to-black/40" />

                    {/* Content */}
                    <div className="relative p-6 text-white min-h-64 flex flex-col justify-between">
                      {/* Header */}
                      <div>
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: realm.color.main }}
                        >
                          <span className="text-xl">{realm.emoji}</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">{realm.name}</h3>
                        <p className="text-sm opacity-90">{realm.subtitle}</p>
                      </div>

                      {/* Stats */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm opacity-90">Pendientes</span>
                          <span className="text-xl font-bold">{stats.pending}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm opacity-90">Completadas</span>
                          <span className="text-xl font-bold">{stats.completed}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-white/20 rounded-full h-2 mt-4 overflow-hidden">
                          <div
                            className="bg-white h-full rounded-full transition-all"
                            style={{
                              width: stats.total === 0 ? '0%' : `${(stats.completed / stats.total) * 100}%`,
                            }}
                          />
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-2 mt-4 pt-2 border-t border-white/20 group-hover:translate-x-1 transition-transform">
                          <span className="text-sm font-medium">Ver ámbito</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Empty State */}
            {tasks.length === 0 && (
              <div className="mt-12 bg-white rounded-lg p-12 text-center border border-gray-100">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¡Comienza a planificar!
                </h3>
                <p className="text-gray-600 mb-6">
                  Crea tu primera tarea en cualquiera de tus tres ámbitos de vida
                </p>
                <Link
                  href="/create"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2 transition-colors"
                >
                  Crear Primera Tarea
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

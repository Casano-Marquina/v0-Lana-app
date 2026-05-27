'use client';

import { useEffect, useState } from 'react';
import {
  getAllTasks,
  Task,
  getBackground,
} from '@/lib/db';
import { REALMS, RealmType } from '@/lib/realms';
import { ReminderModal } from '@/components/ReminderModal';
import { useReminders } from '@/hooks/useReminders';
import { useEnergyLevel, energyMessages } from '@/hooks/useEnergyLevel';
import { EnergyCheckIn } from '@/components/EnergyCheckIn';
import { MobileHeader } from '@/components/MobileHeader';
import { useLayout } from '@/contexts/LayoutContext';
import { NavLink } from '@/components/NavLink';
import { Plus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Lana } from '@/components/Lana';

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
  const [showEnergyCheckIn, setShowEnergyCheckIn] = useState(false);
  const { reminderTask, onDismissReminder, onSnoozeReminder, onCompleteReminder } = useReminders();
  const { energyLevel, hasCheckedInToday, isLoading: energyLoading, setEnergyLevel, resetCheckIn } = useEnergyLevel();

  useEffect(() => {
    loadData();
  }, []);

  // Show energy check-in modal if user hasn't checked in today
  useEffect(() => {
    if (!energyLoading && !hasCheckedInToday && !loading) {
      // Small delay to let the UI settle
      const timer = setTimeout(() => {
        setShowEnergyCheckIn(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [energyLoading, hasCheckedInToday, loading]);

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
  const { isMobileLayout } = useLayout();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleEnergySelect = (level: 'low' | 'medium' | 'high') => {
    setEnergyLevel(level);
    setShowEnergyCheckIn(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Energy Check-in Modal */}
      {showEnergyCheckIn && (
        <EnergyCheckIn 
          onSelect={handleEnergySelect}
          onSkip={() => {
            setEnergyLevel('medium'); // Default to medium if skipped
            setShowEnergyCheckIn(false);
          }}
        />
      )}

      <ReminderModal
        task={reminderTask}
        onDismiss={onDismissReminder}
        onSnooze={onSnoozeReminder}
        onComplete={onCompleteReminder}
      />

      {/* Header - Mobile optimized */}
      <MobileHeader
        title="Mi Agenda"
        subtitle="Tus prioridades de vida"
        energyLevel={energyLevel}
        onEnergyClick={() => setShowEnergyCheckIn(true)}
        showLana={true}
      />

      <main className={cn(
        'space-y-4',
        isMobileLayout 
          ? 'max-w-2xl mx-auto px-3 py-4 pb-24'
          : 'max-w-6xl mx-auto px-6 py-8'
      )}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Quick Stats - Responsive */}
            <div className={cn(
              'gap-3',
              isMobileLayout ? 'grid grid-cols-3 gap-2' : 'grid grid-cols-3 gap-4'
            )}>
              <div className={cn(
                'cozy-card rounded-2xl text-center realm-personal',
                isMobileLayout ? 'p-4' : 'p-6'
              )}>
                <div className={cn('font-bold text-green-600 dark:text-green-400', isMobileLayout ? 'text-3xl' : 'text-4xl')}>
                  {pendingCount}
                </div>
                <div className={cn('font-semibold text-green-700/80 dark:text-green-300/80 mt-1', isMobileLayout ? 'text-xs' : 'text-sm')}>
                  Pendientes
                </div>
              </div>
              <div className={cn(
                'cozy-card rounded-2xl text-center realm-academic',
                isMobileLayout ? 'p-4' : 'p-6'
              )}>
                <div className={cn('font-bold text-blue-600 dark:text-blue-400', isMobileLayout ? 'text-3xl' : 'text-4xl')}>
                  {completedCount}
                </div>
                <div className={cn('font-semibold text-blue-700/80 dark:text-blue-300/80 mt-1', isMobileLayout ? 'text-xs' : 'text-sm')}>
                  Completadas
                </div>
              </div>
              <div className={cn(
                'cozy-card rounded-2xl text-center realm-relational',
                isMobileLayout ? 'p-4' : 'p-6'
              )}>
                <div className={cn('font-bold text-pink-600 dark:text-pink-400', isMobileLayout ? 'text-3xl' : 'text-4xl')}>
                  {tasks.length}
                </div>
                <div className={cn('font-semibold text-pink-700/80 dark:text-pink-300/80 mt-1', isMobileLayout ? 'text-xs' : 'text-sm')}>
                  Total
                </div>
              </div>
            </div>

            {/* Realm Cards - Desktop Grid or Mobile Stack */}
            <div className={cn(
              isMobileLayout 
                ? 'space-y-3'
                : 'grid grid-cols-1 lg:grid-cols-3 gap-4'
            )}>
              {realmList.map((realm) => {
                const stats = realmStats[realm.id as RealmType];
                const realmClass = realm.id === 'personal' ? 'realm-personal' : realm.id === 'academic' ? 'realm-academic' : 'realm-relational';

                return (
                  <NavLink
                    key={realm.id}
                    href={`/realm/${realm.id}`}
                    className={cn(
                      'block cozy-card rounded-2xl transition-all active:scale-95 hover:scale-105 duration-200',
                      isMobileLayout ? 'p-5' : 'p-6 min-h-64 flex flex-col',
                      realmClass
                    )}
                  >
                    {/* Realm Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={cn(
                            'rounded-xl flex items-center justify-center flex-shrink-0',
                            isMobileLayout ? 'w-10 h-10' : 'w-12 h-12'
                          )}
                          style={{ backgroundColor: realm.color.main }}
                        >
                          <span className={isMobileLayout ? 'text-lg' : 'text-2xl'}>{realm.emoji}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className={cn(
                            'font-bold text-gray-800 dark:text-white line-clamp-1',
                            isMobileLayout ? 'text-base' : 'text-lg'
                          )}>
                            {realm.name}
                          </h3>
                          <p className={cn(
                            'text-gray-500 dark:text-gray-400',
                            isMobileLayout ? 'text-xs' : 'text-sm'
                          )}>
                            {realm.subtitle}
                          </p>
                        </div>
                      </div>
                      {!isMobileLayout && <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0 ml-2" />}
                    </div>

                    {/* Stats Row */}
                    <div className={cn(
                      'flex items-center justify-between gap-2',
                      isMobileLayout ? 'text-sm' : 'text-base'
                    )}>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600 dark:text-gray-300">Pendientes:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{stats.pending}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600 dark:text-gray-300">Completadas:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{stats.completed}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/40 dark:bg-black/20 rounded-full h-1.5 mt-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: stats.total === 0 ? '0%' : `${(stats.completed / stats.total) * 100}%`,
                          backgroundColor: realm.color.main,
                        }}
                      />
                    </div>

                    {!isMobileLayout && <div className="flex-1" />}
                  </NavLink>
                );
              })}
            </div>

            {/* Empty State with Lana - Compact Mobile */}
            {tasks.length === 0 && (
              <div className="mt-8 cozy-card rounded-2xl p-8 text-center space-y-4">
                <Lana realm="personal" size="md" showMessage customMessage="¡Crea tu primera tarea aquí arriba!" />
                <div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-1">
                    Comienza ahora
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Organiza tu vida en 3 ámbitos
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

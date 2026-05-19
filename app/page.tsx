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
import { useEnergyLevel, filterTasksByEnergy, energyMessages } from '@/hooks/useEnergyLevel';
import { EnergyCheckIn, EnergyBadge } from '@/components/EnergyCheckIn';
import Link from 'next/link';
import { NavLink } from '@/components/NavLink';
import { Plus, Settings, Palette, Calendar, ArrowRight, Home, PiggyBank, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Lana } from '@/components/Lana';
import { LanaAdvice } from '@/components/LanaAdvice';
import { PendingTasksSummary } from '@/components/PendingTasksSummary';

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

      {/* Header - Glassmorphic */}
      <header className="sticky top-0 z-50 glass-card border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lana realm="personal" size="sm" />
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Mi Agenda
              </h1>
              <p className="text-xs text-muted-foreground">Tus prioridades de vida</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Energy Level Badge */}
            {energyLevel && (
              <EnergyBadge 
                level={energyLevel} 
                onClick={() => setShowEnergyCheckIn(true)} 
              />
            )}
            <NavLink
              href="/"
              className="p-2 soft-button rounded-xl transition-colors"
              title="Ir al Dashboard"
            >
              <Home className="w-5 h-5 text-accent" />
            </NavLink>
            <NavLink
              href="/expenses"
              className="p-2 soft-button rounded-xl transition-colors"
              title="Historial de gastos"
            >
              <PiggyBank className="w-5 h-5 text-accent" />
            </NavLink>
            <NavLink
              href="/wellness"
              className="p-2 soft-button rounded-xl transition-colors"
              title="Bienestar con Lana"
            >
              <Star className="w-5 h-5 text-accent" />
            </NavLink>
            <NavLink
              href="/weekly"
              className="p-2 soft-button rounded-xl transition-colors"
              title="Ver semana"
            >
              <Calendar className="w-5 h-5 text-accent" />
            </NavLink>
            <NavLink
              href="/backgrounds"
              className="p-2 soft-button rounded-xl transition-colors"
              title="Personalizar fondos"
            >
              <Palette className="w-5 h-5 text-accent" />
            </NavLink>
            <NavLink
              href="/settings"
              className="p-2 soft-button rounded-xl transition-colors"
              title="Configuracion"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </NavLink>
            <Link
              href="/create"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl p-2 transition-all shadow-lg hover:shadow-xl hover:scale-105"
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Bento Grid Stats - TDAH-friendly compartments */}
            <div className="bento-grid mb-8">
              <div className="bento-item cozy-card realm-personal">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">{pendingCount}</div>
                <div className="text-sm font-medium text-green-700/80 dark:text-green-300/80 mt-1">Pendientes</div>
              </div>
              <div className="bento-item cozy-card realm-academic">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{completedCount}</div>
                <div className="text-sm font-medium text-blue-700/80 dark:text-blue-300/80 mt-1">Completadas</div>
              </div>
              <div className="bento-item cozy-card realm-relational">
                <div className="text-4xl font-bold text-pink-600 dark:text-pink-400">{tasks.length}</div>
                <div className="text-sm font-medium text-pink-700/80 dark:text-pink-300/80 mt-1">Total</div>
              </div>
            </div>

            {/* Realm Cards - Bento Style */}
            <div className="bento-grid">
              {realmList.map((realm) => {
                const stats = realmStats[realm.id as RealmType];
                const bg = realmBackgrounds[realm.id as RealmType];
                const realmClass = realm.id === 'personal' ? 'realm-personal' : realm.id === 'academic' ? 'realm-academic' : 'realm-relational';

                return (
                  <NavLink
                    key={realm.id}
                    href={`/realm/${realm.id}`}
                    className={cn(
                      "bento-item cozy-card group relative overflow-hidden block",
                      realmClass,
                      "min-h-64"
                    )}
                  >
                    {/* Custom background if set */}
                    {bg?.image && (
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: `url(${bg.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    )}

                    {/* Content */}
                    <div className="relative flex flex-col justify-between h-full">
                      {/* Header */}
                      <div>
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg"
                          style={{ backgroundColor: realm.color.main }}
                        >
                          <span className="text-xl">{realm.emoji}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{realm.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{realm.subtitle}</p>
                      </div>

                      {/* Stats */}
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Pendientes</span>
                          <span className="text-xl font-bold text-gray-800 dark:text-white">{stats.pending}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Completadas</span>
                          <span className="text-xl font-bold text-gray-800 dark:text-white">{stats.completed}</span>
                        </div>

                        {/* Progress Bar - Cozy style */}
                        <div className="w-full bg-white/40 dark:bg-black/20 rounded-full h-2 mt-4 overflow-hidden shadow-inner">
                          <div
                            className="h-full rounded-full transition-all bg-gradient-to-r"
                            style={{
                              width: stats.total === 0 ? '0%' : `${(stats.completed / stats.total) * 100}%`,
                              backgroundColor: realm.color.main,
                            }}
                          />
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-2 mt-4 pt-2 border-t border-gray-300/30 dark:border-white/10 group-hover:translate-x-1 transition-transform">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Ver ambito</span>
                          <ArrowRight className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                        </div>
                      </div>
                    </div>
                  </NavLink>
                );
              })}
            </div>

            {/* Empty State with Lana - Cozy Style */}
            {tasks.length === 0 && (
              <div className="mt-12 bento-item cozy-card p-12 text-center">
                <Lana realm="personal" size="lg" showMessage customMessage="Hola! Soy Lana, tu companera de productividad. Crea tu primera tarea y comencemos juntos!" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 mt-4">
                  Comienza a planificar
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Crea tu primera tarea en cualquiera de tus tres ambitos de vida
                </p>
                <NavLink
                  href="/create"
                  className="inline-block soft-button rounded-xl px-6 py-3 font-medium text-gray-800 dark:text-white hover:scale-105 transition-transform"
                >
                  Crear Primera Tarea
                </NavLink>
              </div>
            )}

            {/* Lana Advice and Pending Tasks Summary - Bento Layout */}
            {tasks.length > 0 && (
              <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lana Advice - Left Side */}
                <div className="lg:col-span-1 bento-item glass-card rounded-3xl">
                  <LanaAdvice
                    realm={energyLevel === 'high' ? 'academic' : energyLevel === 'low' ? 'personal' : 'personal'}
                    message={energyLevel ? energyMessages[energyLevel].greeting + ' ' + energyMessages[energyLevel].explanation : 'Hoy es un gran dia para lograr tus metas. Vamos juntos!'}
                  />
                </div>

                {/* Pending Tasks Summary - Right Side */}
                <div className="lg:col-span-2 bento-item glass-card rounded-3xl">
                  <PendingTasksSummary tasks={tasks} />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

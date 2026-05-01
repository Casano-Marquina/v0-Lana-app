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
import { Plus, Settings, Palette, Calendar, ArrowRight } from 'lucide-react';
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

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card shadow-sm border-b border-border">
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
            <Link
              href="/weekly"
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              title="Ver semana"
            >
              <Calendar className="w-5 h-5 text-accent" />
            </Link>
            <Link
              href="/backgrounds"
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              title="Personalizar fondos"
            >
              <Palette className="w-5 h-5 text-accent" />
            </Link>
            <Link
              href="/settings"
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              title="Configuracion"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Link
              href="/create"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg p-2 transition-all shadow-sm hover:shadow-md"
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
            {/* Global Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <div className="text-3xl font-bold text-primary">{pendingCount}</div>
                <div className="text-sm text-muted-foreground">Pendientes</div>
              </div>
              <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <div className="text-3xl font-bold text-accent">{completedCount}</div>
                <div className="text-sm text-muted-foreground">Completadas</div>
              </div>
              <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <div className="text-3xl font-bold text-secondary-foreground">{tasks.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
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

            {/* Empty State with Lana */}
            {tasks.length === 0 && (
              <div className="mt-12 bg-card rounded-lg p-12 text-center border border-border">
                <Lana realm="personal" size="lg" showMessage customMessage="Hola! Soy Lana, tu companera de productividad. Crea tu primera tarea y comencemos juntos!" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2 mt-4">
                  Comienza a planificar
                </h3>
                <p className="text-muted-foreground mb-6">
                  Crea tu primera tarea en cualquiera de tus tres ambitos de vida
                </p>
                <Link
                  href="/create"
                  className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6 py-2 transition-colors"
                >
                  Crear Primera Tarea
                </Link>
              </div>
            )}

            {/* Motivational Footer with Lana */}
            {tasks.length > 0 && (
              <div className="mt-8 bg-card rounded-lg p-6 border border-border">
                <Lana 
                  realm={energyLevel === 'high' ? 'academic' : energyLevel === 'low' ? 'personal' : 'personal'} 
                  size="md" 
                  showMessage
                  customMessage={energyLevel ? energyMessages[energyLevel].greeting + ' ' + energyMessages[energyLevel].explanation : undefined}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

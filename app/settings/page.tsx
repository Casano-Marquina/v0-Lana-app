'use client';

import { useEffect, useState } from 'react';
import { getPreferences, updatePreferences, UserPreferences, getDefaultPreferences, getAllTasks } from '@/lib/db';
import { requestNotificationPermission } from '@/lib/notifications';
import { ExportReportButton } from '@/components/ExportReportButton';
import { useEnergyLevel } from '@/hooks/useEnergyLevel';
import { useLayout } from '@/contexts/LayoutContext';
import { ArrowLeft, Download, Monitor, Smartphone, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Lana } from '@/components/Lana';
import { NavLink } from '@/components/NavLink';

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [tasks, setTasks] = useState([]);
  const { energyHistory } = useEnergyLevel();
  const { layoutMode, setLayoutMode, isMobileLayout } = useLayout();

  useEffect(() => {
    loadPreferences();
    loadTasks();
    checkNotificationPermission();
  }, []);

  async function loadTasks() {
    try {
      const allTasks = await getAllTasks();
      setTasks(allTasks);
    } catch (error) {
      console.error('[v0] Error loading tasks:', error);
    }
  }

  async function loadPreferences() {
    try {
      const preferences = await getPreferences();
      setPrefs(preferences);
    } catch (error) {
      console.error('[v0] Error loading preferences:', error);
      setPrefs(getDefaultPreferences());
    } finally {
      setLoading(false);
    }
  }

  function checkNotificationPermission() {
    if ('Notification' in window) {
      setHasNotificationPermission(Notification.permission === 'granted');
    }
  }

  const colorModes = [
    { id: 'default', label: 'Defecto', desc: 'Dorado y rojo calido' },
    { id: 'serenidad', label: 'Serenidad Activa', desc: 'Azul y purpura suaves' },
    { id: 'naturaleza', label: 'Naturaleza y Calma', desc: 'Verde oliva y melocoton' },
    { id: 'deepfocus', label: 'Deep Focus', desc: 'Verde y bronce terroso' },
  ];

  async function handleTogglePref(key: keyof UserPreferences, value: boolean | string) {
    if (key === 'pushNotifications' && value === true) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        alert('Permiso de notificaciones denegado');
        return;
      }
      setHasNotificationPermission(true);
    }

    const updated = { ...prefs, [key]: value } as UserPreferences;
    setPrefs(updated);

    try {
      await updatePreferences(updated);
      
      // Apply theme to document
      if (key === 'theme') {
        const isDark = value === 'dark';
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      
      // Apply color mode to document
      if (key === 'colorMode') {
        document.documentElement.classList.remove('color-default', 'color-serenidad', 'color-naturaleza', 'color-deepfocus');
        document.documentElement.classList.add(`color-${value}`);
      }
    } catch (error) {
      console.error('[v0] Error updating preferences:', error);
    }
  }

  async function handleExportData() {
    try {
      const { getAllTasks, getPreferences: getPrefs } = await import('@/lib/db');
      
      const tasks = await getAllTasks();
      const preferences = await getPreferences();
      
      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        tasks,
        preferences,
      };
      
      // Create blob and download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mi-agenda-export-${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Datos exportados exitosamente');
    } catch (error) {
      console.error('[v0] Error exporting data:', error);
      alert('Error al exportar datos');
    }
  }

  if (loading || !prefs) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <NavLink
            href="/"
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </NavLink>
          <Lana realm="personal" size="sm" />
          <h1 className="text-2xl font-bold text-card-foreground">Ajustes</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Layout Preference Section - NEW */}
        <section className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-lg font-bold text-card-foreground mb-2">Preferencia de Diseño</h2>
          <p className="text-sm text-muted-foreground mb-4">Elige cómo prefieres ver tu agenda</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Auto Mode */}
            <button
              onClick={() => setLayoutMode('auto')}
              className={cn(
                'p-4 rounded-lg border-2 flex flex-col items-start transition-all text-left',
                layoutMode === 'auto'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-secondary hover:border-primary/50'
              )}
            >
              <Zap className={cn(
                'w-6 h-6 mb-2',
                layoutMode === 'auto' ? 'text-primary' : 'text-gray-400'
              )} />
              <h3 className="font-semibold text-card-foreground">Automático</h3>
              <p className="text-xs text-muted-foreground mt-1">Mobile en celular, Desktop en pantalla grande</p>
            </button>

            {/* Mobile Mode */}
            <button
              onClick={() => setLayoutMode('mobile')}
              className={cn(
                'p-4 rounded-lg border-2 flex flex-col items-start transition-all text-left',
                layoutMode === 'mobile'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-secondary hover:border-primary/50'
              )}
            >
              <Smartphone className={cn(
                'w-6 h-6 mb-2',
                layoutMode === 'mobile' ? 'text-primary' : 'text-gray-400'
              )} />
              <h3 className="font-semibold text-card-foreground">Siempre Mobile</h3>
              <p className="text-xs text-muted-foreground mt-1">Optimizado para celular en cualquier pantalla</p>
            </button>

            {/* Desktop Mode */}
            <button
              onClick={() => setLayoutMode('desktop')}
              className={cn(
                'p-4 rounded-lg border-2 flex flex-col items-start transition-all text-left',
                layoutMode === 'desktop'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-secondary hover:border-primary/50'
              )}
            >
              <Monitor className={cn(
                'w-6 h-6 mb-2',
                layoutMode === 'desktop' ? 'text-primary' : 'text-gray-400'
              )} />
              <h3 className="font-semibold text-card-foreground">Siempre Desktop</h3>
              <p className="text-xs text-muted-foreground mt-1">Diseño completo con más densidad</p>
            </button>
          </div>

          <div className="mt-4 p-3 bg-secondary rounded-lg text-xs text-muted-foreground">
            <strong>Estado actual:</strong> {isMobileLayout ? 'Diseño Mobile' : 'Diseño Desktop'}
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-lg font-bold text-card-foreground mb-4">Notificaciones</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <p className="font-medium text-secondary-foreground">Notificaciones Push</p>
                <p className="text-sm text-muted-foreground">Alertas del sistema operativo</p>
              </div>
              <button
                onClick={() => handleTogglePref('pushNotifications', !prefs.pushNotifications)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  prefs.pushNotifications ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-card transition-transform',
                    prefs.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <p className="font-medium text-secondary-foreground">Sonidos</p>
                <p className="text-sm text-muted-foreground">Reproducir sonido en recordatorios</p>
              </div>
              <button
                onClick={() => handleTogglePref('soundNotifications', !prefs.soundNotifications)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  prefs.soundNotifications ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-card transition-transform',
                    prefs.soundNotifications ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <p className="font-medium text-secondary-foreground">Recordatorios Visuales</p>
                <p className="text-sm text-muted-foreground">Mostrar alertas en la pantalla</p>
              </div>
              <button
                onClick={() => handleTogglePref('visualNotifications', !prefs.visualNotifications)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  prefs.visualNotifications ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-card transition-transform',
                    prefs.visualNotifications ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Theme Section */}
        <section className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-lg font-bold text-card-foreground mb-4">Tema Claro/Oscuro</h2>
          <div className="flex gap-3">
            {(['light', 'dark'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => handleTogglePref('theme', theme)}
                className={cn(
                  'flex-1 p-4 rounded-lg border-2 font-medium transition-all',
                  prefs.theme === theme
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-secondary text-secondary-foreground hover:border-primary/50'
                )}
              >
                {theme === 'light' ? 'Claro' : 'Oscuro'}
              </button>
            ))}
          </div>
        </section>

        {/* Color Mode Section */}
        <section className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-lg font-bold text-card-foreground mb-4">Paleta de Colores</h2>
          <div className="grid grid-cols-2 gap-3">
            {colorModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleTogglePref('colorMode', mode.id)}
                className={cn(
                  'p-4 rounded-lg border-2 text-left font-medium transition-all',
                  prefs.colorMode === mode.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-secondary hover:border-primary/50'
                )}
              >
                <div className="font-semibold text-sm text-card-foreground">{mode.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{mode.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Data Section */}
        <section className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-lg font-bold text-card-foreground mb-4">Reporte de Lana</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Genera un reporte detallado de tu bienestar y productividad con análisis inteligente de Lana.
          </p>
          <ExportReportButton
            tasks={tasks}
            energyHistory={energyHistory}
            format="xlsx"
            className="w-full"
          />
        </section>

        {/* App Info */}
        <section className="bg-card rounded-lg shadow-md p-6 text-center border border-border mb-8">
          <Lana realm="personal" size="lg" showMessage customMessage="Me encanta ayudarte a organizar tu vida. Cualquier duda, aqui estoy!" />
          <h3 className="text-lg font-bold text-card-foreground mb-1 mt-4">Mi Agenda v1.0.0</h3>
          <p className="text-xs text-muted-foreground">
            Una agenda inteligente organizada por ambitos de vida: Personal, Academico y Relacional
          </p>
        </section>
      </main>
    </div>
  );
}

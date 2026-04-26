'use client';

import { useEffect, useState } from 'react';
import { getPreferences, updatePreferences, UserPreferences, getDefaultPreferences } from '@/lib/db';
import { requestNotificationPermission } from '@/lib/notifications';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

  useEffect(() => {
    loadPreferences();
    checkNotificationPermission();
  }, []);

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
    { id: 'default', label: 'Defecto', desc: 'Azul y rosa clásicos' },
    { id: 'serenidad', label: 'Serenidad Activa', desc: 'Tonos suaves y equilibrados' },
    { id: 'naturaleza', label: 'Naturaleza y Calma', desc: 'Verdes y tonos orgánicos' },
    { id: 'deepfocus', label: 'Deep Focus', desc: 'Elegancia nocturna' },
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Notifications Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Notificaciones</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-700">Notificaciones Push</p>
                <p className="text-sm text-gray-500">Alertas del sistema operativo</p>
              </div>
              <button
                onClick={() => handleTogglePref('pushNotifications', !prefs.pushNotifications)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  prefs.pushNotifications ? 'bg-blue-600' : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    prefs.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-700">Sonidos</p>
                <p className="text-sm text-gray-500">Reproducir sonido en recordatorios</p>
              </div>
              <button
                onClick={() => handleTogglePref('soundNotifications', !prefs.soundNotifications)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  prefs.soundNotifications ? 'bg-blue-600' : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    prefs.soundNotifications ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-700">Recordatorios Visuales</p>
                <p className="text-sm text-gray-500">Mostrar alertas en la pantalla</p>
              </div>
              <button
                onClick={() => handleTogglePref('visualNotifications', !prefs.visualNotifications)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  prefs.visualNotifications ? 'bg-blue-600' : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    prefs.visualNotifications ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Theme Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Tema Claro/Oscuro</h2>
          <div className="flex gap-3">
            {(['light', 'dark'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => handleTogglePref('theme', theme)}
                className={cn(
                  'flex-1 p-4 rounded-lg border-2 font-medium transition-all',
                  prefs.theme === theme
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                )}
              >
                {theme === 'light' ? '☀️' : '🌙'} {theme === 'light' ? 'Claro' : 'Oscuro'}
              </button>
            ))}
          </div>
        </section>

        {/* Color Mode Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Paleta de Colores</h2>
          <div className="grid grid-cols-2 gap-3">
            {colorModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleTogglePref('colorMode', mode.id)}
                className={cn(
                  'p-4 rounded-lg border-2 text-left font-medium transition-all',
                  prefs.colorMode === mode.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                )}
              >
                <div className="font-semibold text-sm">{mode.label}</div>
                <div className="text-xs text-gray-600 mt-1">{mode.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Data Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Datos</h2>
          <button
            onClick={handleExportData}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all"
          >
            <Download className="w-5 h-5" />
            Exportar Datos
          </button>
        </section>

        {/* App Info */}
        <section className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-blue-600 text-4xl mb-3">📱</div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Mi Agenda</h3>
          <p className="text-sm text-gray-600 mb-4">Versión 1.0.0</p>
          <p className="text-xs text-gray-500">
            Una agenda inteligente organizada por ámbitos de vida: Personal, Académico y Relacional
          </p>
        </section>
      </main>
    </div>
  );
}

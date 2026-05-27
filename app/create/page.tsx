'use client';

import { useState, useEffect, Suspense } from 'react';
import { createTask, generateId, Task, formatDate, formatTime } from '@/lib/db';
import { RealmSelector } from '@/components/RealmSelector';
import { PrioritySelector } from '@/components/PrioritySelector';
import { HierarchySelector } from '@/components/HierarchySelector';
import { ReminderSetup } from '@/components/ReminderSetup';
import { RealmType } from '@/lib/realms';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lana } from '@/components/Lana';

function CreateTaskContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const initialRealm = (searchParams?.get('realm') as RealmType) || 'personal';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: formatDate(new Date()),
    dueTime: formatTime(new Date()),
    priority: 'medium' as const,
    hierarchy: 2 as 1 | 2 | 3,
    realm: initialRealm,
    reminderEnabled: false,
    reminderTime: '09:00',
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, realm: initialRealm }));
  }, [initialRealm]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    setLoading(true);

    try {
      const now = new Date().toISOString();
      const newTask: Task = {
        id: generateId(),
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        dueTime: formData.dueTime,
        priority: formData.priority,
        hierarchy: formData.hierarchy,
        realm: formData.realm,
        completed: false,
        createdAt: now,
        updatedAt: now,
        reminderEnabled: formData.reminderEnabled,
        reminderTime: formData.reminderEnabled ? formData.reminderTime : undefined,
        notificationSent: false,
        color: '#3B82F6', // Will be updated based on realm
      };

      await createTask(newTask);
      router.push('/');
    } catch (error) {
      console.error('[v0] Error creating task:', error);
      alert('Error al crear la tarea');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <Lana realm={formData.realm} size="sm" />
          <h1 className="text-2xl font-bold text-card-foreground">Nueva Tarea</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">

        <form onSubmit={handleSubmit} className="glass-card rounded-3xl shadow-xl p-8 space-y-6 border border-white/20">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              ¿Qué necesitas hacer?
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Escribe tu tarea..."
              className="w-full px-4 py-3 soft-button rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-white focus:border-transparent transition-all"
              disabled={loading}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Más detalles (opcional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Agrega contexto..."
              rows={3}
              className="w-full px-4 py-3 soft-button rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-white focus:border-transparent transition-all resize-none"
              disabled={loading}
            />
          </div>

          {/* Realm Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              ¿A qué área de tu vida pertenece?
            </label>
            <RealmSelector
              value={formData.realm}
              onChange={(realm) => setFormData({ ...formData, realm })}
              disabled={loading}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Prioridad
            </label>
            <PrioritySelector
              value={formData.priority}
              onChange={(priority) => setFormData({ ...formData, priority })}
            />
          </div>

          {/* Hierarchy - Lana's commitment level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Nivel de compromiso
            </label>
            <HierarchySelector
              value={formData.hierarchy}
              onChange={(hierarchy) => setFormData({ ...formData, hierarchy })}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Fecha
              </label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-3 soft-button rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-white focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="dueTime" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Hora
              </label>
              <input
                type="time"
                id="dueTime"
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                className="w-full px-4 py-3 soft-button rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-white focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* Reminder */}
          <ReminderSetup
            enabled={formData.reminderEnabled}
            reminderTime={formData.reminderTime}
            onToggle={(enabled) => setFormData({ ...formData, reminderEnabled: enabled })}
            onTimeChange={(time) => setFormData({ ...formData, reminderTime: time })}
          />

          {/* Submit Button - Gradient cozy */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:shadow-xl disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-105 transform duration-200"
          >
            <Plus className="w-5 h-5" />
            {loading ? 'Creando...' : '+ Crear Tarea'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function CreateTaskPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <CreateTaskContent />
    </Suspense>
  );
}

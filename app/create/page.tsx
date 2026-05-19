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

        <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-md p-6 space-y-6 border border-border">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-card-foreground mb-2">
              Titulo *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Que necesitas hacer?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Agrega detalles adicionales..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={loading}
            />
          </div>

          {/* Realm Selector */}
          <RealmSelector
            value={formData.realm}
            onChange={(realm) => setFormData({ ...formData, realm })}
            disabled={loading}
          />

          {/* Priority */}
          <PrioritySelector
            value={formData.priority}
            onChange={(priority) => setFormData({ ...formData, priority })}
          />

          {/* Hierarchy - Lana's commitment level */}
          <HierarchySelector
            value={formData.hierarchy}
            onChange={(hierarchy) => setFormData({ ...formData, hierarchy })}
          />

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="dueTime" className="block text-sm font-semibold text-gray-700 mb-2">
                Hora
              </label>
              <input
                type="time"
                id="dueTime"
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {loading ? 'Creando...' : 'Crear Tarea'}
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

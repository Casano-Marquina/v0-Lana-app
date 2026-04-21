'use client';

import { useEffect, useState } from 'react';
import {
  getAllTasks,
  getTasksByRealm,
  Task,
  updateTask,
  deleteTask,
  formatDate,
} from '@/lib/db';
import { REALMS } from '@/lib/realms';
import { TaskCard } from '@/components/TaskCard';
import { ReminderModal } from '@/components/ReminderModal';
import { useReminders } from '@/hooks/useReminders';
import Link from 'next/link';
import { Plus, Settings, Zap, BookOpen, Heart, Palette, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'today' | 'personal' | 'academic' | 'relational';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('today');
  const [loading, setLoading] = useState(true);
  const { reminderTask, onDismissReminder, onSnoozeReminder, onCompleteReminder } = useReminders();

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, activeTab]);

  async function loadTasks() {
    try {
      const allTasks = await getAllTasks();
      setTasks(allTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('[v0] Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterTasks() {
    const today = formatDate(new Date());
    let filtered = tasks;

    if (activeTab === 'today') {
      filtered = tasks.filter((t) => t.dueDate === today && !t.completed);
    } else if (activeTab === 'all') {
      filtered = tasks;
    } else if (activeTab !== 'all' && activeTab !== 'today') {
      filtered = tasks.filter((t) => t.realm === activeTab);
    }

    setFilteredTasks(filtered);
  }

  async function handleToggleTask(task: Task) {
    try {
      const updated = { ...task, completed: !task.completed, updatedAt: new Date().toISOString() };
      await updateTask(updated);
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
    } catch (error) {
      console.error('[v0] Error toggling task:', error);
    }
  }

  async function handleDeleteTask(id: string) {
    try {
      await deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error('[v0] Error deleting task:', error);
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  const tabs: { id: FilterTab; label: string; icon?: React.ReactNode }[] = [
    { id: 'today', label: 'Hoy' },
    { id: 'personal', label: 'Tu Centro', icon: <Zap className="w-4 h-4" /> },
    { id: 'academic', label: 'Tu Futuro', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'relational', label: 'Tu Corazón', icon: <Heart className="w-4 h-4" /> },
    { id: 'all', label: 'Todas' },
  ];

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
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-blue-600">{pendingCount}</div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-green-600">{completedCount}</div>
            <div className="text-sm text-gray-600">Completadas</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-purple-600">{tasks.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap flex items-center gap-2',
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tasks */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Sin tareas!</h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'today'
                  ? 'No tienes tareas para hoy. ¡Descansa!'
                  : activeTab === 'all'
                    ? 'Crea tu primera tarea para empezar'
                    : 'No hay tareas en este ámbito'}
              </p>
              <Link
                href="/create"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2 transition-colors"
              >
                Crear Tarea
              </Link>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
                onEdit={() => {
                  // TODO: Implement edit navigation
                }}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

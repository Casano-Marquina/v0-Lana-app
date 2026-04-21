'use client';

import { useEffect, useState } from 'react';
import { getTasksByDateRange, Task, formatDate } from '@/lib/db';
import { TaskCard } from '@/components/TaskCard';
import { REALMS } from '@/lib/realms';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WeeklyPlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    return new Date(now.setDate(diff));
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeklyTasks();
  }, [weekStart]);

  async function loadWeeklyTasks() {
    setLoading(true);
    try {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const startStr = formatDate(weekStart);
      const endStr = formatDate(weekEnd);

      const weeklyTasks = await getTasksByDateRange(startStr, endStr);
      setTasks(weeklyTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    } catch (error) {
      console.error('[v0] Error loading weekly tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const tasksByDay = weekDays.map((day) => {
    const dayStr = formatDate(day);
    return tasks.filter((t) => t.dueDate === dayStr);
  });

  const totalHours = tasks.reduce((sum) => sum + 1, 0); // Simplified
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Planificación Semanal
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekStart(new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Semana anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-600 min-w-32 text-center">
              {formatDate(weekStart)} a {formatDate(weekEnd)}
            </span>
            <button
              onClick={() => setWeekStart(new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Próxima semana"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-blue-600">{tasks.length}</div>
            <div className="text-sm text-gray-600">Tareas esta semana</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-green-600">{completedCount}</div>
            <div className="text-sm text-gray-600">Completadas</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-purple-600">{tasks.length - completedCount}</div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
        </div>

        {/* Weekly View */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {weekDays.map((day, index) => {
              const dayTasks = tasksByDay[index];
              const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
              const isToday = formatDate(day) === formatDate(new Date());

              return (
                <div
                  key={formatDate(day)}
                  className={cn(
                    'rounded-lg border-l-4 p-4 transition-all',
                    isToday ? 'bg-blue-50 border-l-blue-600 border border-blue-200' : 'bg-white border-l-gray-300 border border-gray-100'
                  )}
                >
                  <div className="mb-3">
                    <h3 className="font-bold text-gray-900">
                      {dayNames[day.getDay()]} - {formatDate(day)}
                      {isToday && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">Hoy</span>}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{dayTasks.length} tareas</p>
                  </div>

                  {dayTasks.length === 0 ? (
                    <div className="text-sm text-gray-500 italic">Sin tareas</div>
                  ) : (
                    <div className="space-y-2">
                      {dayTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggle={() => {}}
                          onDelete={() => {}}
                          onEdit={() => {}}
                          isCompact
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

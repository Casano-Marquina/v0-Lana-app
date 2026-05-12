'use client';

import { useEffect, useState, useMemo } from 'react';
import { getTasksByDateRange, Task, formatDate, updateTask, deleteTask } from '@/lib/db';
import { REALMS } from '@/lib/realms';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Lana } from '@/components/Lana';
import { TaskDetailPanel } from '@/components/TaskDetailPanel';

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7:00 to 21:00

export default function WeeklyCalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Start on Monday
    return new Date(now.setDate(diff));
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Usuario');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
      setTasks(weeklyTasks);
    } catch (error) {
      console.error('[v0] Error loading weekly tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [weekStart]);

  const dayNames = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  const today = formatDate(new Date());

  // Get tasks for a specific day and hour
  const getTasksForSlot = (day: Date, hour: number) => {
    const dayStr = formatDate(day);
    return tasks.filter((task) => {
      if (task.dueDate !== dayStr) return false;
      if (!task.reminderTime) return hour === 9; // Default to 9am if no time
      const taskHour = parseInt(task.reminderTime.split(':')[0], 10);
      return taskHour === hour;
    });
  };

  // Get realm color
  const getRealmColor = (realm: string) => {
    switch (realm) {
      case 'personal':
        return 'bg-blue-100 border-blue-400 text-blue-800';
      case 'academic':
        return 'bg-amber-100 border-amber-400 text-amber-800';
      case 'relational':
        return 'bg-pink-100 border-pink-400 text-pink-800';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  const goToPrevWeek = () => {
    setWeekStart(new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const goToNextWeek = () => {
    setWeekStart(new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  const goToToday = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    setWeekStart(new Date(now.setDate(diff)));
  };

  const handleToggleTask = async (task: Task) => {
    const updated = { ...task, completed: !task.completed };
    await updateTask(updated);
    setTasks(tasks.map(t => (t.id === task.id ? updated : t)));
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    await updateTask(updatedTask);
    setTasks(tasks.map(t => (t.id === updatedTask.id ? updatedTask : t)));
    setSelectedTask(updatedTask);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-secondary rounded-full transition-colors"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div className="flex items-center gap-3">
              <Lana realm="academic" size="sm" />
              <span className="text-card-foreground font-medium">Calendario Semanal</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={goToPrevWeek}
              className="p-1.5 hover:bg-secondary rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={goToNextWeek}
              className="p-1.5 hover:bg-secondary rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <Link
              href="/create"
              className="ml-2 p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-colors"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="min-w-[800px]">
            {/* Days Header */}
            <div className="grid grid-cols-8 border-b border-border sticky top-0 bg-card z-10">
              <div className="p-2 text-center border-r border-border">
                <div className="w-8 h-8 mx-auto"></div>
              </div>
              {weekDays.map((day, index) => {
                const isToday = formatDate(day) === today;
                const dayNum = day.getDate();
                const month = day.toLocaleDateString('es', { month: '2-digit' });

                return (
                  <div
                    key={index}
                    className={cn(
                      'p-2 text-center border-r border-border last:border-r-0',
                      isToday && 'bg-primary/5'
                    )}
                  >
                    <div className="text-xs text-muted-foreground font-medium">
                      {dayNames[index]} {dayNum}/{month}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Grid */}
            <div className="relative">
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-border min-h-[60px]">
                  {/* Time Label */}
                  <div className="p-1 text-right pr-2 border-r border-border">
                    <span className="text-xs text-muted-foreground">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>

                  {/* Day Columns */}
                  {weekDays.map((day, dayIndex) => {
                    const slotTasks = getTasksForSlot(day, hour);
                    const isToday = formatDate(day) === today;

                    return (
                      <div
                        key={dayIndex}
                        className={cn(
                          'border-r border-border last:border-r-0 p-0.5 relative',
                          isToday && 'bg-primary/5'
                        )}
                      >
                        {slotTasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className={cn(
                              'block w-full text-left text-xs p-1 rounded border-l-2 mb-0.5 truncate hover:opacity-80 transition-opacity cursor-pointer',
                              getRealmColor(task.realm)
                            )}
                            title={task.title}
                          >
                            <span className="font-medium">
                              {task.reminderTime || '09:00'}
                            </span>
                            <span className="ml-1 opacity-80">{task.title}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <footer className="bg-card border-t border-border p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-400"></div>
              <span className="text-sm text-muted-foreground">Personal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-400"></div>
              <span className="text-sm text-muted-foreground">Academico</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-pink-400"></div>
              <span className="text-sm text-muted-foreground">Relacional</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {tasks.length} tareas esta semana | {tasks.filter(t => t.completed).length} completadas
          </div>
        </div>
      </footer>

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onToggle={handleToggleTask}
      />
    </div>
  );
}

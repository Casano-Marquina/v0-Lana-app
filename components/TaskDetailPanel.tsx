'use client';

import { useState, useEffect } from 'react';
import { Task, updateTask, deleteTask, formatDate } from '@/lib/db';
import { REALMS, RealmType } from '@/lib/realms';
import { cn } from '@/lib/utils';
import { X, Check, Trash2, Clock, Bell, Calendar, Edit2, Save } from 'lucide-react';
import { Lana } from './Lana';

interface TaskDetailPanelProps {
  task: Task | null;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskDetailPanel({ task, onClose, onUpdate, onDelete }: TaskDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      setIsEditing(false);
    }
  }, [task]);

  if (!task || !editedTask) return null;

  const realm = REALMS[task.realm];
  const today = formatDate(new Date());
  const isOverdue = task.dueDate < today && !task.completed;

  const handleSave = async () => {
    if (editedTask) {
      await updateTask(editedTask);
      onUpdate(editedTask);
      setIsEditing(false);
    }
  };

  const handleToggleComplete = async () => {
    const updated = { ...task, completed: !task.completed };
    await updateTask(updated);
    onUpdate(updated);
  };

  const handleDelete = async () => {
    if (confirm('Estas seguro de eliminar esta tarea?')) {
      await deleteTask(task.id);
      onDelete(task.id);
      onClose();
    }
  };

  const priorityLabels = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  };

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div 
          className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10"
          style={{ borderLeftColor: realm.color.main, borderLeftWidth: '4px' }}
        >
          <div className="flex items-center gap-3">
            <Lana realm={task.realm} size="sm" />
            <div>
              <h2 className="font-bold text-card-foreground">Detalles de Tarea</h2>
              <p className="text-xs text-muted-foreground">{realm.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Titulo</label>
            {isEditing ? (
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="w-full mt-1 p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : (
              <h3 className={cn(
                'text-xl font-semibold mt-1',
                task.completed ? 'line-through text-muted-foreground' : isOverdue ? 'text-red-600' : 'text-card-foreground'
              )}>
                {task.title}
              </h3>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Descripcion</label>
            {isEditing ? (
              <textarea
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                rows={3}
                className="w-full mt-1 p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Agrega una descripcion..."
              />
            ) : (
              <p className="text-muted-foreground mt-1">
                {task.description || 'Sin descripcion'}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</label>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  task.completed 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                    : isOverdue 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : 'bg-secondary text-secondary-foreground'
                )}>
                  {task.completed ? 'Completada' : isOverdue ? 'Vencida' : 'Pendiente'}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prioridad</label>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('w-3 h-3 rounded-full', priorityColors[task.priority])} />
                <span className="text-card-foreground">{priorityLabels[task.priority]}</span>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Fecha
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedTask.dueDate}
                  onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                  className="w-full mt-1 p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className={cn('mt-1', isOverdue && !task.completed ? 'text-red-600 font-medium' : 'text-card-foreground')}>
                  {task.dueDate === today ? 'Hoy' : task.dueDate}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Clock className="w-3 h-3" /> Hora
              </label>
              {isEditing ? (
                <input
                  type="time"
                  value={editedTask.dueTime || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, dueTime: e.target.value })}
                  className="w-full mt-1 p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <p className="text-card-foreground mt-1">{task.dueTime || 'Sin hora'}</p>
              )}
            </div>
          </div>

          {/* Reminder */}
          {task.reminderEnabled && (
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 text-primary">
                <Bell className="w-4 h-4" />
                <span className="font-medium">Recordatorio activo</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {task.reminderTime} - {task.reminderMinutes} minutos antes
              </p>
            </div>
          )}

          {/* Lana Message */}
          <div className="bg-secondary/50 rounded-lg p-4">
            <Lana 
              realm={task.realm} 
              size="sm" 
              showMessage 
              customMessage={
                task.completed 
                  ? 'Excelente trabajo completando esta tarea!' 
                  : isOverdue 
                    ? 'Esta tarea esta vencida, animo tu puedes!' 
                    : 'Recuerda que cada tarea completada te acerca a tus metas!'
              }
            />
          </div>
        </div>

        {/* Actions Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4 flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-card-foreground hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleToggleComplete}
                className={cn(
                  'flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2',
                  task.completed 
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    : 'bg-green-600 text-white hover:bg-green-700'
                )}
              >
                <Check className="w-4 h-4" />
                {task.completed ? 'Desmarcar' : 'Completar'}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-border rounded-lg text-card-foreground hover:bg-secondary transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

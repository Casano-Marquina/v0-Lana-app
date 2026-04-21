'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getAllTasks,
  getIncompleteTasks,
  updateTask,
  Task,
  calculateReminderTime,
  getPreferences,
} from '@/lib/db';
import {
  showNotification,
  playNotificationSound,
  vibrateDevice,
  calculateReminderTime as calcReminderTime,
} from '@/lib/notifications';

export function useReminders() {
  const [reminderTask, setReminderTask] = useState<Task | null>(null);
  const [initialized, setInitialized] = useState(false);

  const checkReminders = useCallback(async () => {
    try {
      const tasks = await getIncompleteTasks();
      const prefs = await getPreferences();
      const now = new Date();

      for (const task of tasks) {
        if (!task.reminderEnabled || task.notificationSent) {
          continue;
        }

        if (!task.dueDate || !task.reminderTime) {
          continue;
        }

        // Parse reminder time
        const [hours, minutes] = task.reminderTime.split(':').map(Number);
        const reminderDate = new Date(task.dueDate);
        reminderDate.setHours(hours, minutes, 0, 0);

        // Check if reminder time has passed (within a 2-minute window)
        const timeDiff = Math.abs(now.getTime() - reminderDate.getTime());
        if (timeDiff < 2 * 60000) {
          // Show visual reminder
          setReminderTask(task);

          // Show notification if enabled
          if (prefs.pushNotifications) {
            showNotification(`Recordatorio: ${task.title}`, {
              body: task.description || 'Es hora de completar esta tarea',
              tag: task.id,
              vibrate: [200, 100, 200],
            });
          }

          // Play sound if enabled
          if (prefs.soundNotifications) {
            playNotificationSound();
            vibrateDevice();
          }

          // Mark notification as sent
          const updated = { ...task, notificationSent: true };
          await updateTask(updated);
        }
      }
    } catch (error) {
      console.error('[v0] Error checking reminders:', error);
    }
  }, []);

  useEffect(() => {
    if (!initialized) {
      checkReminders();
      setInitialized(true);
    }

    // Check reminders every minute
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [checkReminders, initialized]);

  const handleDismissReminder = useCallback(() => {
    setReminderTask(null);
  }, []);

  const handleSnoozeReminder = useCallback(() => {
    if (reminderTask) {
      // Snooze for 5 minutes
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + 5);

      const [hours, minutes] = snoozeTime.toTimeString().slice(0, 5).split(':');
      const updated = {
        ...reminderTask,
        reminderTime: `${hours}:${minutes}`,
        notificationSent: false,
      };

      updateTask(updated).catch((error) => {
        console.error('[v0] Error snoozing reminder:', error);
      });

      setReminderTask(null);
    }
  }, [reminderTask]);

  const handleCompleteReminder = useCallback(async () => {
    if (reminderTask) {
      try {
        const updated = { ...reminderTask, completed: true, updatedAt: new Date().toISOString() };
        await updateTask(updated);
        setReminderTask(null);
      } catch (error) {
        console.error('[v0] Error completing reminder task:', error);
      }
    }
  }, [reminderTask]);

  return {
    reminderTask,
    onDismissReminder: handleDismissReminder,
    onSnoozeReminder: handleSnoozeReminder,
    onCompleteReminder: handleCompleteReminder,
  };
}

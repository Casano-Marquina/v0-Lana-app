// Web Notifications API and reminder management

import { Task } from './db';

export interface NotificationOptions {
  title: string;
  options?: NotificationOptions;
  sound?: boolean;
  vibrate?: boolean;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('[v0] Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('[v0] Error requesting notification permission:', error);
      return false;
    }
  }

  return false;
}

export async function showNotification(
  title: string,
  options: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    timestamp?: number;
    sound?: string;
    vibrate?: number[];
    actions?: NotificationAction[];
  } = {}
): Promise<void> {
  if (!('Notification' in window)) {
    console.log('[v0] Notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  try {
    const notification = new Notification(title, {
      ...options,
      icon: options.icon || '/icon-192x192.png',
      badge: options.badge || '/icon-192x192.png',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (error) {
    console.error('[v0] Error showing notification:', error);
  }
}

export function playNotificationSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error('[v0] Error playing sound:', error);
  }
}

export function vibrateDevice(pattern: number[] = [200, 100, 200]): void {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.error('[v0] Error vibrating device:', error);
    }
  }
}

export interface TaskReminder {
  taskId: string;
  taskTitle: string;
  scheduledTime: number; // timestamp
}

const reminders = new Map<string, NodeJS.Timeout>();

export function scheduleReminder(
  task: Task,
  reminderTime: Date,
  onReminder: (task: Task) => void
): void {
  const now = Date.now();
  const timeUntilReminder = reminderTime.getTime() - now;

  if (timeUntilReminder <= 0) {
    console.log('[v0] Reminder time is in the past');
    return;
  }

  // Clear existing reminder if any
  if (reminders.has(task.id)) {
    clearTimeout(reminders.get(task.id));
  }

  const timeout = setTimeout(() => {
    onReminder(task);
    reminders.delete(task.id);
  }, timeUntilReminder);

  reminders.set(task.id, timeout);
}

export function cancelReminder(taskId: string): void {
  if (reminders.has(taskId)) {
    clearTimeout(reminders.get(taskId));
    reminders.delete(taskId);
  }
}

export function clearAllReminders(): void {
  reminders.forEach((timeout) => clearTimeout(timeout));
  reminders.clear();
}

// Calculate reminder time based on task due date/time and reminder offset
export function calculateReminderTime(
  dueDate: string,
  dueTime: string | undefined,
  reminderOffset: number // minutes before
): Date {
  const dueDateObj = new Date(dueDate);

  if (dueTime) {
    const [hours, minutes] = dueTime.split(':').map(Number);
    dueDateObj.setHours(hours, minutes, 0, 0);
  } else {
    dueDateObj.setHours(9, 0, 0, 0); // Default to 9 AM if no time specified
  }

  const reminderDate = new Date(dueDateObj.getTime() - reminderOffset * 60000);
  return reminderDate;
}

// Common reminder presets
export const REMINDER_PRESETS = {
  '5min': { label: '5 minutos antes', minutes: 5 },
  '15min': { label: '15 minutos antes', minutes: 15 },
  '30min': { label: '30 minutos antes', minutes: 30 },
  '1hour': { label: '1 hora antes', minutes: 60 },
  '1day': { label: '1 día antes', minutes: 60 * 24 },
} as const;

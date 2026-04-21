// IndexedDB Database Management for Agenda App

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO date
  dueTime?: string; // HH:MM format
  priority: 'high' | 'medium' | 'low';
  realm: 'personal' | 'academic' | 'relational';
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  reminderTime?: string; // HH:MM format
  reminderEnabled: boolean;
  notificationSent: boolean;
  color: string; // hex color
}

export interface Background {
  id: string;
  type: 'color' | 'image';
  value: string; // hex or data URL
  realm: 'personal' | 'academic' | 'relational' | 'global';
  createdAt: string;
}

export interface UserPreferences {
  id: 'settings';
  soundNotifications: boolean;
  visualNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark';
  defaultRealm: 'personal' | 'academic' | 'relational';
}

const DB_NAME = 'AgendaDB';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[v0] Error opening IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create tasks store
      if (!database.objectStoreNames.contains('tasks')) {
        const tasksStore = database.createObjectStore('tasks', { keyPath: 'id' });
        tasksStore.createIndex('realm', 'realm', { unique: false });
        tasksStore.createIndex('dueDate', 'dueDate', { unique: false });
        tasksStore.createIndex('completed', 'completed', { unique: false });
      }

      // Create backgrounds store
      if (!database.objectStoreNames.contains('backgrounds')) {
        const backgroundsStore = database.createObjectStore('backgrounds', {
          keyPath: 'id',
        });
        backgroundsStore.createIndex('realm', 'realm', { unique: false });
      }

      // Create preferences store
      if (!database.objectStoreNames.contains('userPreferences')) {
        database.createObjectStore('userPreferences', { keyPath: 'id' });
      }
    };
  });
}

// Task Operations
export async function createTask(task: Task): Promise<string> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('tasks', 'readwrite');
    const store = transaction.objectStore('tasks');
    const request = store.add(task);

    request.onsuccess = () => {
      resolve(request.result as string);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function updateTask(task: Task): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('tasks', 'readwrite');
    const store = transaction.objectStore('tasks');
    const request = store.put(task);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteTask(id: string): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('tasks', 'readwrite');
    const store = transaction.objectStore('tasks');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getTask(id: string): Promise<Task | undefined> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('tasks', 'readonly');
    const store = transaction.objectStore('tasks');
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllTasks(): Promise<Task[]> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('tasks', 'readonly');
    const store = transaction.objectStore('tasks');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getTasksByRealm(realm: string): Promise<Task[]> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('tasks', 'readonly');
    const store = transaction.objectStore('tasks');
    const index = store.index('realm');
    const request = index.getAll(realm);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getTasksByDate(date: string): Promise<Task[]> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('tasks', 'readonly');
    const store = transaction.objectStore('tasks');
    const index = store.index('dueDate');
    const request = index.getAll(date);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getTasksByDateRange(startDate: string, endDate: string): Promise<Task[]> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('tasks', 'readonly');
    const store = transaction.objectStore('tasks');
    const index = store.index('dueDate');
    const range = IDBKeyRange.bound(startDate, endDate);
    const request = index.getAll(range);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getIncompleteTasks(): Promise<Task[]> {
  const allTasks = await getAllTasks();
  return allTasks.filter((task) => !task.completed);
}

export async function getCompletedTasks(): Promise<Task[]> {
  const allTasks = await getAllTasks();
  return allTasks.filter((task) => task.completed);
}

// Background Operations
export async function setBackground(background: Background): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('backgrounds', 'readwrite');
    const store = transaction.objectStore('backgrounds');
    const request = store.put(background);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getBackground(realm: string): Promise<Background | undefined> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('backgrounds', 'readonly');
    const store = transaction.objectStore('backgrounds');
    const index = store.index('realm');
    const request = index.get(realm);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllBackgrounds(): Promise<Background[]> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('backgrounds', 'readonly');
    const store = transaction.objectStore('backgrounds');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteBackground(id: string): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('backgrounds', 'readwrite');
    const store = transaction.objectStore('backgrounds');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Preferences Operations
export async function getPreferences(): Promise<UserPreferences> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('userPreferences', 'readonly');
    const store = transaction.objectStore('userPreferences');
    const request = store.get('settings');

    request.onsuccess = () => {
      const result = request.result || getDefaultPreferences();
      resolve(result);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function updatePreferences(prefs: Partial<UserPreferences>): Promise<void> {
  const database = await initDB();
  const currentPrefs = await getPreferences();
  const updated = { ...currentPrefs, ...prefs, id: 'settings' as const };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction('userPreferences', 'readwrite');
    const store = transaction.objectStore('userPreferences');
    const request = store.put(updated);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function getDefaultPreferences(): UserPreferences {
  return {
    id: 'settings',
    soundNotifications: true,
    visualNotifications: true,
    pushNotifications: true,
    theme: 'light',
    defaultRealm: 'personal',
  };
}

// Utilities
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

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

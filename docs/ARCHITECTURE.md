# Arquitectura de Mi Agenda

## Visión General

Mi Agenda es una Progressive Web App (PWA) que funciona completamente offline usando almacenamiento local (IndexedDB). No requiere servidor backend y toda la lógica ejecuta en el navegador.

## Stack Técnico

```
┌─────────────────────────────────────┐
│      Navegador Web / PWA            │
├─────────────────────────────────────┤
│  React 19.2 + Next.js 16 (App)     │
├─────────────────────────────────────┤
│  Tailwind CSS v4 + Lucide Icons    │
├─────────────────────────────────────┤
│  IndexedDB + LocalStorage           │
├─────────────────────────────────────┤
│  Service Worker + Web Notifications │
└─────────────────────────────────────┘
```

## Estructura de Directorios

```
/vercel/share/v0-project/
├── app/                          # Rutas Next.js (App Router)
│   ├── page.tsx                 # Dashboard principal
│   ├── layout.tsx               # Layout global + PWA setup
│   ├── globals.css              # Estilos globales
│   ├── create/
│   │   └── page.tsx            # Crear nueva tarea
│   ├── settings/
│   │   └── page.tsx            # Configuración de usuario
│   ├── backgrounds/
│   │   └── page.tsx            # Personalización de fondos
│   └── weekly/
│       └── page.tsx            # Vista semanal
│
├── components/                   # Componentes React reutilizables
│   ├── TaskCard.tsx            # Tarjeta de tarea individual
│   ├── RealmSelector.tsx        # Selector de 3 ámbitos
│   ├── PrioritySelector.tsx     # Selector de prioridad
│   ├── ReminderSetup.tsx        # Configuración de recordatorios
│   ├── ReminderModal.tsx        # Modal de alarma visual
│   ├── BackgroundPicker.tsx     # Picker para personalizar fondos
│   └── InstallPrompt.tsx        # Prompt para instalar PWA
│
├── hooks/                        # React Hooks personalizados
│   └── useReminders.ts          # Hook para manejar recordatorios
│
├── lib/                          # Utilidades y lógica
│   ├── db.ts                    # Operaciones IndexedDB
│   ├── realms.ts                # Configuración de ámbitos
│   ├── notifications.ts         # API de notificaciones
│   └── utils.ts                 # Utilidades generales (cn)
│
├── public/                       # Archivos estáticos
│   ├── manifest.json            # PWA manifest
│   ├── service-worker.js        # Service worker para offline
│   ├── icon-192x192.png         # Icono PWA 192x192
│   ├── icon-512x512.png         # Icono PWA 512x512
│   └── sounds/                  # Archivos de sonido para alertas
│
├── docs/                         # Documentación
│   ├── GETTING_STARTED.md       # Guía de inicio
│   ├── ARCHITECTURE.md          # Este archivo
│   └── CHANGELOG.md             # Historial de cambios
│
├── next.config.mjs              # Configuración Next.js + PWA
├── tailwind.config.ts           # Configuración Tailwind
├── tsconfig.json                # Configuración TypeScript
├── package.json                 # Dependencias del proyecto
└── README.md                    # Documentación principal
```

## Modelos de Datos

### Task
```typescript
interface Task {
  id: string;                          // UUID único
  title: string;                       // Título de la tarea
  description: string;                 // Descripción detallada
  dueDate: string;                     // Fecha ISO (YYYY-MM-DD)
  dueTime?: string;                    // Hora (HH:MM)
  priority: 'high' | 'medium' | 'low'; // Prioridad
  realm: 'personal' | 'academic' | 'relational'; // Ámbito
  completed: boolean;                  // ¿Completada?
  createdAt: string;                   // Timestamp creación
  updatedAt: string;                   // Timestamp última actualización
  reminderTime?: string;               // Hora del recordatorio
  reminderEnabled: boolean;            // ¿Recordatorio activo?
  notificationSent: boolean;           // ¿Notificación enviada?
  color: string;                       // Color hexadecimal
}
```

### Background
```typescript
interface Background {
  id: string;                          // Identificador único
  type: 'color' | 'image';            // Tipo de fondo
  value: string;                       // Color hex o data URL
  realm: 'personal' | 'academic' | 'relational' | 'global';
  createdAt: string;                   // Timestamp
}
```

### UserPreferences
```typescript
interface UserPreferences {
  id: 'settings';
  soundNotifications: boolean;         // ¿Sonidos activados?
  visualNotifications: boolean;        // ¿Alertas visuales?
  pushNotifications: boolean;          // ¿Notificaciones push?
  theme: 'light' | 'dark';            // Tema de la app
  defaultRealm: 'personal' | 'academic' | 'relational';
}
```

## Flujo de Datos

### Creación de Tarea
```
CreatePage
  ↓
FormData
  ↓
createTask(db.ts)
  ↓
IndexedDB Store: 'tasks'
  ↓
Dashboard (refetch)
  ↓
TaskCard render
```

### Recordatorio
```
Service Worker (cada minuto)
  ↓
useReminders Hook
  ↓
checkReminders()
  ↓
Task.reminderTime alcanzado
  ↓
showNotification()
  ↓
ReminderModal visual
  ↓
updateTask(notificationSent: true)
```

### Notificación Push
```
Web Notifications API
  ↓
Sistema Operativo
  ↓
Notificación del sistema
  ↓
Click en notificación
  ↓
Focus app + navigate
```

## IndexedDB Schema

### Database: "AgendaDB" (versión 1)

#### Store: tasks
```
KeyPath: 'id'
Índices:
  - 'realm' (no único)
  - 'dueDate' (no único)
  - 'completed' (no único)
```

#### Store: backgrounds
```
KeyPath: 'id'
Índices:
  - 'realm' (no único)
```

#### Store: userPreferences
```
KeyPath: 'id'
(Singleton con id = 'settings')
```

## Flujo de Notificaciones

### 1. Configuración Inicial
```
SettingsPage
  ↓
requestNotificationPermission()
  ↓
Navegador solicita permiso
  ↓
Usuario autoriza
  ↓
updatePreferences(pushNotifications: true)
```

### 2. En Tiempo de Ejecución
```
useReminders Hook
  ↓
setInterval(checkReminders, 60000) // Cada minuto
  ↓
Para cada tarea sin notificar:
  - Calcular si es hora del recordatorio
  - Si coincide dentro de 2 min:
    ├─ playNotificationSound()
    ├─ vibrateDevice()
    ├─ showNotification() // Web Notifications API
    └─ setReminderTask() // Mostrar modal visual
```

### 3. Service Worker
```
Service Worker en segundo plano
  ↓
Mantiene IndexedDB accesible
  ↓
Permite notificaciones en offline
  ↓
Cachea recursos de la app
  ↓
Sincronización al reconectar
```

## PWA Implementation

### manifest.json
- Define nombre, icono, pantalla de inicio
- Configuración de colores y orientación
- Shortcuts para crear tareas rápidamente
- Screenshots para tiendas de apps

### Service Worker
- Estrategia: Network First, Fall Back to Cache
- Cachea HTML, CSS, JS, iconos
- Mantiene app funcional offline
- Permite notificaciones en background

### next-pwa
- Configura automáticamente el service worker
- Genera manifest.json si no existe
- Maneja el ciclo de vida del SW
- Integración con Next.js Build

## Sistemas de Alertas

### 1. Notificación Push
```javascript
// Mediante Web Notifications API
new Notification("Título", {
  body: "Descripción",
  icon: "url",
  tag: "task-id", // Previene duplicados
  vibrate: [200, 100, 200]
})
```

### 2. Alarma Visual
```
ReminderModal (React Component)
  ├─ Animación de entrada suave
  ├─ Información clara de la tarea
  ├─ Botones: Completar / Posponer / Cerrar
  └─ Auto-cierre en 30 segundos
```

### 3. Sonido
```javascript
Web Audio API
  ├─ Oscilador (800 Hz)
  ├─ Amplitud controlada
  ├─ Duración: 500ms
  └─ Reutilizable
```

## Optimizaciones

### 1. Rendimiento
- Lazy loading de componentes
- Memoización de hooks
- Índices en IndexedDB para búsquedas rápidas
- Compresión de imágenes de fondo

### 2. Almacenamiento
- IndexedDB en lugar de localStorage (mejor para datos complejos)
- Límite de 2-3 MB por imagen
- Compresión JPEG al subir imágenes

### 3. Red
- Service Worker cachea recursos estáticos
- Strategy: Cuando disponible offline, usar cache
- Sincronización automática al reconectar

## Seguridad

- ✅ No hay backend servidor (seguridad por defecto)
- ✅ Datos en dispositivo local solamente
- ✅ Sin envío de información personal a internet
- ✅ HTTPS recomendado para PWA
- ✅ Validación de entrada en formularios

## Testing Manual

### Offline
1. Abre DevTools → Network
2. Throttle a "Offline"
3. Crea una nueva tarea
4. Recarga la página
5. La tarea debe persister

### Notificaciones
1. Ve a Configuración
2. Activa "Notificaciones Push"
3. Crea tarea con recordatorio en 5 minutos
4. Espera la alerta

### PWA Install
1. En Chrome/Edge: Click icono de instalación
2. En iOS: Compartir → Agregar a pantalla de inicio
3. En Android: Menú → Instalar aplicación

## Migración Futura

Para agregar servidor backend:
1. Crear API REST en /api
2. Sincronizar tareas al backend
3. Mantener IndexedDB como cache local
4. Implementar conflictos de sincronización
5. Agregar autenticación

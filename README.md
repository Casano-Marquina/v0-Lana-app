# Mi Agenda - Prioridades de Vida

Una aplicación web progresiva (PWA) moderna, intuitiva y descargable para organizar tu vida en tres ámbitos fundamentales: Personal, Académico/Técnico y Relacional.

## Características

### 🎯 Sistema de Prioridades por Ámbitos
- **Tu Centro (Personal)**: Tareas personales, salud y bienestar
- **Tu Futuro (Académico/Técnico)**: Estudios, trabajo y desarrollo profesional
- **Tu Corazón (Relacional)**: Familia, amigos y relaciones importantes

### 📱 PWA Descargable
- Funciona completamente offline
- Se instala como una aplicación nativa en móvil y escritorio
- Acceso rápido desde la pantalla de inicio
- Sincronización automática

### 🔔 Sistema de Recordatorios Inteligente
- **Notificaciones Push**: Alertas del sistema operativo
- **Alarmas Visuales**: Recordatorios en pantalla
- **Sonidos y Vibraciones**: Alertas multisensoriales configurables
- **Posponer y Completar**: Desde el recordatorio

### 💾 Almacenamiento Local
- **IndexedDB**: Base de datos local sin servidor
- **Privacidad Total**: Tus datos nunca salen de tu dispositivo
- **Funcionamiento Offline**: Trabaja sin internet
- **Sincronización Automática**: Se sincroniza cuando hay conexión

### 🎨 Personalización Visual
- **Fondos Personalizables**: Por ámbito o global
- **Colores Hermosos**: Paletas predefinidas o colores personalizados
- **Imágenes Propias**: Sube tus fotos favoritas
- **Compresión Automática**: Optimización de almacenamiento

### 📅 Planificación y Analítica
- **Vista Diaria**: Enfoque en tareas de hoy
- **Vista Semanal**: Planificación completa de la semana
- **Filtrado Flexible**: Por ámbito, fecha, prioridad o estado
- **Estadísticas**: Seguimiento de progreso

## Cómo Usar

### Primera Vez
1. **Accede a la App**: Abre el navegador y ve a la URL
2. **Instala la PWA**: 
   - En móvil: Busca "Instalar aplicación"
   - En escritorio: Haz clic en el icono de instalación (barra de direcciones)
3. **Autoriza Notificaciones**: Permite notificaciones para recordatorios

### Crear una Tarea
1. Haz clic en el botón **+** en la esquina superior
2. Completa los detalles:
   - **Título**: ¿Qué necesitas hacer?
   - **Descripción**: Detalles adicionales (opcional)
   - **Ámbito**: Selecciona Personal, Académico o Relacional
   - **Prioridad**: Alta, Media o Baja
   - **Fecha y Hora**: Cuándo necesitas hacerlo
   - **Recordatorio**: Configura alertas
3. Haz clic en **Crear Tarea**

### Completar Tareas
- Haz clic en el círculo junto a la tarea para marcarla como completada
- Desliza para eliminar (próximamente)
- Recibe recordatorios automáticos

### Personalizar Fondos
1. Haz clic en el icono de paleta en el header
2. Selecciona colores predefinidos o sube una imagen
3. Personaliza por ámbito o de forma global

### Configuración
1. Haz clic en el icono de engranaje
2. Ajusta:
   - **Notificaciones**: Push, sonidos, vibraciones
   - **Tema**: Claro u oscuro
   - **Preferencias**: Ámbito por defecto

## Instalación para Desarrollo

### Requisitos
- Node.js 18+ y pnpm

### Pasos
```bash
# Clonar el repositorio
git clone <repo-url>
cd mi-agenda

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Abrir en navegador
# http://localhost:3000
```

### Build para Producción
```bash
pnpm run build
pnpm run start
```

## Tecnología

- **Framework**: Next.js 16 con App Router
- **Estilos**: Tailwind CSS
- **Base de Datos**: IndexedDB (local)
- **PWA**: next-pwa
- **Notificaciones**: Web Notifications API
- **UI Components**: Lucide React para iconos

## Estructura del Proyecto

```
app/
├── page.tsx           # Dashboard principal
├── create/           # Crear nueva tarea
├── settings/         # Configuración
├── backgrounds/      # Personalización de fondos
└── weekly/          # Vista semanal

components/
├── TaskCard.tsx      # Tarjeta individual de tarea
├── RealmSelector.tsx # Selector de ámbitos
├── PrioritySelector.tsx
├── ReminderSetup.tsx
├── ReminderModal.tsx
└── BackgroundPicker.tsx

lib/
├── db.ts            # Operaciones IndexedDB
├── realms.ts        # Configuración de ámbitos
├── notifications.ts # API de notificaciones

public/
├── manifest.json    # PWA manifest
├── service-worker.js # Service worker
└── icons/          # Iconos de la app
```

## Datos y Privacidad

- **Sin servidor**: Todos los datos se guardan localmente en tu dispositivo
- **Sin registro**: No necesitas crear cuenta
- **Sin rastreo**: No recopilamos información personal
- **Control total**: Exporta tus datos en cualquier momento

## Funcionalidades Futuras

- Sincronización en la nube (opcional)
- Categorías personalizadas
- Hábitos y rastreadores
- Integración con calendario
- Análisis detallados
- Modo colaborativo

## Compatibilidad

- **Chrome/Edge**: Versión 90+
- **Firefox**: Versión 88+
- **Safari**: iOS 15+
- **Android**: Chrome/Firefox

## Soporte

Para reportar bugs o sugerir características, abre un issue en el repositorio.

## Licencia

MIT

---

**¡Bienvenido a Mi Agenda! Organiza tu vida, prioriza lo que importa, vive plenamente.**

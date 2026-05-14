# Lana OS - Agenda Inteligente de Bienestar

Una aplicacion web progresiva (PWA) de gestion de tiempo y bienestar, pensada para mantener un equilibrio real entre tu vida personal, academica y profesional. Lana, tu companera ovejita, te guia con mensajes contextuales y adapta la experiencia segun tu energia diaria.

---

## Caracteristicas Principales

### Lana - Tu Companera de Bienestar
- **Mascota Inteligente**: Lana cambia su apariencia segun el ambito (gorro verde, azul o rosa)
- **Mensajes Contextuales**: Frases motivacionales adaptadas a tu estado y progreso
- **Consejos Personalizados**: Lana analiza tu balance y ofrece recomendaciones

### Sistema de Energia (Energy Check-in)
- **Check-in Diario**: Al iniciar el dia, Lana pregunta tu nivel de energia
- **Tres Niveles**: Baja, Media, Alta
- **Filtrado Inteligente**: Las tareas se ajustan segun tu energia para prevenir burnout
- **Proteccion de Tareas Pesadas**: Con energia baja, Lana oculta tareas academicas pesadas

### Sistema de Prioridades por Ambitos
- **Tu Centro (Personal)**: Tareas personales, salud y bienestar - Color Verde
- **Tu Futuro (Academico/Tecnico)**: Estudios, trabajo y desarrollo profesional - Color Azul
- **Tu Corazon (Relacional)**: Familia, amigos y relaciones importantes - Color Rosa

### Ovillo Financiero - Gastos con Narrativa de Bienestar
- **Registro Consciente**: En lugar de "categoria", pregunta "A que area de tu vida nutrio esta inversion?"
- **Balance de Energia Financiera**: Grafico circular que muestra distribucion por ambito
- **Modo Transmutar**: Elimina la culpa de gastos ansiosos con validacion de Lana
- **Mensajes de Balance**: Lana comenta si estas invirtiendo mucho en un area especifica

### Wellness Hub - Espacio de Bienestar
- Contenido de relajacion y mindfulness
- Videos de Lana (proximamente)
- Ejercicios de respiracion
- Mini-juegos de bienestar

### PWA Descargable
- Funciona completamente offline
- Se instala como aplicacion nativa en movil y escritorio
- Acceso rapido desde la pantalla de inicio

### Sistema de Recordatorios Inteligente
- **Notificaciones Push**: Alertas del sistema operativo
- **Alarmas Visuales**: Recordatorios en pantalla con modal de Lana
- **Sonidos y Vibraciones**: Alertas configurables
- **Posponer y Completar**: Acciones directas desde el recordatorio

### Almacenamiento Local
- **IndexedDB**: Base de datos local sin servidor
- **Privacidad Total**: Tus datos nunca salen de tu dispositivo
- **Funcionamiento Offline**: Trabaja sin internet

### Personalizacion Visual
- **Fondos Personalizables**: Por ambito o global
- **SoftBackground**: Fondo suave animado con blobs de colores
- **Transiciones de Video**: Videos fullscreen entre navegaciones
- **Temas**: Claro y oscuro

### Exportacion de Reportes
- **Reporte de Lana**: Genera Excel/CSV con analisis de bienestar
- **Auditoria de Balance**: Metricas por ambito y energia
- **Consejo Personalizado**: Lana analiza patrones y genera recomendaciones

---

## Estructura de Navegacion

```
/                   # Dashboard principal con resumen
/realm/[id]         # Vista de tareas por ambito
/create             # Crear nueva tarea
/weekly             # Vista semanal
/expenses           # Ovillo Financiero - Gastos
/wellness           # Hub de Bienestar
/backgrounds        # Personalizacion de fondos
/settings           # Configuracion general
```

---

## Tecnologia

- **Framework**: Next.js 16 con App Router
- **Estilos**: Tailwind CSS v4
- **Base de Datos**: IndexedDB (local)
- **PWA**: next-pwa con Service Worker
- **Notificaciones**: Web Notifications API
- **Graficos**: Recharts (proximamente)
- **Exportacion**: xlsx para reportes Excel
- **UI Components**: Lucide React, shadcn/ui

---

## Estructura del Proyecto

```
app/
├── page.tsx              # Dashboard con LanaAdvice + PendingTasksSummary
├── create/               # Crear nueva tarea
├── realm/[realmId]/      # Vista por ambito
├── weekly/               # Vista semanal
├── expenses/             # Ovillo Financiero
├── wellness/             # Hub de Bienestar
├── backgrounds/          # Fondos personalizables
└── settings/             # Configuracion

components/
├── Lana.tsx              # Mascota con variantes por ambito
├── LanaAdvice.tsx        # Card de consejo de Lana
├── EnergyCheckIn.tsx     # Modal de check-in de energia
├── OvilloFinanciero.tsx  # Sistema de gastos completo
├── PendingTasksSummary.tsx # Resumen de tareas pendientes
├── TaskCard.tsx          # Tarjeta de tarea
├── TaskDetailPanel.tsx   # Panel lateral de detalles
├── ReminderModal.tsx     # Modal de recordatorios
├── SoftBackground.tsx    # Fondo animado suave
├── PageTransition.tsx    # Transiciones de video
├── NavLink.tsx           # Links con transicion
├── ExportReportButton.tsx # Boton de exportacion
└── ...

hooks/
├── useEnergyLevel.ts     # Estado de energia diaria
├── useOvilloFinanciero.ts # Logica de gastos
├── useReminders.ts       # Sistema de recordatorios
├── usePageTransition.ts  # Transiciones entre paginas
└── ...

lib/
├── db.ts                 # Operaciones IndexedDB
├── realms.ts             # Configuracion de ambitos
├── notifications.ts      # API de notificaciones
└── exportLanaReport.ts   # Generacion de reportes

public/
├── images/
│   ├── lana-verde.png    # Lana Personal
│   ├── lana-azul.png     # Lana Academico
│   └── lana-rosa.png     # Lana Relacional
├── videos/
│   ├── transition-1.mp4  # Video transicion 1
│   └── transition-2.mp4  # Video transicion 2
├── manifest.json
└── icons/
```

---

## Instalacion para Desarrollo

### Requisitos
- Node.js 18+ y pnpm

### Pasos
```bash
# Clonar el repositorio
git clone <repo-url>
cd lana-app

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Abrir en navegador
# http://localhost:3000
```

### Build para Produccion
```bash
pnpm run build
pnpm run start
```

---

## Privacidad y Datos

- **Sin servidor**: Todos los datos se guardan localmente
- **Sin registro**: No necesitas crear cuenta
- **Sin rastreo**: No recopilamos informacion personal
- **Control total**: Exporta tus datos en cualquier momento

---

## Roadmap

- [ ] Sincronizacion en la nube (opcional)
- [ ] Mini-juegos de bienestar
- [ ] Ejercicios de respiracion guiados
- [ ] Videos de Lana
- [ ] Integracion con calendario externo
- [ ] Modo colaborativo
- [ ] Analisis avanzados con IA

---

## Compatibilidad

- Chrome/Edge 90+
- Firefox 88+
- Safari iOS 15+
- Android Chrome/Firefox

---

## Licencia

MIT

---

**Creado con carino por Angie para su portafolio SENATI 2026.**

*Lana te acompana en cada paso. Organiza tu vida, prioriza lo que importa, vive plenamente.*

import * as XLSX from 'xlsx';
import { Task } from './db';
import { REALMS } from './realms';

export type EnergyLevel = 'low' | 'medium' | 'high';

export interface EnergyEntry {
  date: string; // ISO date
  level: EnergyLevel;
}

export interface ReportData {
  tasks: Task[];
  energyHistory: EnergyEntry[];
  weekStart: Date;
  weekEnd: Date;
}

const realmNames: Record<string, string> = {
  personal: 'Tu Centro',
  academic: 'Tu Futuro',
  relational: 'Tu Corazón',
};

const priorityLabels: Record<string, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

/**
 * Generates a dynamic Lana advice message based on the report data
 */
function generateLanaAdvice(
  realmDistribution: Record<string, number>,
  averageEnergy: EnergyLevel,
  completedCount: number,
  totalCount: number
): string {
  let advice = '';
  const completionRate = (completedCount / totalCount) * 100;

  // Analyze realm distribution
  const academicPercent = realmDistribution['academic'] || 0;
  const personalPercent = realmDistribution['personal'] || 0;
  const relationalPercent = realmDistribution['relational'] || 0;

  // Base message from Lana
  if (averageEnergy === 'low' && academicPercent > 70) {
    advice = 'Lana nota que tu gorra azul trabajó demasiado con poca energía. El próximo reporte necesita más espacio para tu centro.';
  } else if (averageEnergy === 'low' && relationalPercent < 10) {
    advice = 'Tu corazón ha estado un poco desatendido esta semana. Lana te anima a reservar tiempo para las personas que amas.';
  } else if (averageEnergy === 'high' && completionRate > 80) {
    advice = '¡Increíble! Tu energía alta esta semana resultó en gran productividad. Lana está muy orgullosa de ti.';
  } else if (personalPercent > 60 && averageEnergy === 'medium') {
    advice = 'Buen balance esta semana. Tu centro estuvo bien cuidado. Lana sugiere mantener este equilibrio.';
  } else if (relationalPercent > 50 && completionRate > 70) {
    advice = 'Tu corazón y tu futuro crecieron juntos esta semana. Lana celebra este hermoso balance.';
  } else if (completionRate < 40) {
    advice = 'Algunos días son más difíciles que otros. Lana entiende. Recuerda que el progreso, aunque sea pequeño, sigue siendo progreso.';
  } else {
    advice = 'Otra semana completada. Lana te acompaña en cada paso de tu camino hacia el bienestar integral.';
  }

  return advice;
}

/**
 * Calculates average energy level from history
 */
function calculateAverageEnergy(energyHistory: EnergyEntry[]): EnergyLevel {
  if (energyHistory.length === 0) return 'medium';

  const energyValues = energyHistory.map((e) => {
    if (e.level === 'low') return 1;
    if (e.level === 'medium') return 2;
    return 3;
  });

  const average = energyValues.reduce((a, b) => a + b, 0) / energyValues.length;
  if (average < 1.7) return 'low';
  if (average < 2.4) return 'medium';
  return 'high';
}

/**
 * Calculates the distribution of tasks by realm
 */
function calculateRealmDistribution(
  tasks: Task[]
): Record<string, number> {
  const distribution: Record<string, number> = {
    personal: 0,
    academic: 0,
    relational: 0,
  };

  if (tasks.length === 0) return distribution;

  tasks.forEach((task) => {
    if (distribution[task.realm] !== undefined) {
      distribution[task.realm]++;
    }
  });

  // Convert to percentages
  const total = tasks.length;
  Object.keys(distribution).forEach((realm) => {
    distribution[realm] = Math.round((distribution[realm] / total) * 100);
  });

  return distribution;
}

/**
 * Formats a date to Spanish locale
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Main export function that creates and downloads the Excel report
 */
export function exportLanaReport(data: ReportData): void {
  const { tasks, energyHistory, weekStart, weekEnd } = data;

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // ===== SHEET 1: Task Breakdown =====
  const taskBreakdownData = tasks.map((task) => ({
    Fecha: formatDate(task.dueDate),
    Tarea: task.title,
    Esfera: realmNames[task.realm] || task.realm,
    Prioridad: priorityLabels[task.priority] || task.priority,
    Estado: task.completed ? 'Completada' : 'Pendiente',
  }));

  const taskSheet = XLSX.utils.json_to_sheet(taskBreakdownData);
  
  // Set column widths
  taskSheet['!cols'] = [
    { wch: 12 },
    { wch: 30 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(workbook, taskSheet, 'Desglose de Tareas');

  // ===== SHEET 2: Wellness Summary =====
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const realmDistribution = calculateRealmDistribution(tasks);
  const averageEnergy = calculateAverageEnergy(energyHistory);
  const lanaAdvice = generateLanaAdvice(
    realmDistribution,
    averageEnergy,
    completedCount,
    totalCount
  );

  const summaryData = [
    { Metrica: 'Período de Reporte', Valor: `${formatDate(weekStart.toISOString())} - ${formatDate(weekEnd.toISOString())}` },
    { Metrica: '', Valor: '' },
    { Metrica: '📊 DISTRIBUCIÓN DE TAREAS', Valor: '' },
    { Metrica: 'Tu Centro (Personal)', Valor: `${realmDistribution['personal']}%` },
    { Metrica: 'Tu Futuro (Académico)', Valor: `${realmDistribution['academic']}%` },
    { Metrica: 'Tu Corazón (Relacional)', Valor: `${realmDistribution['relational']}%` },
    { Metrica: '', Valor: '' },
    { Metrica: '⚡ ENERGÍA', Valor: '' },
    { Metrica: 'Energía Promedio de la Semana', Valor: averageEnergy === 'low' ? 'Baja' : averageEnergy === 'medium' ? 'Media' : 'Alta' },
    { Metrica: 'Registros de Energía', Valor: energyHistory.length.toString() },
    { Metrica: '', Valor: '' },
    { Metrica: '✅ PRODUCTIVIDAD', Valor: '' },
    { Metrica: 'Tareas Completadas', Valor: completedCount.toString() },
    { Metrica: 'Tareas Pendientes', Valor: (totalCount - completedCount).toString() },
    { Metrica: 'Tasa de Completitud', Valor: `${Math.round((completedCount / (totalCount || 1)) * 100)}%` },
    { Metrica: '', Valor: '' },
    { Metrica: '💭 CONSEJO DE LANA', Valor: lanaAdvice },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [
    { wch: 35 },
    { wch: 35 },
  ];

  // Style the summary sheet header rows
  const headerRows = [2, 7, 11, 15]; // Indices of section headers
  headerRows.forEach((rowIndex) => {
    const cellAddress = `A${rowIndex + 1}`;
    if (summarySheet[cellAddress]) {
      summarySheet[cellAddress].s = {
        font: { bold: true, sz: 12 },
        fill: { fgColor: { rgb: 'FFD700' } },
      };
    }
  });

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Balance y Bienestar');

  // ===== Download the file =====
  const fileName = `Lana_Reporte_${formatDate(weekStart.toISOString()).replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Export as CSV (alternative to Excel)
 */
export function exportLanaReportAsCSV(data: ReportData): void {
  const { tasks, energyHistory, weekStart, weekEnd } = data;

  let csvContent = 'DESGLOSE DE TAREAS\n';
  csvContent += 'Fecha,Tarea,Esfera,Prioridad,Estado\n';

  tasks.forEach((task) => {
    const row = [
      formatDate(task.dueDate),
      `"${task.title}"`,
      realmNames[task.realm] || task.realm,
      priorityLabels[task.priority] || task.priority,
      task.completed ? 'Completada' : 'Pendiente',
    ];
    csvContent += row.join(',') + '\n';
  });

  csvContent += '\n\n';
  csvContent += 'AUDITORÍA DE BALANCE Y BIENESTAR\n';

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const realmDistribution = calculateRealmDistribution(tasks);
  const averageEnergy = calculateAverageEnergy(energyHistory);
  const lanaAdvice = generateLanaAdvice(
    realmDistribution,
    averageEnergy,
    completedCount,
    totalCount
  );

  csvContent += `Período de Reporte,"${formatDate(weekStart.toISOString())} - ${formatDate(weekEnd.toISOString())}"\n`;
  csvContent += '\n';
  csvContent += 'DISTRIBUCIÓN DE TAREAS\n';
  csvContent += `Tu Centro (Personal),${realmDistribution['personal']}%\n`;
  csvContent += `Tu Futuro (Académico),${realmDistribution['academic']}%\n`;
  csvContent += `Tu Corazón (Relacional),${realmDistribution['relational']}%\n`;
  csvContent += '\n';
  csvContent += 'ENERGÍA\n';
  csvContent += `Energía Promedio de la Semana,"${averageEnergy === 'low' ? 'Baja' : averageEnergy === 'medium' ? 'Media' : 'Alta'}"\n`;
  csvContent += `Registros de Energía,${energyHistory.length}\n`;
  csvContent += '\n';
  csvContent += 'PRODUCTIVIDAD\n';
  csvContent += `Tareas Completadas,${completedCount}\n`;
  csvContent += `Tareas Pendientes,${totalCount - completedCount}\n`;
  csvContent += `Tasa de Completitud,${Math.round((completedCount / (totalCount || 1)) * 100)}%\n`;
  csvContent += '\n';
  csvContent += 'CONSEJO DE LANA\n';
  csvContent += `"${lanaAdvice}"\n`;

  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const fileName = `Lana_Reporte_${formatDate(weekStart.toISOString()).replace(/\//g, '-')}.csv`;
  link.setAttribute('href', URL.createObjectURL(blob));
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
